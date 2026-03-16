import React, { createContext, useContext } from 'react'
import useMainStore from '@/stores/useMainStore'

export const MainContext = createContext<ReturnType<typeof useMainStore> | null>(null)

export const MainProvider = ({ children }: { children: React.ReactNode }) => {
  const store = useMainStore()
  return <MainContext.Provider value={store}>{children}</MainContext.Provider>
}

export const useStore = () => {
  const context = useContext(MainContext)
  if (!context) throw new Error('useStore must be used within MainProvider')
  return context
}
