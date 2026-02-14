import { db } from "./db";
import { calls, type InsertCall, type Call } from "@shared/schema";

export interface IStorage {
  createCall(call: InsertCall): Promise<Call>;
}

export class DatabaseStorage implements IStorage {
  async createCall(insertCall: InsertCall): Promise<Call> {
    const [call] = await db.insert(calls).values(insertCall).returning();
    return call;
  }
}

export const storage = new DatabaseStorage();
