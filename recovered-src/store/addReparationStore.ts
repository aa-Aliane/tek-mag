import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { DeviceType, Client, DepositStatus } from '@/types';
import api from '@/lib/api/client';

interface RepairFormData {
  deviceType: number | null; // Changed to number to match ID
  brand: number | null;      // Changed to number to match ID
  model: number | null;      // Changed to number to match ID
  repair_issue_data: {
    issue_id: number;
    quality_tier_id?: number;
    custom_price?: number;
    notes?: string;
  }[];
  issueDescription: string;
  accessories: string[];
  password: string;
  depositStatus: DepositStatus;
  client: Client | null;
  newClient: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  totalPrice: number;
  scheduledDate?: Date;
}

interface AddReparationStore {
  formData: RepairFormData;
  currentStep: number;
  setFormData: (data: Partial<RepairFormData>) => void;
  setStep: (step: number) => void;
  resetForm: () => void;
  nextStep: () => void;
  prevStep: () => void;
  submitForm: () => Promise<void>;
}

export const useAddReparationStore = create<AddReparationStore>()(
  devtools(
    (set, get) => ({
      currentStep: 1,
      formData: {
        deviceType: null,
        brand: null,
        model: null,
        issues: [],
        issueDescription: '',
        accessories: [],
        password: '',
        depositStatus: 'deposited',
        client: null,
        newClient: {
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
        },
        totalPrice: 0,
      },
      
      setFormData: (data) => set((state) => ({
        formData: { ...state.formData, ...data }
      })),
      
      setStep: (step) => set({ currentStep: step }),
      
      resetForm: () => set({
        currentStep: 1,
        formData: {
          deviceType: null,
          brand: null,
          model: null,
          issues: [],
          issueDescription: '',
          accessories: [],
          password: '',
          depositStatus: 'deposited',
          client: null,
          newClient: {
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
          },
          totalPrice: 0,
        }
      }),
      
      nextStep: () => set((state) => ({
        currentStep: Math.min(state.currentStep + 1, 3)
      })),
      
      prevStep: () => set((state) => ({
        currentStep: Math.max(state.currentStep - 1, 1)
      })),
      
      submitForm: async () => {
        const { formData } = get();
        let clientToUse = formData.client;

        // If no existing client is selected, create a new user
        if (!clientToUse && (formData.newClient.firstName && formData.newClient.lastName && formData.newClient.phone)) {
          try {
            // Create new user
            const newUserResponse = await api.post('/users/', {
              username: formData.newClient.email || `${formData.newClient.firstName}.${formData.newClient.lastName}`,
              email: formData.newClient.email || '',
              first_name: formData.newClient.firstName,
              last_name: formData.newClient.lastName,
              password: 'TempPassword123!' // This would need to be handled properly in a real app
            });

            // The profile is created automatically with the user via signal
            // Get the complete user data including profile
            const userResponse = await api.get(`/users/${newUserResponse.data.id}/`);
            clientToUse = userResponse.data;
          } catch (error) {
            console.error('Error creating new client:', error);
            throw error;
          }
        }

        // Create the repair with the client
        try {
          // Generate a unique UID for the repair
          const repairUid = `REP${Date.now()}`;

          const repairData = {
            uid: repairUid, // Required field
            client_id: clientToUse?.id,
            product_model_id: formData.model,
            description: formData.issueDescription || 'Réparation créée via formulaire', // Ensure description is not empty
            password: formData.password || null,
            price: formData.totalPrice || 0,
            repair_issue_data: formData.repair_issue_data || [], // Use the new structure for issues with quality tiers
            accessories: formData.accessories ? formData.accessories.join(', ') : null, // Join array into comma-separated string
            status: 'saisie', // Default status
            date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
            ...(formData.scheduledDate && { scheduledDate: formData.scheduledDate instanceof Date
              ? formData.scheduledDate.toISOString().split('T')[0]
              : formData.scheduledDate }) // Format scheduledDate to YYYY-MM-DD if it's a Date object
          };

          console.log('Sending repair data:', repairData); // Debug log

          const repairResponse = await api.post('/repairs/repairs/', repairData);
          console.log('Repair created successfully:', repairResponse.data);

          // Reset form after successful submission
          get().resetForm();
          return repairResponse.data;
        } catch (error) {
          console.error('Error creating repair:', error);
          // Check if we have response data with validation errors
          if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
          }
          throw error;
        }
      }
    }),
    { name: 'add-reparation-store' }
  )
);