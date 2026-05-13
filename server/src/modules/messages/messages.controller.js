import pool from "../../shared/config/db.js";

export const getIssueMessages = async (req, res, next) => {
  try {
    const { issueId } = req.params;
    const actualId = parseInt(issueId.replace("CHP-", "")) - 1000;

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
    const actualId = parseInt(issueId.replace("CHP-", "")) - 1000;

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message content is required" });
    }

    const [result] = await pool.query(
      "INSERT INTO issue_messages (issue_id, sender_id, message) VALUES (?, ?, ?)",
      [actualId, req.user.id, message]
    );

    // Notify the other party
    const [issueRows] = await pool.query("SELECT citizen_id, title FROM issues WHERE id = ?", [actualId]);
    if (issueRows.length > 0) {
      const issue = issueRows[0];
      const isSenderAdmin = req.user.role === 'admin';
      
      if (isSenderAdmin) {
        // Notify citizen
        await pool.query(
          "INSERT INTO notifications (user_id, issue_id, title, body) VALUES (?, ?, ?, ?)",
          [issue.citizen_id, actualId, `Message from Admin`, `Admin replied to your issue: ${message.substring(0, 50)}...`]
        );
      } else {
        // Notify all admins
        const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin'");
        const notificationValues = admins.map(a => [
          a.id, actualId, `Citizen Reply: CHP-${actualId + 1000}`, `${req.user.name}: ${message.substring(0, 50)}...`
        ]);
        if (notificationValues.length > 0) {
          await pool.query("INSERT INTO notifications (user_id, issue_id, title, body) VALUES ?", [notificationValues]);
        }
      }
    }

    res.json({ id: result.insertId, message, created_at: new Date() });
  } catch (err) {
    next(err);
  }
};
