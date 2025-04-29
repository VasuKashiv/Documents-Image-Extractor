import { useQuery } from "@tanstack/react-query";
import { client } from "../api/client";

/**
 * Hook to fetch *all* images (no polling by default).
 * Enabled only when you want the full gallery.
 */
export function useAllImages({ enabled }) {
  return useQuery({
    queryKey: ["allImages"],
    queryFn: async () => (await client.get("/images")).data,
    enabled, // only fetch when enabled=true
    refetchInterval: false,
    staleTime: Infinity,
  });
}
