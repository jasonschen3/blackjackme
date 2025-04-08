import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  boolean,
  jsonb,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enum
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const gameResultEnum = pgEnum("game_result", [
  "win",
  "loss",
  "push",
  "blackjack",
]);

// Users table
export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  nickname: varchar("username", { length: 255 }).unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),

  // Account balance
  tokens: integer("tokens").notNull().default(0),
  totalWinnings: integer("total_winnings").default(0),
  totalLosses: integer("total_losses").default(0),

  // Gaming stats
  handsPlayed: integer("hands_played").default(0),
  blackjacksHit: integer("blackjacks_hit").default(0),
  biggestWin: integer("biggest_win").default(0),

  // Account settings
  privateAccount: boolean("private_account").default(false),
  role: userRoleEnum("role").default("user"),

  // Account status
  isLocked: boolean("is_locked").default(false),
  lockReason: varchar("lock_reason", { length: 255 }),

  // Session tracking
  lastLogin: timestamp("last_login"),
  lastGamePlayed: timestamp("last_game_played"),
  createdAt: timestamp("created_at").defaultNow(),

  // Gameplay preferences (stored as JSON)
  preferences: jsonb("preferences").default({
    autoStandOn17: true,
    showTutorials: true,
    alertOnHighBets: true,
  }),
});

export const tests = pgTable("tests", {
  id: uuid("id").primaryKey().defaultRandom(), // auto-generates UUID
  name: varchar("name", { length: 255 }).notNull(),
});
