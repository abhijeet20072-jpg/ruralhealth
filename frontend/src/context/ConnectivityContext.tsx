import React, { createContext, useContext, useEffect, useState } from 'react';
import { getPendingOperations, addSyncOperation } from '../services/db';
import type { SyncOperation } from '../services/db';
import { api } from '../services/api';

interface ConnectivityContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  triggerSync: () => Promise<void>;
  enqueueOperation: (op: Omit<SyncOperation, 'status'>) => Promise<void>;
}

const ConnectivityContext = createContext<ConnectivityContextType>({
  isOnline: true,
  isSyncing: false,
  pendingCount: 0,
  triggerSync: async () => {},
  enqueueOperation: async () => {},
});

export const ConnectivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync(); // Auto-sync on reconnection
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    updatePendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updatePendingCount = async () => {
    try {
      const ops = await getPendingOperations();
      setPendingCount(ops.length);
    } catch (e) {
      console.error('Failed to get pending operations', e);
    }
  };

  const enqueueOperation = async (op: Omit<SyncOperation, 'status'>) => {
    await addSyncOperation(op);
    await updatePendingCount();
    if (isOnline) {
      await triggerSync();
    }
  };

  const triggerSync = async () => {
    if (!navigator.onLine || isSyncing) return;
    
    setIsSyncing(true);
    try {
      const ops = await getPendingOperations();
      if (ops.length === 0) {
        setIsSyncing(false);
        return;
      }

      const res = await api.post('/api/sync', { operations: ops });
      const results = res.data.results;
      
      const { updateOperationStatus, removeOperation } = await import('../services/db');
      
      for (const result of results) {
        if (result.status === 'SUCCESS') {
          await removeOperation(result.id);
        } else if (result.status === 'CONFLICT') {
          await updateOperationStatus(result.id, 'CONFLICT', result.error);
        } else {
          await updateOperationStatus(result.id, 'FAILED', result.error);
        }
      }
      await updatePendingCount();
    } catch (error: any) {
      console.error('Sync error', error);
      // Could handle 401 or network errors gracefully here
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <ConnectivityContext.Provider value={{ isOnline, isSyncing, pendingCount, triggerSync, enqueueOperation }}>
      {children}
    </ConnectivityContext.Provider>
  );
};

export const useConnectivity = () => useContext(ConnectivityContext);
