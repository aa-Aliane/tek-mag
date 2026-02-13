import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAddReparationStore } from "@/store/addReparationStore";
import { useReparationStore } from "@/lib/store";
import { useClients } from "@/hooks/use-clients";
import { useDeviceTypes } from "@/hooks/use-device-types";
import { useCommonIssues } from "@/hooks/use-common-issues";
import type { Client } from "@/types";

export function useClientSelection() {
  const router = useRouter();
  const { formData, setFormData } = useAddReparationStore();
  const {
    deviceType: deviceTypeSlug,
    brand,
    model,
    selectedIssues,
    description,
    accessories,
    password,
    depositReceived,
    scheduledDate,
  } = useReparationStore();

  const { data: clientsData } = useClients(1, undefined, "Client");
  const clients = clientsData?.results || [];

  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(
    formData.client,
  );
  const [newClient, setNewClient] = useState({
    firstName: formData.newClient.firstName,
    lastName: formData.newClient.lastName,
    phone: formData.newClient.phone,
    email: formData.newClient.email,
  });

  // Fetch device types to map slug to ID
  const { data: deviceTypesData } = useDeviceTypes();
  const deviceTypes = deviceTypesData?.results || [];

  // Get the numeric ID for the selected device type slug
  const deviceTypeId = deviceTypeSlug
    ? deviceTypes.find((dt) => dt.slug === deviceTypeSlug)?.id || null
    : null;

  // Fetch issues to map names to IDs
  const { data: allIssuesData } = useCommonIssues(deviceTypeSlug);
  const allIssues = allIssuesData || [];

  // Map selected issues to the new structure with quality tiers
  const repairIssueData = selectedIssues
    .map((selectedIssue) => {
      const issue = allIssues.find(
        (i) => String(i.id) === selectedIssue.issueId,
      );
      if (!issue) return null;

      return {
        issue_id: parseInt(selectedIssue.issueId),
        quality_tier_id: selectedIssue.selectedTierId,
        notes: selectedIssue.notes,
      };
    })
    .filter(Boolean) as {
    issue_id: number;
    quality_tier_id?: number;
    notes?: string;
  }[];

  useEffect(() => {
    if (formData.client) setSelectedClient(formData.client);
    setNewClient({
      firstName: formData.newClient.firstName,
      lastName: formData.newClient.lastName,
      phone: formData.newClient.phone,
      email: formData.newClient.email,
    });
  }, [formData.client, formData.newClient]);

  const searchedClients = clientSearch
    ? clients.filter((c) => {
        const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
        const phone = c.profile?.phone_number || "";
        return (
          fullName.includes(clientSearch.toLowerCase()) ||
          phone.includes(clientSearch)
        );
      })
    : clients;

  const handleSubmit = () => {
    // Prepare final form data, syncing values from useReparationStore
    const finalData = {
      ...formData,
      deviceType: deviceTypeId,
      brand: brand ? parseInt(brand) : null,
      model: model ? parseInt(model) : null,
      repair_issue_data: repairIssueData,
      issueDescription: description,
      accessories: accessories
        ? accessories
            .split(",")
            .map((a) => a.trim())
            .filter((a) => a)
        : [],
      password: password,
      depositStatus: depositReceived ? "deposited" : "scheduled",
      scheduledDate: scheduledDate,
      client: selectedClient,
      newClient: selectedClient
        ? { firstName: "", lastName: "", phone: "", email: "" }
        : newClient,
    };

    setFormData(finalData);
    router.push("/repairs/add/payment");
  };

  const handlePrev = () => {
    setFormData({
      client: selectedClient,
      newClient,
    });
    router.push("/repairs/add/issues");
  };

  const canSubmit =
    !!selectedClient ||
    (!!newClient.firstName && !!newClient.lastName && !!newClient.phone);

  return {
    clientSearch,
    setClientSearch,
    selectedClient,
    setSelectedClient,
    newClient,
    setNewClient,
    searchedClients,
    handleSubmit,
    handlePrev,
    canSubmit,
  };
}
