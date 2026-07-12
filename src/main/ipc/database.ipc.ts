import { ipcMain } from 'electron'
import db from '../database'

export function registerDatabaseIPC() {
  // Guardar punto de historial
  ipcMain.handle('save-posture-point', (_, data) => {
    const stmt = db.prepare(`
      INSERT INTO posture_history (session_id, user_id, timestamp, score, cervical_angle, shoulder_tilt, is_good_posture)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(data.sessionId, data.userId, new Date().toISOString(),
      data.score, data.cervicalAngle, data.shoulderTilt, data.isGoodPosture ? 1 : 0)
  })

  // Obtener historial de los últimos N días
  ipcMain.handle('get-history', (_, { userId, days }) => {
    const stmt = db.prepare(`
      SELECT date(timestamp) as day,
             AVG(score) as avg_score,
             SUM(CASE WHEN is_good_posture = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as pct_correct
      FROM posture_history
      WHERE user_id = ? AND timestamp >= datetime('now', ? || ' days')
      GROUP BY date(timestamp)
      ORDER BY day ASC
    `)
    return stmt.all(userId, `-${days}`)
  })

  // Guardar configuración
  ipcMain.handle('save-config', (_, { key, value }) => {
    const stmt = db.prepare('INSERT OR REPLACE INTO user_config (key, value) VALUES (?, ?)')
    stmt.run(key, JSON.stringify(value))
  })

  // Leer configuración
  ipcMain.handle('get-config', (_, key) => {
    const row = db.prepare('SELECT value FROM user_config WHERE key = ?').get(key) as any
    return row ? JSON.parse(row.value) : null
  })
}
