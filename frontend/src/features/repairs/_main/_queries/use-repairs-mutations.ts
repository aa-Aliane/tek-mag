import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/client";
import { Repair } from "@/types";
import { toast } from "sonner";
import { useRepairStore } from "../../_shared/_store/use-repair-store";

export const useUpdateRepair = () => {
  const queryClient = useQueryClient();
  const setSelectedRepair = useRepairStore((state) => state.setSelectedRepair);
  const selectedRepair = useRepairStore((state) => state.selectedRepair);

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Repair>;
      type: string;
    }) => {
      return api.patch(`/repairs/repairs/${id}/`, data);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["repairs"] });

      const previousQueries = queryClient.getQueriesData({
        queryKey: ["repairs"],
      });

      queryClient.setQueriesData({ queryKey: ["repairs"] }, (old: any) => {
        if (!old) return old;

        const updateRepairInResults = (results: Repair[]) =>
          results.map((r: Repair) =>
            String(r.id) === variables.id ? { ...r, ...variables.data } : r
          );

        if (old.pages) {
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              results: updateRepairInResults(page.results),
            })),
          };
        }

        if (Array.isArray(old)) return updateRepairInResults(old);
        if (old.results) return { ...old, results: updateRepairInResults(old.results) };

        return old;
      });

      return { previousQueries };
    },
    onError: (err, variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, value]) => {
          queryClient.setQueryData(key, value);
        });
      }
      toast.error("Erreur lors de la mise à jour.");
    },
    onSuccess: (response) => {
      const updatedRepair = response.data;
      
      if (selectedRepair && String(selectedRepair.id) === String(updatedRepair.id)) {
        setSelectedRepair(updatedRepair);
      }

      queryClient.invalidateQueries({ queryKey: ["repairs"] });
    },
  });
};
