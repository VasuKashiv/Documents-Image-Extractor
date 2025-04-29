import { useQuery } from "@tanstack/react-query";
import { client } from "../api/client";

export function useLiveImages(enabled) {
  return useQuery({
    queryKey: ["images"],
    queryFn: async () => (await client.get("/images")).data,
    enabled, // only poll when a doc is uploaded
    refetchInterval: enabled ? 2000 : false,
  });
}
