// Sync Manager - Handles background synchronization when online
import { getPendingMutations, removeMutation, getPendingCount, cleanupSyncedItems } from './offlineStorage';

type ConnectionStatus = 'online' | 'offline' | 'syncing';
type StatusListener = (status: ConnectionStatus, pendingCount: number) => void;

let currentStatus: ConnectionStatus = navigator.onLine ? 'online' : 'offline';
let pendingCount = 0;
let listeners: StatusListener[] = [];
let syncInterval: NodeJS.Timeout | null = null;

// Subscribe to connection status changes
export function subscribeToStatus(listener: StatusListener): () => void {
  listeners.push(listener);
  listener(currentStatus, pendingCount);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

// Notify all listeners
function notifyListeners() {
  listeners.forEach(l => l(currentStatus, pendingCount));
}

// Update pending count
async function updatePendingCount() {
  try {
    pendingCount = await getPendingCount();
    notifyListeners();
  } catch (e) {
    console.error('Error getting pending count:', e);
  }
}

// Sync pending mutations to server
export async function syncPendingMutations(): Promise<{ success: number; failed: number }> {
  if (!navigator.onLine) {
    return { success: 0, failed: 0 };
  }
  
  currentStatus = 'syncing';
  notifyListeners();
  
  let success = 0;
  let failed = 0;
  
  try {
    const mutations = await getPendingMutations();
    
    for (const mutation of mutations) {
      try {
        const response = await fetch(mutation.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mutation.data),
          credentials: 'include'
        });
        
        if (response.ok) {
          await removeMutation(mutation.id);
          // Mark the offline record as synced
          await markOfflineRecordSynced(mutation.type, mutation.data);
          success++;
        } else {
          failed++;
        }
      } catch (e) {
        failed++;
      }
    }
    
    // Cleanup old synced items
    await cleanupSyncedItems();
    
  } catch (e) {
    console.error('Sync error:', e);
  }
  
  currentStatus = navigator.onLine ? 'online' : 'offline';
  await updatePendingCount();
  
  return { success, failed };
}

// Mark offline records as synced after successful upload
async function markOfflineRecordSynced(type: string, data: any): Promise<void> {
  try {
    const db = await import('./offlineStorage').then(m => m.initOfflineDB());
    const storeName = type === 'log' ? 'offlineLogs' : 'offlineTasks';
    
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const index = store.index('projectId');
    const request = index.openCursor(data.projectId);
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const record = cursor.value;
        // Match by timestamp and content
        if (record.timestamp === data.timestamp && !record.synced) {
          record.synced = true;
          cursor.update(record);
        }
        cursor.continue();
      }
    };
  } catch (e) {
    console.error('Error marking record as synced:', e);
  }
}

// Initialize sync manager
export function initSyncManager() {
  // Initial status
  currentStatus = navigator.onLine ? 'online' : 'offline';
  updatePendingCount();
  
  // Listen for online/offline events
  window.addEventListener('online', async () => {
    currentStatus = 'online';
    notifyListeners();
    
    // Auto-sync when coming online
    const result = await syncPendingMutations();
    if (result.success > 0) {
      console.log(`Synced ${result.success} items`);
    }
  });
  
  window.addEventListener('offline', () => {
    currentStatus = 'offline';
    notifyListeners();
  });
  
  // Periodic sync check every 30 seconds when online
  syncInterval = setInterval(async () => {
    if (navigator.onLine && pendingCount > 0) {
      await syncPendingMutations();
    }
  }, 30000);
  
  // Sync on page visibility change (when user returns to app)
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && navigator.onLine) {
      await updatePendingCount();
      if (pendingCount > 0) {
        await syncPendingMutations();
      }
    }
  });
}

// Get current status
export function getConnectionStatus(): ConnectionStatus {
  return currentStatus;
}

// Manual sync trigger
export async function triggerSync(): Promise<{ success: number; failed: number }> {
  return syncPendingMutations();
}
