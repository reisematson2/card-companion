import React, { createContext, useContext, useState, ReactNode } from 'react';

type Settings = {
  displayStyle: 'default' | 'list';
  setDisplayStyle: (style: 'default' | 'list') => void;
};

const SettingsContext = createContext<Settings | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [displayStyle, setDisplayStyle] = useState<'default' | 'list'>('default');

  return (
    <SettingsContext.Provider value={{ displayStyle, setDisplayStyle }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
