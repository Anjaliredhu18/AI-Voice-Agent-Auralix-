import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  status: text("status").notNull(),
  startedAt: timestamp("started_at").defaultNow(),
});

export const insertCallSchema = createInsertSchema(calls).omit({ id: true, startedAt: true });

export type Call = typeof calls.$inferSelect;
export type InsertCall = z.infer<typeof insertCallSchema>;
