import { create } from 'zustand'

type NewClientStoreType = {
  open: boolean
  onClientCreated?: (client: { value: string; label: string }) => void
  onToggleModalVisibility: () => void
  setOnClientCreated: (
    callback?: (client: { value: string; label: string }) => void,
  ) => void
}
export const useNewClientStore = create<NewClientStoreType>((set) => ({
  open: false,
  onClientCreated: undefined,
  onToggleModalVisibility: () => set((state) => ({ open: !state.open })),
  setOnClientCreated: (callback) => set({ onClientCreated: callback }),
}))
