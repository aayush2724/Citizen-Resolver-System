import pool from "../../shared/config/db.js";

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
        i.sla_hours as slaHours, i.citizen_id as citizenId, i.gps_lat as gpsLat, i.gps_lng as gpsLng,
        u.name as citizenName,
        a.name as area,
        d.name as department
      FROM issues i
      LEFT JOIN users u ON i.citizen_id = u.id
      LEFT JOIN areas a ON i.area_id = a.id
      LEFT JOIN departments d ON i.department_id = d.id
      ORDER BY i.created_at DESC
    `);

    // Fetch all assignments for all issues to build history
    const [assignments] = await pool.query(`
      SELECT 
        ia.issue_id, ia.assigned_at, ia.note, 
        l.name as labourName, l.phone as labourPhone, u.name as adminName
      FROM issue_assignments ia
      LEFT JOIN labour l ON ia.labour_id = l.id
      LEFT JOIN users u ON ia.assigned_by = u.id
      ORDER BY ia.assigned_at DESC
    `);

    const [areas] = await pool.query("SELECT * FROM areas");
    const [departments] = await pool.query("SELECT * FROM departments");
    const [labour] = await pool.query(`
      SELECT l.id, l.name, l.phone, l.availability_status, d.name as department 
      FROM labour l 
      LEFT JOIN departments d ON l.department_id = d.id
    `);
    const [notifications] = await pool.query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );

    const dashboardStats = {
      total: issues.length,
      pending: issues.filter((i) => i.status === "Pending").length,
      inProgress: issues.filter((i) => i.status === "In Progress").length,
      resolved: issues.filter((i) => i.status === "Resolved" || i.status === "Completed").length,
      completed: issues.filter((i) => i.status === "Completed").length,
    };

    res.json({
      currentUser,
      users,
      issues: issues.map((i) => {
        const history = assignments.filter(a => a.issue_id === i.id);
        const latest = history[0] || {};
        return {
          ...i,
          id: `CHP-${i.id + 1000}`,
          originalId: i.id,
          assignedLabour: latest.labourName || null,
          assignedLabourPhone: latest.labourPhone || null,
          note: latest.note || null,
          history: history
        };
      }),
      areas,
      departments,
      labour,
      dashboardStats,
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
