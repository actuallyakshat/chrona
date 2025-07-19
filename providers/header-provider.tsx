
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HeaderState {
  title: string;
  imageUrl?: string;
}

interface HeaderContextType {
  headerState: HeaderState;
  setHeaderState: (state: HeaderState) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const [headerState, setHeaderState] = useState<HeaderState>({
    title: 'Chrona',
  });

  return (
    <HeaderContext.Provider value={{ headerState, setHeaderState }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
};
