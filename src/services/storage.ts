export interface HistoryEntry {
  id: string
  expression: string
  result: string
  timestamp: number
  mode: string
}

export const storage = {
  history(): HistoryEntry[] {
    try {
      return JSON.parse(localStorage.getItem('nexus-history') || '[]')
    } catch {
      return []
    }
  },
  saveHistory(entries: HistoryEntry[]) {
    localStorage.setItem('nexus-history', JSON.stringify(entries))
  },
  memory(): string {
    return localStorage.getItem('nexus-memory') || '0'
  },
  saveMemory(value: string) {
    localStorage.setItem('nexus-memory', value)
  },
  theme(): 'dark' | 'light' {
    return localStorage.getItem('nexus-theme') === 'light' ? 'light' : 'dark'
  },
  saveTheme(theme: 'dark' | 'light') {
    localStorage.setItem('nexus-theme', theme)
  },
}
