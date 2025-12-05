// Main store index file
import useAuthStore from './authStore';
import useGlobalStore from './globalStore';

// You can also create a combined store if needed
// import { create } from 'zustand';
// import { devtools } from 'zustand/middleware';

// Export individual stores
export { useAuthStore, useGlobalStore };

// If you want a single global store that combines everything:
// export const useStore = create(
//   devtools(
//     (...a) => ({
//       ...useAuthStore.getState(),
//       ...useGlobalStore.getState(),
//       // Add other store states here
//     }),
//     { name: 'combined-store' }
//   )
// );