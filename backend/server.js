import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";
import cors from "cors";

import Stripe from "stripe";

import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./db/schema.js";

// Routes
// import authRouter from "./routes/auth.js";
// import userRouter from "./routes/users.js";

env.config();

const app = express();
app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = drizzle(process.env.DATABASE_URL);
const PORT = process.env.BACKEND_PORT;
const stripe = Stripe(process.env.STRIPE_PRIVATE_KEY);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/test", async (req, res) => {
  const result = await db.select().from(schema.tests);
  // Drizzle returns .rows automatically
  console.log(result);

  res.json(result);
});

app.post("/test", async (req, res) => {
  try {
    const result = await db.insert(tests).values({ name: "Andrew" });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating menu item:", err);
    res.status(500).send("Internal server error");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
