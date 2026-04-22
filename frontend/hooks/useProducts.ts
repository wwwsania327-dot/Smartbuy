import { useQuery } from "@tanstack/react-query";
import { fetchMergedProducts } from "../utils/api";

import { ProductData } from "../components/ProductCard";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const data = await fetchMergedProducts();
      return data as unknown as ProductData[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
