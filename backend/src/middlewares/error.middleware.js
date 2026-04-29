import fs from "fs";

export const apiErrorHandler = (err, req, res, next) => {
  const errorMsg = `${new Date().toISOString()} - ${err.stack}\n`;
  try {
    fs.appendFileSync("error.log", errorMsg);
  } catch (e) {
    console.error("Failed to write to log file:", e);
  }
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal Server Error" });
};
