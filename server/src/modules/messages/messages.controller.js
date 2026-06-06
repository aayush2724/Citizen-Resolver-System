import pool from "../../shared/config/db.js";

export const getIssueMessages = async (req, res, next) => {
  try {
    const { issueId } = req.params;
    const asNumber = parseInt(issueId.replace(/^CHP-/i, ""), 10);
    let actualId;
    if (String(issueId).toUpperCase().startsWith("CHP-")) {
      actualId = asNumber - 1000;
    } else if (!Number.isNaN(asNumber)) {
      actualId = asNumber >= 1000 ? asNumber - 1000 : asNumber;
    } else {
      return res.status(400).json({ error: `Invalid issue id: ${issueId}` });
    }

    if (actualId < 1) return res.status(404).json({ error: `Issue not found: ${issueId}` });

    // Authorization: only citizen who owns issue or admin can view
    const [issueRows] = await pool.query("SELECT citizen_id FROM issues WHERE id = ?", [actualId]);
    if (issueRows.length === 0) {
      return res.status(404).json({ error: `Issue not found: ${issueId}` });
    }
    const isOwner = issueRows[0].citizen_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Not authorized to view this conversation" });
    }

    const [messages] = await pool.query(`
      SELECT 
        m.id, m.message, m.created_at, m.sender_id,
        u.name as senderName, u.role as senderRole
      FROM issue_messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.issue_id = ?
      ORDER BY m.created_at ASC
    `, [actualId]);

    res.json(messages);
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { issueId } = req.params;
    const { message } = req.body;
    const asNumber = parseInt(issueId.replace(/^CHP-/i, ""), 10);
    let actualId;
    if (String(issueId).toUpperCase().startsWith("CHP-")) {
      actualId = asNumber - 1000;
    } else if (!Number.isNaN(asNumber)) {
      actualId = asNumber >= 1000 ? asNumber - 1000 : asNumber;
    } else {
      return res.status(400).json({ error: `Invalid issue id: ${issueId}` });
    }

    if (actualId < 1) return res.status(404).json({ error: `Issue not found: ${issueId}` });

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message content is required" });
    }

    // Ensure the referenced issue exists before inserting message
    const [issueExists] = await pool.query("SELECT id, citizen_id FROM issues WHERE id = ?", [actualId]);
    if (issueExists.length === 0) {
      return res.status(404).json({ error: `Issue ${issueId} not found` });
    }

    // Authorization: only citizen who owns issue or admin can message
    const isOwner = issueExists[0].citizen_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Not authorized to message on this issue" });
    }

    const [result] = await pool.query(
      "INSERT INTO issue_messages (issue_id, sender_id, message) VALUES (?, ?, ?)",
      [actualId, req.user.id, message.trim()]
    );

    // Notify the other party
    const issue = issueExists[0];
    const isSenderAdmin = req.user.role === 'admin';
    
    if (isSenderAdmin) {
      await pool.query(
        "INSERT INTO notifications (user_id, issue_id, title, body) VALUES (?, ?, ?, ?)",
        [issue.citizen_id, actualId, `Message from Admin`, `Admin replied to your issue: ${message.substring(0, 50)}...`]
      );
    } else {
      const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin'");
      const notificationValues = admins.map(a => [
        a.id, actualId, `Citizen Reply`, `${req.user.name}: ${message.substring(0, 50)}...`
      ]);
      if (notificationValues.length > 0) {
        await pool.query("INSERT INTO notifications (user_id, issue_id, title, body) VALUES ?", [notificationValues]);
      }
    }

    res.json({ id: result.insertId, message, created_at: new Date() });
  } catch (err) {
    next(err);
  }
};
