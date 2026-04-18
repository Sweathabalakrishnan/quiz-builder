import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint (public - no auth required)
app.get("/make-server-994e9032/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "Backend server is running"
  });
});

// Quiz endpoints
app.get("/make-server-994e9032/quizzes", async (c) => {
  try {
    const quizzes = await kv.getByPrefix("quiz:");
    return c.json(quizzes || []);
  } catch (error) {
    console.log("Error fetching quizzes:", error);
    return c.json({ error: error.message }, 500);
  }
});

app.get("/make-server-994e9032/quizzes/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const quiz = await kv.get(`quiz:${id}`);
    if (!quiz) {
      return c.json({ error: "Quiz not found" }, 404);
    }
    return c.json(quiz);
  } catch (error) {
    console.log("Error fetching quiz:", error);
    return c.json({ error: error.message }, 500);
  }
});

app.post("/make-server-994e9032/quizzes", async (c) => {
  try {
    const quiz = await c.req.json();
    await kv.set(`quiz:${quiz.id}`, quiz);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error saving quiz:", error);
    return c.json({ error: error.message }, 500);
  }
});

app.delete("/make-server-994e9032/quizzes/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`quiz:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting quiz:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Quiz attempt endpoints
app.get("/make-server-994e9032/attempts", async (c) => {
  try {
    const attempts = await kv.getByPrefix("attempt:");
    return c.json(attempts || []);
  } catch (error) {
    console.log("Error fetching attempts:", error);
    return c.json({ error: error.message }, 500);
  }
});

app.get("/make-server-994e9032/attempts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const attempt = await kv.get(`attempt:${id}`);
    if (!attempt) {
      return c.json({ error: "Attempt not found" }, 404);
    }
    return c.json(attempt);
  } catch (error) {
    console.log("Error fetching attempt:", error);
    return c.json({ error: error.message }, 500);
  }
});

app.get("/make-server-994e9032/quizzes/:quizId/attempts", async (c) => {
  try {
    const quizId = c.req.param("quizId");
    const allAttempts = await kv.getByPrefix("attempt:");
    const quizAttempts = (allAttempts || []).filter((attempt: any) => attempt.quizId === quizId);
    return c.json(quizAttempts);
  } catch (error) {
    console.log("Error fetching quiz attempts:", error);
    return c.json({ error: error.message }, 500);
  }
});

app.post("/make-server-994e9032/attempts", async (c) => {
  try {
    const attempt = await c.req.json();
    await kv.set(`attempt:${attempt.id}`, attempt);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error saving attempt:", error);
    return c.json({ error: error.message }, 500);
  }
});

Deno.serve(app.fetch);