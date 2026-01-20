import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  completed: boolean;
  playerId: string | null;
  setCompleted: (playerId: string) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      playerId: null,
      setCompleted: (playerId: string) => set({ completed: true, playerId }),
      reset: () => set({ completed: false, playerId: null }),
    }),
    {
      name: 'onboarding-storage',
    }
  )
);
