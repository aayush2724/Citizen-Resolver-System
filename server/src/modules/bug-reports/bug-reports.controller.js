import pool from "../../shared/config/db.js";

export const submitBugReport = async (req, res, next) => {
  try {
    const { category, subject, description, email } = req.body;
    if (!subject?.trim() || !description?.trim()) {
      return res.status(400).json({ error: "Subject and description are required" });
    }

    const userId = req.user?.id || null;
    const contactEmail = email?.trim() || null;

    await pool.query(
      "INSERT INTO bug_reports (user_id, category, subject, description, contact_email) VALUES (?, ?, ?, ?, ?)",
      [userId, category || "general", subject.trim(), description.trim(), contactEmail]
    );

    res.status(201).json({ success: true, message: "Bug report submitted. Thank you!" });
  } catch (err) {
    next(err);
  }
};

export const getBugReports = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT br.*, u.name as reporter_name, u.email as reporter_email
      FROM bug_reports br
      LEFT JOIN users u ON br.user_id = u.id
      ORDER BY br.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
