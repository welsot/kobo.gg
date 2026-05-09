import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { UserDto } from '~/api/apiSchemas';

type UserContextType = {
  user: UserDto | null;
  setUser: (user: UserDto | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

type UserProviderProps = {
  initialUser?: UserDto | null;
  children: ReactNode;
};

export function UserProvider({ initialUser = null, children }: UserProviderProps) {
  const [user, setUser] = useState<UserDto | null>(initialUser);

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
    }),
    [user],
  );

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
}

export function useCurrentUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useCurrentUser must be used within a UserProvider');
  }

  return context;
}
