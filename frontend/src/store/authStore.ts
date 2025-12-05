import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: true,
      
      login: async (email: string, password: string) => {
        set({ loading: true });
        try {
          // In a real app, you would call your API here
          // const response = await loginAPI(email, password);
          // For now, we'll simulate a successful login
          const mockUser = {
            id: '1',
            name: 'John Doe',
            email,
            role: 'admin'
          };
          
          // Set user info in localStorage as well
          localStorage.setItem('user', JSON.stringify(mockUser));
          localStorage.setItem('token', 'mock_token');
          
          set({ 
            user: mockUser, 
            isAuthenticated: true, 
            loading: false 
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },
      
      logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false, loading: false });
      },
      
      register: async (name: string, email: string, password: string) => {
        set({ loading: true });
        try {
          // In a real app, you would call your API here
          // const response = await registerAPI(name, email, password);
          const mockUser = {
            id: Date.now().toString(),
            name,
            email,
            role: 'user'
          };
          
          // Set user info in localStorage as well
          localStorage.setItem('user', JSON.stringify(mockUser));
          localStorage.setItem('token', 'mock_token');
          
          set({ 
            user: mockUser, 
            isAuthenticated: true, 
            loading: false 
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },
      
      checkAuthStatus: async () => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
          try {
            const parsedUser = JSON.parse(user);
            set({ 
              user: parsedUser, 
              isAuthenticated: true, 
              loading: false 
            });
          } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            set({ user: null, isAuthenticated: false, loading: false });
          }
        } else {
          set({ user: null, isAuthenticated: false, loading: false });
        }
      }
    }),
    { name: 'auth-store' }
  )
);

export default useAuthStore;