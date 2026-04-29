import pool from "../config/db.js";

export const createEntity = async (req, res, next) => {
  try {
    const { type } = req.params;
    const data = req.body;

    if (type === "areas") {
      await pool.query("INSERT INTO areas (name, zone) VALUES (?, ?)", [data.name, data.zone || "Default"]);
    } else if (type === "departments") {
      await pool.query("INSERT INTO departments (name) VALUES (?)", [data.name]);
    } else if (type === "labour") {
      const [deptRows] = await pool.query("SELECT id FROM departments WHERE name = ?", [data.department]);
      const deptId = deptRows.length > 0 ? deptRows[0].id : 1;
      await pool.query("INSERT INTO labour (name, department_id) VALUES (?, ?)", [data.name, deptId]);
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
