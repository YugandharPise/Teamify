import { supabase } from '../lib/supabase';

/**
 * Completely clear the current session and all storage
 * Call this function from browser console if you get stuck
 */
export async function clearSession() {
  console.log('Clearing session...');

  // 1. Sign out from Supabase
  await supabase.auth.signOut();

  // 2. Clear localStorage
  localStorage.clear();

  // 3. Clear sessionStorage
  sessionStorage.clear();

  // 4. Clear all cookies
  document.cookie.split(';').forEach(cookie => {
    const name = cookie.split('=')[0].trim();
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  });

  console.log('Session cleared! Reloading page...');

  // 5. Reload page
  window.location.reload();
}

// Make it available globally for easy console access
(window as any).clearSession = clearSession;
