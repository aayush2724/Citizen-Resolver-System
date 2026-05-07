import pool from "../config/db.js";

export const getEntireState = async (req, res, next) => {
  try {
    const [[currentUser]] = await pool.query(
      "SELECT id, name, email, role, city, block FROM users WHERE id = ?",
      [req.user.id],
    );

    const [users] = await pool.query("SELECT id, name, email, role, created_at FROM users");

    const [issues] = await pool.query(`
      SELECT 
        i.id, i.title, i.description, i.image_url as imageUrl, i.status, i.priority, i.created_at, i.updated_at,
        i.sla_hours as slaHours, i.citizen_id as citizenId,
        u.name as citizenName,
        a.name as area,
        d.name as department,
        COALESCE((
          SELECT l.name 
          FROM issue_assignments ia 
          LEFT JOIN labour l ON ia.labour_id = l.id 
          WHERE ia.issue_id = i.id 
          ORDER BY ia.assigned_at DESC 
          LIMIT 1
        ), 'Unassigned') as assignedLabour,
        COALESCE((
          SELECT note 
          FROM issue_assignments 
          WHERE issue_id = i.id 
          ORDER BY assigned_at DESC 
          LIMIT 1
        ), 'Issue received. Waiting for admin review.') as note
      FROM issues i
      LEFT JOIN users u ON i.citizen_id = u.id
      LEFT JOIN areas a ON i.area_id = a.id
      LEFT JOIN departments d ON i.department_id = d.id
      ORDER BY i.created_at DESC
    `);

    import('fs').then(fs => fs.writeFileSync('debug_issue.json', JSON.stringify(issues.find(i => i.id === 7), null, 2)));
    const [areas] = await pool.query("SELECT * FROM areas");
    const [departments] = await pool.query("SELECT * FROM departments");
    const [labour] = await pool.query(`
      SELECT l.id, l.name, l.phone, l.availability_status, d.name as department 
      FROM labour l 
      LEFT JOIN departments d ON l.department_id = d.id
    `);
    const [notifications] = req.user.role === "admin"
      ? await pool.query("SELECT * FROM notifications ORDER BY created_at DESC")
      : await pool.query("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);

    res.json({
      currentUser,
      users,
      issues: issues.map((i) => ({
        ...i,
        id: `CHP-${i.id + 1000}`,
        originalId: i.id,
      })),
      areas,
      departments,
      labour,
      notifications: notifications.map((n) => ({
        ...n,
        read: !!n.read_at,
      })),
    });
  } catch (err) {
    console.error("Error in /api/state:", err);
    res.status(500).json({ error: "Failed to load portal data. Please check backend logs." });
  }
};
