// Configuration for realtime behavior. Toggle these flags to control auto-updates.
export const realtimeConfig = {
  // When false, the app will not automatically invalidate or refetch blog lists/details
  // on realtime events (e.g., to stop UI auto-reloads while keeping other realtime features).
  invalidateBlogs: false,

  // If true, `Home` will set a setInterval to automatically refetch blogs periodically.
  // Set to false to stop automatic polling from the client.
  autoRefetchBlogs: false,

  // If true, `RealtimeContext` will poll `realtimeService.isConnected()` on an interval.
  // Set to false to avoid the heartbeat polling and only set connection status on mount/focus.
  pollConnection: false,
};

export default realtimeConfig;
