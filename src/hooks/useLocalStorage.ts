import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook for localStorage with type safety
 * Replaces @github/spark useKV hook
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  })

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      setState(prevState => {
        const newValue = typeof value === 'function' ? (value as (prev: T) => T)(prevState) : value
        localStorage.setItem(key, JSON.stringify(newValue))
        return newValue
      })
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key])

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setState(JSON.parse(e.newValue))
        } catch (error) {
          console.warn(`Error parsing localStorage change for key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [state, setValue]
}

// Alias to match the original API
export const useKV = useLocalStorage