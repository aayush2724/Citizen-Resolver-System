import pool from "../config/db.js";

export const createIssue = async (req, res, next) => {
  try {
    const { title, description, imageUrl, priority, department, area } = req.body;

    const [areaRows] = await pool.query("SELECT id FROM areas WHERE name = ?", [area]);
    const areaId = areaRows.length > 0 ? areaRows[0].id : 1; 

    let deptId = null;
    if (department) {
      const [deptRows] = await pool.query("SELECT id FROM departments WHERE name = ?", [department]);
      deptId = deptRows.length > 0 ? deptRows[0].id : null;
    }

    const [result] = await pool.query(
      "INSERT INTO issues (citizen_id, area_id, department_id, title, description, image_url, priority) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [req.user.id, areaId, deptId, title, description, imageUrl, priority]
    );

    await pool.query(
      "INSERT INTO notifications (user_id, issue_id, title, body) VALUES (?, ?, ?, ?)",
      [
        req.user.id,
        result.insertId,
        `CHP-${result.insertId + 1000} submitted`,
        "Your report has entered the admin review queue.",
      ]
    );

    res.json({ id: `CHP-${result.insertId + 1000}` });
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

    const { status, department, assignedLabour, note } = req.body;

    let deptId = null;
    if (department) {
      const [deptRows] = await pool.query("SELECT id FROM departments WHERE name = ?", [department]);
      if (deptRows.length > 0) {
        deptId = deptRows[0].id;
      }
    }

    let labourId = null;
    if (assignedLabour) {
      const labourQuery = deptId
        ? "SELECT id FROM labour WHERE name = ? AND department_id = ?"
        : "SELECT id FROM labour WHERE name = ?";
      const labourParams = deptId ? [assignedLabour, deptId] : [assignedLabour];
      const [labourRows] = await pool.query(labourQuery, labourParams);
      if (labourRows.length > 0) {
        labourId = labourRows[0].id;
      }
    }

    if (deptId) {
      await pool.query("UPDATE issues SET status = ?, department_id = ? WHERE id = ?", [status, deptId, actualId]);
    } else {
      await pool.query("UPDATE issues SET status = ? WHERE id = ?", [status, actualId]);
    }

    if (labourId && deptId) {
      await pool.query(
        "INSERT INTO issue_assignments (issue_id, department_id, labour_id, assigned_by, note, assigned_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
        [actualId, deptId, labourId, req.user.id, note || null]
      );
    }

    const [issueRows] = await pool.query("SELECT citizen_id FROM issues WHERE id = ?", [actualId]);
    if (issueRows.length > 0) {
      await pool.query(
        "INSERT INTO notifications (user_id, issue_id, title, body) VALUES (?, ?, ?, ?)",
        [
          issueRows[0].citizen_id,
          actualId,
          `CHP-${actualId + 1000} updated`,
          note || `Status changed to ${status}`,
        ]
      );
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
