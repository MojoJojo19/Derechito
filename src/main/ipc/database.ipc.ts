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

  // Obtener historial de los últimos N días (para gráficas)
  ipcMain.handle('get-history', (_, { userId, days }) => {
    const stmt = db.prepare(`
      SELECT date(timestamp) as day,
             AVG(score) as avg_score,
             SUM(CASE WHEN is_good_posture = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as pct_correct,
             SUM(CASE WHEN is_good_posture = 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as pct_bad,
             COUNT(*) as total_points
      FROM posture_history
      WHERE user_id = ? AND timestamp >= datetime('now', ? || ' days')
      GROUP BY date(timestamp)
      ORDER BY day ASC
    `)
    return stmt.all(userId, `-${days}`)
  })

  // Obtener desglose diario (para la tabla de registro diario)
  ipcMain.handle('get-daily-log', (_, { userId, days }) => {
    const stmt = db.prepare(`
      SELECT date(timestamp) as day,
             AVG(score) as avg_score,
             SUM(CASE WHEN is_good_posture = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as pct_correct,
             COUNT(*) as total_points
      FROM posture_history
      WHERE user_id = ? AND timestamp >= datetime('now', ? || ' days')
      GROUP BY date(timestamp)
      ORDER BY day DESC
    `)
    return stmt.all(userId, `-${days}`)
  })

  // Obtener alertas del día actual
  ipcMain.handle('get-today-alerts', (_, userId) => {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM alerts
      WHERE user_id = ? AND date(fired_at) = date('now')
    `)
    return stmt.get(userId) as any
  })

  // Guardar alerta en la base de datos
  ipcMain.handle('save-alert', (_, data) => {
    const stmt = db.prepare(`
      INSERT INTO alerts (session_id, user_id, fired_at, alert_type, deviation_degrees, duration_seconds)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    stmt.run(data.sessionId, data.userId, new Date().toISOString(),
      data.alertType, data.deviationDegrees, data.durationSeconds)
  })

  // Obtener resumen de hoy (para pie chart)
  ipcMain.handle('get-today-summary', (_, userId) => {
    const stmt = db.prepare(`
      SELECT 
        SUM(CASE WHEN is_good_posture = 1 THEN 1 ELSE 0 END) * 100.0 / MAX(COUNT(*), 1) as pct_correct,
        SUM(CASE WHEN is_good_posture = 0 AND score >= 60 THEN 1 ELSE 0 END) * 100.0 / MAX(COUNT(*), 1) as pct_regular,
        SUM(CASE WHEN is_good_posture = 0 AND score < 60 THEN 1 ELSE 0 END) * 100.0 / MAX(COUNT(*), 1) as pct_bad,
        COUNT(*) as total_points
      FROM posture_history
      WHERE user_id = ? AND date(timestamp) = date('now')
    `)
    return stmt.get(userId) as any
  })

  // Obtener estadísticas semanales (para stat cards)
  ipcMain.handle('get-weekly-stats', (_, userId) => {
    // This week's average
    const thisWeek = db.prepare(`
      SELECT AVG(score) as avg_score, COUNT(DISTINCT date(timestamp)) as active_days
      FROM posture_history
      WHERE user_id = ? AND timestamp >= datetime('now', '-7 days')
    `).get(userId) as any

    // Last week's average (for comparison)
    const lastWeek = db.prepare(`
      SELECT AVG(score) as avg_score
      FROM posture_history
      WHERE user_id = ? AND timestamp >= datetime('now', '-14 days') AND timestamp < datetime('now', '-7 days')
    `).get(userId) as any

    // Best day this week
    const bestDay = db.prepare(`
      SELECT date(timestamp) as day, AVG(score) as avg_score
      FROM posture_history
      WHERE user_id = ? AND timestamp >= datetime('now', '-7 days')
      GROUP BY date(timestamp)
      ORDER BY avg_score DESC
      LIMIT 1
    `).get(userId) as any

    // Total alerts this week
    const alertsThisWeek = db.prepare(`
      SELECT COUNT(*) as count
      FROM alerts
      WHERE user_id = ? AND fired_at >= datetime('now', '-7 days')
    `).get(userId) as any

    const alertsLastWeek = db.prepare(`
      SELECT COUNT(*) as count
      FROM alerts
      WHERE user_id = ? AND fired_at >= datetime('now', '-14 days') AND fired_at < datetime('now', '-7 days')
    `).get(userId) as any

    return {
      thisWeekAvg: thisWeek?.avg_score ? Math.round(thisWeek.avg_score) : null,
      lastWeekAvg: lastWeek?.avg_score ? Math.round(lastWeek.avg_score) : null,
      activeDays: thisWeek?.active_days || 0,
      bestDay: bestDay?.day || null,
      bestDayScore: bestDay?.avg_score ? Math.round(bestDay.avg_score) : null,
      alertsThisWeek: alertsThisWeek?.count || 0,
      alertsLastWeek: alertsLastWeek?.count || 0,
    }
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
