import { createActor } from "@/backend";
import type { Fragrance, FragranceId } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

/** The single catalogue query key used site-wide. */
export const FRAGRANCES_QUERY_KEY = ["fragrances"] as const;

/**
 * Read the full fragrance catalogue from the backend.
 * One consistent dataset feeds the home collage, catalogue, product pages and bag.
 */
export function useFragrances() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Fragrance[]>({
    queryKey: FRAGRANCES_QUERY_KEY,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listFragrances();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Read a single fragrance by id, or null when it does not exist. */
export function useFragrance(id: FragranceId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Fragrance | null>({
    queryKey: ["fragrance", id?.toString() ?? "none"],
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getFragrance(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}
