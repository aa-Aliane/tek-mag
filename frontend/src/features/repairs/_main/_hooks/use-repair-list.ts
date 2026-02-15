import { useRepairListQuery } from "../_queries/use-repairs-queries";

export const useRepairList = () => {
  const { data, isLoading, isError, error, refetch } = useRepairListQuery();

  return {
    repairs: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    isError,
    error,
    refetch,
  };
};
