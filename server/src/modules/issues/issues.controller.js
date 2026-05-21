import pool from "../../shared/config/db.js";
import { classifyIssue } from "../../shared/utils/aiClassifier.js";

let _io = null;
export const setIo = (io) => { _io = io; };

function emitToUser(userId, event, data) {
  if (_io) _io.to(`user:${userId}`).emit(event, data);
}

export const createIssue = async (req, res, next) => {
  try {
    const { title, description, imageUrl, priority, department, area, lat, lng } = req.body;

    if (!title?.trim()) return res.status(400).json({ error: "Title is required" });
    if (!description?.trim()) return res.status(400).json({ error: "Description is required" });

    const [areaRows] = await pool.query("SELECT id FROM areas WHERE name = ?", [area]);
    const areaId = areaRows.length > 0 ? areaRows[0].id : 1;

    let deptId = null;
    if (department) {
      const [deptRows] = await pool.query("SELECT id FROM departments WHERE name = ?", [department]);
      deptId = deptRows.length > 0 ? deptRows[0].id : null;
    }

    // AI classification
    const aiResult = classifyIssue(title, description);

    const [result] = await pool.query(
      "INSERT INTO issues (citizen_id, area_id, department_id, title, description, image_url, priority, lat, lng, ai_department, ai_confidence) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [req.user.id, areaId, deptId, title, description, imageUrl || null, priority || "Normal",
       lat || null, lng || null, aiResult.department, aiResult.confidence]
    );

    const issueId = result.insertId;

    const notifTitle = `CVR-${issueId + 1000} submitted`;
    const notifBody = "Your report has entered the admin review queue.";

    await pool.query(
      "INSERT INTO notifications (user_id, issue_id, title, body) VALUES (?, ?, ?, ?)",
      [req.user.id, issueId, notifTitle, notifBody]
    );

    // Emit real-time notification to citizen
    emitToUser(req.user.id, "notification", { title: notifTitle, body: notifBody });

    const [adminUsers] = await pool.query("SELECT id FROM users WHERE role = 'admin'");
    if (adminUsers.length > 0) {
      const adminValues = adminUsers.map(admin => [
        admin.id, issueId, `New Issue: CVR-${issueId + 1000}`, `A new issue "${title}" has been submitted.`
      ]);
      await pool.query(
        "INSERT INTO notifications (user_id, issue_id, title, body) VALUES ?",
        [adminValues]
      );
      // Emit real-time to all admins
      adminUsers.forEach(admin => {
        emitToUser(admin.id, "notification", {
          title: `New Issue: CVR-${issueId + 1000}`,
          body: `A new issue "${title}" has been submitted.`,
        });
      });
    }

    res.json({ id: `CVR-${issueId + 1000}` });
  } catch (err) {
    next(err);
  }
};

export const updateIssue = async (req, res, next) => {
  try {
    let issueIdStr = req.params.id;
    // Support both old CHP- and new CVR- prefixes
    let actualId = parseInt(issueIdStr.replace(/^(CHP|CVR)-/i, "")) - 1000;

    if (isNaN(actualId) || actualId < 1) {
      return res.status(400).json({ error: `Invalid issue ID: ${issueIdStr}` });
    }

    const { status, department, assignedLabour, labourId: incomingLabourId, note, adminNote } = req.body;
    const finalNote = note || adminNote;

    let deptId = null;
    if (department) {
      const [deptRows] = await pool.query("SELECT id FROM departments WHERE name = ?", [department]);
      if (deptRows.length > 0) deptId = deptRows[0].id;
    }

    let labourId = incomingLabourId || null;
    if (!labourId && assignedLabour && assignedLabour !== "Unassigned") {
      const [labourRows] = await pool.query("SELECT id FROM labour WHERE name = ?", [assignedLabour]);
      if (labourRows.length > 0) labourId = labourRows[0].id;
    }

    if (status === "Completed") {
      const [issueRows] = await pool.query(
        "SELECT citizen_id, department_id FROM issues WHERE id = ?", [actualId]
      );
      if (issueRows.length === 0) return res.status(404).json({ error: `Issue ${issueIdStr} not found` });

      const existingIssue = issueRows[0];
      const finalDeptId = deptId || existingIssue.department_id;

      if (finalDeptId) {
        await pool.query(
          "INSERT INTO issue_assignments (issue_id, department_id, labour_id, assigned_by, note, assigned_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
          [actualId, finalDeptId, labourId, req.user.id, finalNote || null]
        );
      }

      const completedTitle = `CVR-${actualId + 1000} Completed`;
      const completedBody = finalNote || "Your issue has been completed and removed from the active queue.";
      await pool.query(
        "INSERT INTO notifications (user_id, issue_id, title, body) VALUES (?, NULL, ?, ?)",
        [existingIssue.citizen_id, completedTitle, completedBody]
      );
      emitToUser(existingIssue.citizen_id, "notification", { title: completedTitle, body: completedBody });

      await pool.query("DELETE FROM issues WHERE id = ?", [actualId]);
      return res.json({ success: true, deleted: true });
    }

    let updateResult;
    if (deptId) {
      [updateResult] = await pool.query(
        "UPDATE issues SET status = COALESCE(?, status), department_id = COALESCE(?, department_id) WHERE id = ?",
        [status || null, deptId, actualId]
      );
    } else {
      [updateResult] = await pool.query(
        "UPDATE issues SET status = COALESCE(?, status) WHERE id = ?",
        [status || null, actualId]
      );
    }

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: `Issue ${issueIdStr} not found` });
    }

    let finalDeptId = deptId;
    if (!finalDeptId) {
      const [existing] = await pool.query("SELECT department_id FROM issues WHERE id = ?", [actualId]);
      if (existing.length > 0) finalDeptId = existing[0].department_id;
    }

    if (finalDeptId) {
      await pool.query(
        "INSERT INTO issue_assignments (issue_id, department_id, labour_id, assigned_by, note, assigned_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
        [actualId, finalDeptId, labourId, req.user.id, finalNote || null]
      );
    }

    const [issueRows] = await pool.query("SELECT citizen_id FROM issues WHERE id = ?", [actualId]);
    if (issueRows.length > 0) {
      const notifTitle = `CVR-${actualId + 1000} updated`;
      const notifBody = finalNote || `Status changed to ${status}`;
      await pool.query(
        "INSERT INTO notifications (user_id, issue_id, title, body) VALUES (?, ?, ?, ?)",
        [issueRows[0].citizen_id, actualId, notifTitle, notifBody]
      );
      emitToUser(issueRows[0].citizen_id, "notification", { title: notifTitle, body: notifBody });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
