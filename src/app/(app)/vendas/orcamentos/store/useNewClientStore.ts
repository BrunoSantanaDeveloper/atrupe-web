import { create } from 'zustand'

type NewClientStoreType = {
  open: boolean
  onToggleModalVisibility: () => void
}
export const useNewClientStore = create<NewClientStoreType>((set) => ({
  open: false,
  onToggleModalVisibility: () => set((state) => ({ open: !state.open })),
}))
