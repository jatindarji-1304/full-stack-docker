import { Router } from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controller/task.controller.js";
import {
  createRequestRateLimit,
  deleteRequestRateLimit,
  getRequestRateLimit,
  updateRequestRateLimit,
} from "../middleware/rate_limit.middleware.js";

const router = Router();

router.post("/", createRequestRateLimit, createTask);
router.get("/", getRequestRateLimit, getTasks);
router.get("/:id", getRequestRateLimit, getTaskById);
router.put("/:id", updateRequestRateLimit, updateTask);
router.delete("/:id", deleteRequestRateLimit, deleteTask);

export default router;
