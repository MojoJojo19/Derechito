import { ipcMain } from 'electron'
import { createClient } from '@supabase/supabase-js'
import db from '../database'

// Se asume que las variables de entorno estarán disponibles en producción o se configurarán
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://example.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key'

const supabase = createClient(supabaseUrl, supabaseKey)

export function registerSyncIPC() {
  ipcMain.handle('sync-to-cloud', async (_, userId) => {
    // Obtener registros no sincronizados
    const unsynced = db.prepare(`
      SELECT * FROM posture_history WHERE user_id = ? AND synced = 0 LIMIT 500
    `).all(userId) as any[]

    if (unsynced.length === 0) return { synced: 0 }

    const { error } = await supabase.from('posture_history').insert(
      unsynced.map((row) => ({
        user_id: row.user_id,
        session_id: row.session_id,
        timestamp: row.timestamp,
        score: row.score,
        cervical_angle: row.cervical_angle,
        shoulder_tilt: row.shoulder_tilt,
        is_good_posture: row.is_good_posture === 1,
      }))
    )

    if (!error) {
      // Marcar como sincronizados
      const ids = unsynced.map((r) => r.id).join(',')
      db.exec(`UPDATE posture_history SET synced = 1 WHERE id IN (${ids})`)
      return { synced: unsynced.length }
    }

    return { synced: 0, error }
  })
}
