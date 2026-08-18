/**
 * Real-time Technician Event System & Notification Bus
 * Dispatches cross-window and in-app alerts whenever new intake requests are submitted.
 */

export interface NewIntakePayload {
  draftOrderId: string;
  ticketNumber: string;
  customerName: string;
  deviceModel: string;
  deviceManufacturer: string;
  serviceTier: string;
  issueDescription: string;
  timestamp: string;
  attachedPhotoCount?: number;
}

const CHANNEL_NAME = 'dcp_technician_realtime_channel';
const STORAGE_KEY = 'dcp_technician_notifications';
const EVENT_NAME = 'dcp_new_intake_submitted';

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel initialization error:', e);
  }
}

/**
 * Dispatch a real-time alert to all technicians across tabs and local session
 */
export function broadcastTechnicianIntakeAlert(payload: NewIntakePayload): void {
  // 1. BroadcastChannel for cross-tab communication
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: EVENT_NAME, payload });
    } catch (e) {
      console.warn('Failed to post to BroadcastChannel:', e);
    }
  }

  // 2. CustomEvent for current window
  if (typeof window !== 'undefined') {
    try {
      const customEvent = new CustomEvent(EVENT_NAME, { detail: payload });
      window.dispatchEvent(customEvent);
    } catch (e) {
      console.warn('Failed to dispatch CustomEvent:', e);
    }

    // 3. Persist to notifications history in localStorage
    try {
      const existingRaw = localStorage.getItem(STORAGE_KEY);
      const existing: NewIntakePayload[] = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [payload, ...existing.filter(item => item.draftOrderId !== payload.draftOrderId)].slice(0, 30);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist notification:', e);
    }
  }
}

/**
 * Subscribe to real-time technician intake alerts
 */
export function subscribeToTechnicianAlerts(
  onAlert: (payload: NewIntakePayload) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<NewIntakePayload>;
    if (custom.detail) {
      onAlert(custom.detail);
    }
  };

  const handleBroadcastMessage = (e: MessageEvent) => {
    if (e.data && e.data.type === EVENT_NAME && e.data.payload) {
      onAlert(e.data.payload);
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const notifications: NewIntakePayload[] = JSON.parse(e.newValue);
        if (notifications.length > 0) {
          // Trigger alert for latest intake
          onAlert(notifications[0]);
        }
      } catch (err) {
        // ignore parse errors
      }
    }
  };

  window.addEventListener(EVENT_NAME, handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcastMessage);
  }

  return () => {
    window.removeEventListener(EVENT_NAME, handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcastMessage);
    }
  };
}

/**
 * Get persisted technician notifications history
 */
export function getPersistedTechnicianAlerts(): NewIntakePayload[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
