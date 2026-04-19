import { create } from "zustand";

interface AuthStore {
  username: string | null;
  setUsername: (username: string | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  username: null,
  setUsername: (username) => set({ username })
}));
