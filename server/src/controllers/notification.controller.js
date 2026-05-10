import pool from "../config/db.js";

export const markNotificationRead = async (req, res, next) => {
  try {
    await pool.query(
      "UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
