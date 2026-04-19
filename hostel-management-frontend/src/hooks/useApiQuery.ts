import { QueryKey, UseQueryOptions, useQuery } from "@tanstack/react-query";
import api from "../services/api";

export const useApiQuery = <TData,>(
  queryKey: QueryKey,
  path: string,
  options?: Omit<UseQueryOptions<TData, Error, TData, QueryKey>, "queryKey" | "queryFn">
) => {
  return useQuery<TData, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get<TData>(path);
      return response.data;
    },
    ...options
  });
};
