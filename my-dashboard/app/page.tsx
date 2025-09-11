'use client'

import { useState, useEffect } from 'react'
import MetricCard from './components/MetricCard'

export default function Home() {
  const [metrics, setMetrics] = useState({
    cpu: 0,
    memory: 0,
    disk: 0
  })
  const [loading, setLoading] = useState(true)

  const fetchMetrics = async () => {
    const response = await fetch('/api/metrics')
    const data = await response.json()
    setMetrics(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000) // Auto-refresh every 5s
    return () => clearInterval(interval) // Cleanup
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">System Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="CPU Usage" value={metrics.cpu} />
        <MetricCard title="Memory" value={metrics.memory} />
        <MetricCard title="Disk" value={metrics.disk} />
      </div>
      
      <button 
        onClick={fetchMetrics}
        className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Refresh Now
      </button>
    </div>
  )
}
