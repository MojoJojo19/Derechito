import { useState, useEffect } from 'react'

export function useSystemMetrics() {
  const [cpu, setCpu] = useState(0)
  const [ram, setRam] = useState({ usedMB: 0, totalMB: 0, pct: 0 })

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const cpuPct = await window.api.getCpuUsage()
        const ramData = await window.api.getRamUsage()
        setCpu(cpuPct)
        setRam(ramData)
      } catch (err) {
        console.error("Failed to fetch system metrics", err)
      }
    }
    
    // Initial fetch
    fetchMetrics()

    const interval = setInterval(fetchMetrics, 2000)
    return () => clearInterval(interval)
  }, [])

  return { cpu, ram }
}
