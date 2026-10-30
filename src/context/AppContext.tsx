import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole, Notification, FDR, Institution } from '../types';
import { MOCK_FDRS, MOCK_INSTITUTIONS, MOCK_NOTIFICATIONS } from '../data/mockData';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  fdrs: FDR[];
  setFdrs: (fdrs: FDR[]) => void;
  institutions: Institution[];
  setInstitutions: (inst: Institution[]) => void;
  notifications: Notification[];
  setNotifications: (notifs: Notification[]) => void;
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  addFDR: (fdr: FDR) => void;
  updateFDR: (id: string, updates: Partial<FDR>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const SYSTEM_USERS: Record<UserRole, User> = {
  system_admin: {
    id: 'user-admin-001',
    name: 'Arjun Verma',
    role: 'system_admin',
    email: 'admin@fdrguard.in',
  },
  institution_admin: {
    id: 'user-ia-001',
    name: 'Dr. Suresh Kumar',
    role: 'institution_admin',
    email: 'principal@rvce.edu.in',
    institutionId: 'inst-001',
  },
  verification_officer: {
    id: 'user-vo-001',
    name: 'Meena Gupta',
    role: 'verification_officer',
    email: 'officer@fdrguard.in',
  },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('fdrguard_user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u && (!u.role || u.role !== 'system_admin' && u.role !== 'institution_admin' && u.role !== 'verification_officer')) {
          u.role = 'system_admin';
        }
        return u;
      } catch { return null; }
    }
    return null;
  });

  const [fdrs, setFdrsState] = useState<FDR[]>(() => {
    const stored = localStorage.getItem('fdrguard_fdrs');
    if (stored) {
      try { return JSON.parse(stored); } catch { return MOCK_FDRS; }
    }
    return MOCK_FDRS;
  });

  const [institutions, setInstitutionsState] = useState<Institution[]>(() => {
    const stored = localStorage.getItem('fdrguard_institutions');
    if (stored) {
      try { return JSON.parse(stored); } catch { return MOCK_INSTITUTIONS; }
    }
    return MOCK_INSTITUTIONS;
  });

  const [notifications, setNotificationsState] = useState<Notification[]>(() => {
    const stored = localStorage.getItem('fdrguard_notifications');
    if (stored) {
      try { return JSON.parse(stored); } catch { return MOCK_NOTIFICATIONS; }
    }
    return MOCK_NOTIFICATIONS;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (currentUser) localStorage.setItem('fdrguard_user', JSON.stringify(currentUser));
    else localStorage.removeItem('fdrguard_user');
  }, [currentUser]);

  const setFdrs = (newFdrs: FDR[]) => {
    setFdrsState(newFdrs);
    localStorage.setItem('fdrguard_fdrs', JSON.stringify(newFdrs));
  };

  const setInstitutions = (newInst: Institution[]) => {
    setInstitutionsState(newInst);
    localStorage.setItem('fdrguard_institutions', JSON.stringify(newInst));
  };

  const setNotifications = (newNotifs: Notification[]) => {
    setNotificationsState(newNotifs);
    localStorage.setItem('fdrguard_notifications', JSON.stringify(newNotifs));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markNotificationRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const addFDR = (fdr: FDR) => {
    setFdrs([fdr, ...fdrs]);
  };

  const updateFDR = (id: string, updates: Partial<FDR>) => {
    setFdrs(fdrs.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleSetCurrentUser = (user: User | null) => {
    setCurrentUser(user);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser: handleSetCurrentUser,
      fdrs,
      setFdrs,
      institutions,
      setInstitutions,
      notifications,
      setNotifications,
      unreadCount,
      markNotificationRead,
      markAllRead,
      isSidebarOpen,
      setIsSidebarOpen,
      addFDR,
      updateFDR,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { SYSTEM_USERS, SYSTEM_USERS as DEMO_USERS };
