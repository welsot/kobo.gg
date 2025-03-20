import { createContext, type ReactNode, useContext } from 'react';

type KeyValueTxtType = {
  [key: string]: string;
};

type TxtContextType = {
  txt: KeyValueTxtType;
};

const TxtContext = createContext<TxtContextType>({
  txt: {},
});

type TxtProviderProps = {
  txt: KeyValueTxtType;
  children: ReactNode;
};

export function TxtProvider({ txt = {}, children }: TxtProviderProps) {
  const contextValue = {
    txt: txt,
  };
  return <TxtContext.Provider value={contextValue}>{children}</TxtContext.Provider>;
}

export function useTxt(): TxtContextType {
  const context = useContext(TxtContext);
  if (context === undefined) {
    throw new Error('useTxt must be used within a TxtProvider');
  }

  return context;
}
