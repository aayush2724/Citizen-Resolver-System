import pool from "../../shared/config/db.js";

export const getAnalytics = async (req, res, next) => {
  try {
    const [byStatus] = await pool.query(`
      SELECT status, COUNT(*) as count FROM issues GROUP BY status
    `);

    const [byDepartment] = await pool.query(`
      SELECT d.name as department, COUNT(i.id) as count
      FROM issues i LEFT JOIN departments d ON i.department_id = d.id
      GROUP BY d.name
    `);

    const [byPriority] = await pool.query(`
      SELECT priority, COUNT(*) as count FROM issues GROUP BY priority
    `);

    const [byArea] = await pool.query(`
      SELECT a.name as area, COUNT(i.id) as count
      FROM issues i LEFT JOIN areas a ON i.area_id = a.id
      GROUP BY a.name ORDER BY count DESC LIMIT 10
    `);

    const [timeline] = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM issues
      WHERE created_at >= DATE('now', '-30 days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    const [resolvedStats] = await pool.query(`
      SELECT COUNT(*) as total FROM notifications
      WHERE title LIKE '% Completed'
    `);

    const [activeCount] = await pool.query(`
      SELECT COUNT(*) as total FROM issues WHERE status != 'Resolved'
    `);

    const [topDepts] = await pool.query(`
      SELECT d.name as department, COUNT(i.id) as count,
        SUM(CASE WHEN i.status = 'Resolved' THEN 1 ELSE 0 END) as resolved
      FROM issues i LEFT JOIN departments d ON i.department_id = d.id
      WHERE d.name IS NOT NULL
      GROUP BY d.name ORDER BY count DESC LIMIT 6
    `);

    const [urgentCount] = await pool.query(`
      SELECT COUNT(*) as total FROM issues WHERE priority = 'Urgent'
    `);

    const [usersCount] = await pool.query(`
      SELECT COUNT(*) as total FROM users WHERE role = 'citizen'
    `);

    res.json({
      byStatus,
      byDepartment,
      byPriority,
      byArea,
      timeline,
      totalResolved: resolvedStats[0]?.total || 0,
      totalActive: activeCount[0]?.total || 0,
      topDepts,
      urgentIssues: urgentCount[0]?.total || 0,
      citizenCount: usersCount[0]?.total || 0,
    });
  } catch (err) {
    next(err);
  }
};
