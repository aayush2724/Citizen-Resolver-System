import fs from "fs";

export const apiErrorHandler = (err, req, res, next) => {
  const errorMsg = `${new Date().toISOString()} - ${err.stack}\n`;
  try {
    fs.appendFileSync("error.log", errorMsg);
  } catch (e) {
    console.error("Failed to write to log file:", e);
  }
  console.error(err.stack);

  const isProd = process.env.NODE_ENV === "production";
  const response = {
    error: isProd ? "Internal Server Error" : (err.message || "Internal Server Error"),
  };

  if (!isProd && err.code) {
    response.code = err.code;
  }

  res.status(500).json(response);
};
