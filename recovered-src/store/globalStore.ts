import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface GlobalState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const useGlobalStore = create<GlobalState>()(
  devtools(
    (set) => ({
      sidebarOpen: true,
      theme: 'system',
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'global-store' }
  )
);

export default useGlobalStore;