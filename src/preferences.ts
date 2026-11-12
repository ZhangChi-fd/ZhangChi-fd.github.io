export function readPreference(key: string, fallback: string) {
  try { return localStorage.getItem('xp.' + key) ?? fallback } catch { return fallback }
}

export function savePreference(key: string, value: string) {
  try { localStorage.setItem('xp.' + key, value) } catch { /* Session state still works. */ }
}
