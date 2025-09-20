import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AUTH_USER_STORAGE_KEY,
  clearAuthUser,
  loadAuthUser,
  storeAuthUser,
} from '@/lib/authStorage.ts';
import type { AuthUser } from '@/types/api.ts';

type AuthContextValue = {
  user: AuthUser | null;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const [user, setUserState] = useState<AuthUser | null>(() => loadAuthUser());

  const setUser = useCallback((nextUser: AuthUser) => {
    storeAuthUser(nextUser);
    setUserState(nextUser);
  }, []);

  const clearUser = useCallback(() => {
    clearAuthUser();
    setUserState(null);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_USER_STORAGE_KEY) {
        return;
      }
      setUserState(loadAuthUser());
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      clearUser,
    }),
    [user, setUser, clearUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth は AuthProvider の内部でのみ使用してください');
  }
  return context;
};
