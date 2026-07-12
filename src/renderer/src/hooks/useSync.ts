import { useEffect, useState } from 'react'

export function useSync(userId: string | null) {
  const [syncStatus, setSyncStatus] = useState<string>('Sincronizando...')

  useEffect(() => {
    if (!userId) return

    const doSync = async () => {
      try {
        const result = await window.api.syncToCloud(userId)
        if (result.synced > 0) {
          setSyncStatus('Sincronizado')
        }
      } catch (err) {
        console.error('Error syncing to cloud', err)
        setSyncStatus('Error de sync')
      }
    }

    // Try initial sync
    doSync()

    // Sync every 5 minutes
    const interval = setInterval(doSync, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [userId])

  return { syncStatus }
}
