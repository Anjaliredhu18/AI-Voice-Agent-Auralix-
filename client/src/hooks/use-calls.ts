import { useMutation } from "@tanstack/react-query";
import { api, type InsertCall } from "@shared/routes";

export function useCreateCall() {
  return useMutation({
    mutationFn: async (data: InsertCall) => {
      const res = await fetch(api.calls.create.path, {
        method: api.calls.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to create call log");
      return api.calls.create.responses[200].parse(await res.json());
    },
  });
}
