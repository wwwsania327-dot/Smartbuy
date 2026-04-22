import { useQuery } from "@tanstack/react-query";
import { fetchMergedProducts } from "@/utils/api";

export interface ProductData {
  id: string | number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string | { name: string };
  rating?: number;
  reviews?: number;
  stock?: number;
}

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
