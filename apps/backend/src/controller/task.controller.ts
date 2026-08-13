import { type Request, type Response } from "express";
import { pool } from "../database/db.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// CREATE
export const createTask = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return res
        .status(400)
        .json({ error: "Field 'name' is required and must be a string" });
    }

    const result = await pool.query(
      "INSERT INTO task (name) VALUES ($1) RETURNING *",
      [name],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create task" });
  }
};

// READ ALL
export const getTasks = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM task ORDER BY created_at DESC",
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

// READ ONE
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !UUID_REGEX.test(id)) {
      return res.status(400).json({ error: "Invalid task id" });
    }

    const result = await pool.query("SELECT * FROM task WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch task" });
  }
};

// UPDATE
export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (typeof id !== "string" || !UUID_REGEX.test(id)) {
      return res.status(400).json({ error: "Invalid task id" });
    }

    if (!name || typeof name !== "string") {
      return res
        .status(400)
        .json({ error: "Field 'name' is required and must be a string" });
    }

    const result = await pool.query(
      "UPDATE task SET name = $1 WHERE id = $2 RETURNING *",
      [name, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update task" });
  }
};

// DELETE
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || !UUID_REGEX.test(id)) {
      return res.status(400).json({ error: "Invalid task id" });
    }

    const result = await pool.query(
      "DELETE FROM task WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete task" });
  }
};
