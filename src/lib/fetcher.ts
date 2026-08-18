/**
 * Centralized fetcher logic with cross-origin credentials inclusion
 * and graceful 401 Unauthorized handling for authenticated endpoints.
 */
export const profileFetcher = (url: string, init?: RequestInit) =>
  fetch(url, {
    credentials: 'include',
    ...init,
  }).then((res) => {
    if (res.status === 401) return null;
    if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
    return res.status === 204 ? null : res.json();
  });
