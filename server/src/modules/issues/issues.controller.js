import pool from "../../shared/config/db.js";

const VALID_PRIORITIES = ["Normal", "High", "Urgent"];
const VALID_STATUSES = ["Pending", "Assigned", "In Progress", "Resolved", "Completed", "Rejected"];

const validateEnum = (value, validValues, fieldName) => {
  if (value && !validValues.includes(value)) {
    return new Error(`${fieldName} must be one of: ${validValues.join(", ")}`);
  }
  return null;
};

export const createIssue = async (req, res, next) => {
  try {
    const { title, description, imageUrl, priority, department, area, gpsLat, gpsLng } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!description?.trim()) {
      return res.status(400).json({ error: "Description is required" });
    }
    if (!area?.trim()) {
      return res.status(400).json({ error: "Area is required" });
    }
    if (!department?.trim()) {
      return res.status(400).json({ error: "Department is required" });
    }

    const priorityError = validateEnum(priority, VALID_PRIORITIES, "Priority");
    if (priorityError) return res.status(400).json({ error: priorityError.message });

    const [areaRows] = await pool.query("SELECT id FROM areas WHERE name = ?", [area]);
    const areaId = areaRows.length > 0 ? areaRows[0].id : null;
    if (!areaId) {
      return res.status(400).json({ error: "Invalid area selected" });
    }

    let deptId = null;
    if (department) {
      const [deptRows] = await pool.query("SELECT id FROM departments WHERE name = ?", [department]);
      deptId = deptRows.length > 0 ? deptRows[0].id : null;
    }

    const [result] = await pool.query(
      "INSERT INTO issues (citizen_id, area_id, department_id, title, description, image_url, priority, gps_lat, gps_lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [req.user.id, areaId, deptId, title.trim(), description.trim(), imageUrl || null, priority || "Normal", gpsLat || null, gpsLng || null]
    );

    const issueDisplayId = `CHP-${result.insertId + 1000}`;

    await pool.query(
      "INSERT INTO notifications (user_id, issue_id, title, body) VALUES (?, ?, ?, ?)",
      [
        req.user.id,
        result.insertId,
        `${issueDisplayId} submitted`,
        "Your report has entered the admin review queue.",
      ]
    );

    const [adminUsers] = await pool.query("SELECT id FROM users WHERE role = 'admin'");
    if (adminUsers.length > 0) {
      const adminValues = adminUsers.map(admin => [
        admin.id,
        result.insertId,
        `New Issue: ${issueDisplayId}`,
        `A new issue "${title}" has been submitted.`
      ]);
      await pool.query(
        "INSERT INTO notifications (user_id, issue_id, title, body) VALUES ?",
        [adminValues]
      );
    }

    await pool.query(
      "INSERT INTO audit_logs (issue_id, actor_id, action, old_value, new_value) VALUES (?, ?, 'create', NULL, ?)",
      [result.insertId, req.user.id, JSON.stringify({ title, description, priority, department, area })]
    );

    res.json({ id: issueDisplayId });
  } catch (err) {
    next(err);
  }
};

export const updateIssue = async (req, res, next) => {
  try {
    let issueIdStr = req.params.id;
    let actualId = parseInt(issueIdStr.replace("CHP-", "")) - 1000;

    if (isNaN(actualId) || actualId < 1) {
      return res.status(400).json({ error: `Invalid issue ID: ${issueIdStr}` });
    }

    // Authorization check - only admin or citizen who owns the issue can update
    const [issueOwner] = await pool.query("SELECT citizen_id, status FROM issues WHERE id = ?", [actualId]);
    if (issueOwner.length === 0) {
      return res.status(404).json({ error: `Issue ${issueIdStr} not found` });
    }

    const isOwner = issueOwner[0].citizen_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Not authorized to update this issue" });
    }

    const { status, department, assignedLabour, labourId: incomingLabourId, note, adminNote } = req.body;
    const finalNote = note || adminNote;

    // Validate status
    const statusError = validateEnum(status, VALID_STATUSES, "Status");
    if (statusError) return res.status(400).json({ error: statusError.message });

    let deptId = null;
    if (department) {
      const [deptRows] = await pool.query("SELECT id FROM departments WHERE name = ?", [department]);
      if (deptRows.length > 0) {
        deptId = deptRows[0].id;
      }
    }

    let labourId = incomingLabourId || null;
    if (!labourId && assignedLabour && assignedLabour !== "Unassigned") {
      const [labourRows] = await pool.query("SELECT id FROM labour WHERE name = ?", [assignedLabour]);
      if (labourRows.length > 0) {
        labourId = labourRows[0].id;
      }
    }

    // Get existing values for audit
    const [oldIssue] = await pool.query("SELECT status, department_id FROM issues WHERE id = ?", [actualId]);
    const oldStatus = oldIssue[0]?.status;
    const oldDeptId = oldIssue[0]?.department_id;

    // For citizens, only allow status updates for feedback on completed issues
    const citizenUpdate = !isAdmin;
    if (citizenUpdate) {
      // Citizens can only update to 'Completed' (for feedback) or send messages
      if (status && status !== 'Completed' && status !== oldStatus) {
        return res.status(403).json({ error: "Citizens can only mark issues as completed for feedback" });
      }
    }

    let updateResult;
    if (deptId !== undefined && deptId !== null) {
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

    // Determine final department for assignment record
    let finalDeptId = deptId;
    if (finalDeptId === undefined || finalDeptId === null) {
      const [existingIssue] = await pool.query("SELECT department_id FROM issues WHERE id = ?", [actualId]);
      if (existingIssue.length > 0) finalDeptId = existingIssue[0].department_id;
    }

    // Create assignment record if department or labour changed
    if (finalDeptId && (labourId || finalNote)) {
      await pool.query(
        "INSERT INTO issue_assignments (issue_id, department_id, labour_id, assigned_by, note, assigned_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
        [actualId, finalDeptId, labourId, req.user.id, finalNote || null]
      );
    }

    // Audit log
    await pool.query(
      "INSERT INTO audit_logs (issue_id, actor_id, action, old_value, new_value, note) VALUES (?, ?, 'update', ?, ?, ?)",
      [actualId, req.user.id, JSON.stringify({ status: oldStatus, department_id: oldDeptId }), JSON.stringify({ status, department_id: finalDeptId }), finalNote]
    );

    // Notification to citizen (if admin updated)
    if (isAdmin && issueOwner.length > 0) {
      await pool.query(
        "INSERT INTO notifications (user_id, issue_id, title, body) VALUES (?, ?, ?, ?)",
        [
          issueOwner[0].citizen_id,
          actualId,
          `${issueIdStr} updated`,
          finalNote || `Status changed to ${status}`,
        ]
      );
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
