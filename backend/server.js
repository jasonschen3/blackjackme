import express from "express";
import bodyParser from "body-parser";
import env from "dotenv";
import cors from "cors";

import Stripe from "stripe";

import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import * as schema from "./db/schema.js";

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

// Add webhook handler for successful payments
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        // Add tokens to user's account
        await db
          .update(schema.users)
          .set({
            tokens: sql`tokens + ${session.metadata.tokens}`,
          })
          .where(eq(schema.users.id, session.metadata.userId));
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }
);

app.post("/create-user", async (req, res) => {
  const { uid, username, email } = req.body;

  try {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, uid))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newUser = await db
      .insert(schema.users)
      .values({ id: uid, username, email, tokens: 0, createAt: new Date() })
      .returning();

    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.post("/buy100", async (req, res) => {
  try {
    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "100 Blackjack Tokens",
              description: "Purchase 100 tokens to play blackjack",
            },
            unit_amount: 100, // $1.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        tokens: 100,
        userId: req.body.userId, // Assuming you're passing userId from frontend
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

app.post("/buy1000", async (req, res) => {});

app.get("/test", async (req, res) => {
  const result = await db.select().from(schema.tests);
  // Drizzle returns .rows automatically
  console.log(result);

  res.json(result);
});

app.post("/test", async (req, res) => {
  const { name } = req.body;
  try {
    const result = await db.insert(tests).values({ name });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating menu item:", err);
    res.status(500).send("Internal server error");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
