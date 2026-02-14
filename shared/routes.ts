import { z } from "zod";
import { insertCallSchema, calls } from "./schema";

export const api = {
  calls: {
    create: {
      method: "POST" as const,
      path: "/api/calls" as const,
      input: insertCallSchema,
      responses: {
        200: z.custom<typeof calls.$inferSelect>(),
      },
    },
  },
};
