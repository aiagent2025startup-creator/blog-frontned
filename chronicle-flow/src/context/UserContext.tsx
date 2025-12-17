import React, { createContext, useState, useContext, ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  followers: number;
  following: number;
  blogCount?: number;
  totalLikes?: number;
}

interface UserContextType {
  user: User | null;
  safeUser: User;
  updateUser: (updates: Partial<User>) => void;
  setUser: (user: User) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);

  const defaultUser: User = {
    id: '',
    name: '',
    email: '',
    avatar: '',
    bio: '',
    followers: 0,
    following: 0,
    blogCount: 0,
    totalLikes: 0,
  };

  const safeUser: User = user ?? defaultUser;

  const updateUser = (updates: Partial<User>) => {
    setUserState(prev => prev ? { ...prev, ...updates } : null);
  };

  const setUser = (newUser: User) => {
    setUserState(newUser);
  };

  return (
    <UserContext.Provider value={{ user, safeUser, updateUser, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
