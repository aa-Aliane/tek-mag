import { create } from 'zustand';

interface SelectedIssue {
  issueId: string;
  issueName: string;
  categoryType: 'part_based' | 'service_based';
  selectedTierId?: number;
  customPrice?: number;
  notes?: string;
}

interface ReparationStore {
  deviceType: string;
  setDeviceType: (type: string) => void;

  brand: string;
  setBrand: (brand: string) => void;

  model: string;
  setModel: (model: string) => void;

  selectedIssues: SelectedIssue[];
  addIssue: (issueId: string | number, issueName: string, categoryType: 'part_based' | 'service_based') => void;
  removeIssue: (issueId: string | number) => void;
  updateIssueTier: (issueId: string | number, tierId: number) => void;
  updateIssueNotes: (issueId: string | number, notes: string) => void;

  description: string;
  setDescription: (description: string) => void;

  accessories: string;
  setAccessories: (accessories: string) => void;

  password: string;
  setPassword: (password: string) => void;

  depositReceived: boolean;
  setDepositReceived: (received: boolean) => void;

  scheduledDate: Date | null;
  setScheduledDate: (date: Date | null) => void;

  clientSearch: string;
  setClientSearch: (search: string) => void;

  // Reset function to clear all state
  reset: () => void;
}

export const useReparationStore = create<ReparationStore>((set, get) => ({
  deviceType: '',
  setDeviceType: (type) => set({ deviceType: type }),

  brand: '',
  setBrand: (brand) => set({ brand }),

  model: '',
  setModel: (model) => set({ model }),

  selectedIssues: [],
  addIssue: (issueId, issueName, categoryType) =>
    set((state) => {
      const idStr = String(issueId);
      // Check if issue already exists
      const exists = state.selectedIssues.some(issue => issue.issueId === idStr);
      if (!exists) {
        return {
          selectedIssues: [
            ...state.selectedIssues,
            { issueId: idStr, issueName, categoryType }
          ]
        };
      }
      return state;
    }),
  removeIssue: (issueId) =>
    set((state) => ({
      selectedIssues: state.selectedIssues.filter(issue => issue.issueId !== String(issueId))
    })),
  updateIssueTier: (issueId, tierId) =>
    set((state) => ({
      selectedIssues: state.selectedIssues.map(issue =>
        issue.issueId === String(issueId) ? { ...issue, selectedTierId: tierId } : issue
      )
    })),
  updateIssueNotes: (issueId, notes) =>
    set((state) => ({
      selectedIssues: state.selectedIssues.map(issue =>
        issue.issueId === String(issueId) ? { ...issue, notes } : issue
      )
    })),

  description: '',
  setDescription: (description) => set({ description }),

  accessories: '',
  setAccessories: (accessories) => set({ accessories }),

  password: '',
  setPassword: (password) => set({ password }),

  depositReceived: false,
  setDepositReceived: (received) => set({ depositReceived: received }),

  scheduledDate: null,
  setScheduledDate: (date) => set({ scheduledDate: date }),

  clientSearch: '',
  setClientSearch: (search) => set({ clientSearch: search }),

  reset: () => set({
    deviceType: '',
    brand: '',
    model: '',
    selectedIssues: [],
    description: '',
    accessories: '',
    password: '',
    depositReceived: false,
    scheduledDate: null,
    clientSearch: '',
  }),
}));