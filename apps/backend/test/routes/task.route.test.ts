import request from "supertest";
import app from "../../src/app.js";
import { pool } from "../../src/database/db.js";

jest.mock("../../src/database/db", () => ({
  __esModule: true,
  pool: { query: jest.fn() },
}));

const mocked_pool = pool as jest.Mocked<typeof pool>;

describe("Task Routes", () => {
  beforeEach(() => {
    (mocked_pool.query as jest.Mock).mockReset();
  });
  describe("POST /tasks", () => {
    test("should create a task when valid data is entered.", async () => {
      (mocked_pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: "057591ef-fa4f-4a32-8cb5-02c3c7b371dc",
            name: "Task 01",
            created_at: new Date(),
          },
        ],
      });
      const res = await request(app).post("/tasks").send({
        name: "Task 01",
      });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.name).toBe("Task 01");
    });

    test("should return 400 when task name is missing", async () => {
      const res = await request(app).post("/tasks").send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: "Field 'name' is required and must be a string",
      });
    });

    test("should return 400 when task name is not string", async () => {
      const res = await request(app).post("/tasks").send({
        name: 123,
      });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: "Field 'name' is required and must be a string",
      });
    });

    test("should retrun 400 when task name is empty string", async () => {
      const res = await request(app).post("/tasks").send({
        name: "",
      });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: "Field 'name' is required and must be a string",
      });
    });
  });

  describe("GET /tasks", () => {
    test("should return all the tasks", async () => {
      (mocked_pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: "057591ef-fa4f-4a32-8cb5-02c3c7b371dc",
            name: "Task 01",
            created_at: new Date(),
          },
          {
            id: "057591ef-fa4f-4a32-8cb5-02c3c7b371cd",
            name: "Task 02",
            created_at: new Date(),
          },
        ],
      });
      const res = await request(app).get("/tasks");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("should return empty array when there is no task", async () => {
      (mocked_pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [],
      });
      const res = await request(app).get("/tasks");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /tasks/:id", () => {
    test("should reqturn valid task with a valid id", async () => {
      (mocked_pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: "057591ef-fa4f-4a32-8cb5-02c3c7b371dc",
            name: "Task 01",
            created_at: new Date(),
          },
          {
            id: "057591ef-fa4f-4a32-8cb5-02c3c7b371cd",
            name: "Task 02",
            created_at: new Date(),
          },
        ],
      });
      const id = "057591ef-fa4f-4a32-8cb5-02c3c7b371dc";
      const res = await request(app).get(`/tasks/${id}`);
      expect([200, 404]).toContain(res.status);
    });

    test("should return 400 when there is invalid UUID", async () => {
      (mocked_pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: "057591ef-fa4f-4a32-8cb5-02c3c7b371dc",
            name: "Task 01",
            created_at: new Date(),
          },
          {
            id: "057591ef-fa4f-4a32-8cb5-02c3c7b371cd",
            name: "Task 02",
            created_at: new Date(),
          },
        ],
      });
      const id = "057591ef-fa4f-4a32-8cb5-02c3cc";
      const res = await request(app).get(`/tasks/${id}`);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: "Invalid task id",
      });
    });

    test("should reqturn 404 when task does not exist", async () => {
      (mocked_pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [],
      });
      const id = "00000000-0000-0000-0000-000000000000";
      const res = await request(app).get(`/tasks/${id}`);
      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        error: "Task not found",
      });
    });
  });

  describe("PUT /tasks/:id", () => {
    test("should update a task with valid UUID", async () => {
      (mocked_pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: "057591ef-fa4f-4a32-8cb5-02c3c7b371dc",
            name: "Task 01",
            created_at: new Date(),
          },
          {
            id: "057591ef-fa4f-4a32-8cb5-02c3c7b371cd",
            name: "Task 02",
            created_at: new Date(),
          },
        ],
      });
      const id = "057591ef-fa4f-4a32-8cb5-02c3c7b371dc";
      const res = await request(app).put(`/tasks/${id}`).send({
        name: "Updated Task ",
      });
      expect([200, 404]).toContain(res.status);
    });

    test("should return 400 if UUID is invalid", async () => {
      (mocked_pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: "057591ef-fa4f-4a32-8cb5-02c3c7b371dc",
            name: "Task 01",
            created_at: new Date(),
          },
          {
            id: "057591ef-fa4f-4a32-8cb5-02c3c7b371cd",
            name: "Task 02",
            created_at: new Date(),
          },
        ],
      });
      const id = "057591ef-fa4f-4a32-8cb5-02c3cc";
      const res = await request(app).put(`/tasks/${id}`).send({
        name: "Updated Task",
      });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: "Invalid task id",
      });
    });

    test("should return 400 if task name is missing", async () => {
      (mocked_pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: "057591ef-fa4f-4a32-8cb5-02c3c7b371dc",
            name: "Task 01",
            created_at: new Date(),
          },
          {
            id: "057591ef-fa4f-4a32-8cb5-02c3c7b371cd",
            name: "Task 02",
            created_at: new Date(),
          },
        ],
      });
      const id = "057591ef-fa4f-4a32-8cb5-02c3c7b371dc";
      const res = await request(app).put(`/tasks/${id}`).send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: "Field 'name' is required and must be a string",
      });
    });

    test("should retrun 400 if task name is not string", async () => {
      (mocked_pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: "057591ef-fa4f-4a32-8cb5-02c3c7b371dc",
            name: "Task 01",
            created_at: new Date(),
          },
          {
            id: "057591ef-fa4f-4a32-8cb5-02c3c7b371cd",
            name: "Task 02",
            created_at: new Date(),
          },
        ],
      });
      const id = "057591ef-fa4f-4a32-8cb5-02c3c7b371dc";
      const res = await request(app).put(`/tasks/${id}`).send({
        name: 123,
      });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: "Field 'name' is required and must be a string",
      });
    });

    test("should return 404 when task does not exist", async () => {
      (mocked_pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [],
      });
      const id = "00000000-0000-0000-0000-000000000000";
      const res = await request(app).put(`/tasks/${id}`).send({
        name: "Updated Task with wrong UUID",
      });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        error: "Task not found",
      });
    });
  });

  describe("DELETE /tasks/:id", () => {
    test("should delete a task with valid UUID", async () => {
      (mocked_pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: "e0a6fd69-e596-4c9e-b324-2b545d97deec",
            name: "Task 01",
            created_at: new Date(),
          },
          {
            id: "057591ef-fa4f-4a32-8cb5-02c3c7b371cd",
            name: "Task 02",
            created_at: new Date(),
          },
        ],
      });
      const id = "e0a6fd69-e596-4c9e-b324-2b545d97deec";
      const res = await request(app).delete(`/tasks/${id}`);
      expect([200, 404]).toContain(res.status);
    });

    test("should return 400 if UUID is invalid", async () => {
      (mocked_pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: "e0a6fd69-e596-4c9e-b324-2b545d97deec",
            name: "Task 01",
            created_at: new Date(),
          },
          {
            id: "057591ef-fa4f-4a32-8cb5-02c3c7b371cd",
            name: "Task 02",
            created_at: new Date(),
          },
        ],
      });
      const id = "057591ef-fa4f-4a32-8cb5-02c3cc";
      const res = await request(app).delete(`/tasks/${id}`);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: "Invalid task id",
      });
    });

    test("should return 400 if task id is missing", async () => {
      (mocked_pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: "e0a6fd69-e596-4c9e-b324-2b545d97deec",
            name: "Task 01",
            created_at: new Date(),
          },
          {
            id: "057591ef-fa4f-4a32-8cb5-02c3c7b371cd",
            name: "Task 02",
            created_at: new Date(),
          },
        ],
      });
      const id = "a";
      const res = await request(app).delete(`/tasks/${id}`);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: "Invalid task id",
      });
    });

    test("should return 404 if task not found", async () => {
      (mocked_pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [],
      });
      const id = "00000000-0000-0000-0000-000000000000";
      const res = await request(app).delete(`/tasks/${id}`);
      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        error: "Task not found",
      });
    });
  });
});
