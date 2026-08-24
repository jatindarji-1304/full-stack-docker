import express from "express";
import cors from "cors";
import { pool } from "./database/db.js";
import "dotenv/config";
import taskroutes from "./routes/task.routes.js";
const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));
app.get("/", (_req, res) => {
  res.json({
    message: "API is working",
  });
});

app.get("/health", async (_, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "healthy",
      database: "connected",
    });
  } catch {
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
    });
  }
});
app.use("/tasks", taskroutes);
app.get("/feat2", async (_, res) => {
  return res.json({ data: "hello world" });
});
export default app;

