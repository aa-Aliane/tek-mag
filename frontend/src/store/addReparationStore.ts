import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { DeviceType, Client, DepositStatus } from '@/types';
import api from '@/lib/api/client';

interface RepairFormData {

  deviceType: number | null;

  brand: number | null;

  model: number | null;

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

  payments: {

    amount: number;

    method: 'cash' | 'card' | 'check' | 'transfer';

    note?: string;

  }[];

  discounts: {

    amount: number;

    reason: string;

  }[];

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

  submitForm: () => Promise<any>;

}



export const useAddReparationStore = create<AddReparationStore>()(

  devtools(

    (set, get) => ({

      currentStep: 1,

      formData: {

        deviceType: null,

        brand: null,

        model: null,

        repair_issue_data: [],

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

        payments: [],

        discounts: [],

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

          repair_issue_data: [],

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

          payments: [],

          discounts: [],

        }

      }),

      

      nextStep: () => set((state) => ({

        currentStep: Math.min(state.currentStep + 1, 4)

      })),

      

      prevStep: () => set((state) => ({

        currentStep: Math.max(state.currentStep - 1, 1)

      })),

      

      submitForm: async () => {

        const { formData } = get();

        let clientToUse = formData.client;



        // 1. Handle Client Creation if needed

        if (!clientToUse && (formData.newClient.firstName && formData.newClient.lastName && formData.newClient.phone)) {

          try {

            const newUserResponse = await api.post('/users/', {

              username: formData.newClient.email || `${formData.newClient.firstName}.${formData.newClient.lastName}.${Date.now()}`,

              email: formData.newClient.email || '',

              first_name: formData.newClient.firstName,

              last_name: formData.newClient.lastName,

              password: 'TempPassword123!',

              profile: {

                phone_number: formData.newClient.phone,

                type: 'Client'

              }

            });

            clientToUse = newUserResponse.data;

          } catch (error) {

            console.error('Error creating new client:', error);

            throw error;

          }

        }



        // 2. Create Repair

        let repair;

        try {

          const repairUid = `REP${Date.now()}`;

          const repairData = {

            uid: repairUid,

            client_id: clientToUse?.id,

            product_model_id: formData.model,

            description: formData.issueDescription || 'Réparation créée via formulaire',

            password: formData.password || null,

            repair_issue_data: formData.repair_issue_data || [],

            accessories: formData.accessories ? formData.accessories.join(', ') : null,

            status: 'saisie',

            date: new Date().toISOString().split('T')[0],

            scheduled_date: formData.scheduledDate instanceof Date

              ? formData.scheduledDate.toISOString().split('T')[0]

              : formData.scheduledDate || null

          };



          const repairResponse = await api.post('/repairs/repairs/', repairData);

          repair = repairResponse.data;

        } catch (error) {

          console.error('Error creating repair:', error);

          throw error;

        }



        // 3. Process Discounts

        if (formData.discounts.length > 0) {

          try {

            await Promise.all(formData.discounts.map(discount => 

              api.post(`/repairs/repairs/${repair.id}/discounts/`, discount)

            ));

          } catch (error) {

            console.error('Error creating discounts:', error);

            // We don't throw here to avoid failing the whole process if only discounts fail

          }

        }



        // 4. Process Payments

        if (formData.payments.length > 0) {

          try {

            await Promise.all(formData.payments.map(payment => 

              api.post(`/repairs/repairs/${repair.id}/payments/`, {

                ...payment,

                transaction_type: 'payment'

              })

            ));

          } catch (error) {

            console.error('Error creating payments:', error);

            // Same as discounts

          }

        }



        get().resetForm();

        return repair;

      }

    }),

    { name: 'add-reparation-store' }

  )

);
