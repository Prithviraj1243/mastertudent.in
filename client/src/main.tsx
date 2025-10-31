import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Cache busting and service worker cleanup
async function clearAllCaches() {
  try {
    // Clear all cache storage
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('Cleared cache storage');
    }
    
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
      console.log('Unregistered service workers');
    }
  } catch (error) {
    console.warn('Cache clearing failed:', error);
  }
}

// Version checking for auto-reload
let lastSeenVersion: number | null = null;

async function checkVersion() {
  try {
    const response = await fetch('/api/version', { cache: 'no-store' });
    const data = await response.json();
    
    if (lastSeenVersion && lastSeenVersion !== data.version) {
      console.log('New version detected, reloading with cache bypass...');
      await clearAllCaches();
      // Force reload with version parameter to bypass HTTP cache
      const url = new URL(window.location.href);
      url.searchParams.set('v', String(data.version));
      window.location.replace(url.toString());
    } else {
      lastSeenVersion = data.version;
    }
  } catch (error) {
    console.warn('Version check failed:', error);
  }
}

// Initialize version checking and mount app
checkVersion().then(() => {
  // Set up periodic version checking
  setInterval(checkVersion, 30000); // Check every 30 seconds
  
  // Mount the app immediately (cache clearing only happens on version mismatch now)
  createRoot(document.getElementById("root")!).render(<App />);
});
