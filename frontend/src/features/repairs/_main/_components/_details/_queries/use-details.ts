import api from "@/lib/api/client";
import { RepairStatus } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepairStore } from "../../../../_shared/_store/use-repair-store";

interface paramsType {
  repairId: number;
  status: string;
  comment: string;
  sendNotification: boolean;
}

const updateStatusFetcher = async ({
  repairId,
  status,
  comment,
  sendNotification,
}: paramsType) => {
  const response = await api.patch(`/repairs/repairs/${repairId}/`, {
    status,
    comment,
    send_notification: sendNotification,
  });
  return response.data;
};

export const useUpdateRepairStatus = () => {
  const queryClient = useQueryClient();
  const setSelectedRepair = useRepairStore((state) => state.setSelectedRepair);
  const selectedRepair = useRepairStore((state) => state.selectedRepair);

  return useMutation({
    mutationFn: ({ repairId, status, comment, sendNotification }: paramsType) =>
      updateStatusFetcher({ repairId, status, comment, sendNotification }),
    onSuccess: (updatedRepair) => {
      queryClient.invalidateQueries({ queryKey: ["repairs"] });

      // Update store if the current selected repair was the one updated
      if (selectedRepair && selectedRepair.id === updatedRepair.id) {
        setSelectedRepair(updatedRepair);
      }
    },
  });
};

export const useUpdateRepairLocation = () => {
  const queryClient = useQueryClient();
  const setSelectedRepair = useRepairStore((state) => state.setSelectedRepair);
  const selectedRepair = useRepairStore((state) => state.selectedRepair);

  return useMutation({
    mutationFn: async ({
      repairId,
      isInStore,
    }: {
      repairId: number;
      isInStore: boolean;
    }) => {
      const response = await api.patch(`/repairs/repairs/${repairId}/`, {
        isInStore,
      });
      return response.data;
    },
    onSuccess: (updatedRepair) => {
      queryClient.invalidateQueries({ queryKey: ["repairs"] });

      if (selectedRepair && selectedRepair.id === updatedRepair.id) {
        setSelectedRepair(updatedRepair);
      }
    },
  });
};
