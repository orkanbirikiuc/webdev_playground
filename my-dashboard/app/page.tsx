'use client'

import { useState, useEffect, useRef } from 'react'
import MetricCard from './components/MetricCard'
import MetricsChart from './components/MetricsChart'
import MetricDetails from './components/MetricDetails'

export default function Home() {
  const [metrics, setMetrics] = useState({ cpu: 0, memory: 0, disk: 0, network_in: 0, network_out: 0, temperature: 0 })
  const [history, setHistory] = useState<any[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<{
    title: string
    value: number
    open: boolean
  }>({ title: '', value: 0, open: false })
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchMetrics = async () => {
    const response = await fetch('api/proxy')
    const data = await response.json()
    setMetrics({
      cpu: Number(data.cpu_percent),
      memory: Number(data.mem_percent),
      disk: Number(data.disk_percent),
      network_in: Number(data.net_in_bps),
      network_out: Number(data.net_out_bps),
      temperature: Number(data.temperature_c)
    })
    setLoading(false)

    setLastUpdated(new Date(data.timestamp).toLocaleTimeString())
    
    const now = new Date().toLocaleTimeString()
    setHistory(prev => [...prev.slice(-9), { 
      time: now, 
      cpu: Number(data.cpu_percent),
      memory: Number(data.mem_percent),
      disk: Number(data.disk_percent),
      network_in: Number(data.net_in_bps),
      network_out: Number(data.net_out_bps),
      temperature: Number(data.temperature_c)
    }])
  }

  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(fetchMetrics, 5000)
  }

  const handleRefresh = () => {
    fetchMetrics()
    resetInterval()
  }

  const handleMetricClick = (title: string, value: number) => {
    setSelectedMetric({ title, value, open: true })
  }

  useEffect(() => {
    fetchMetrics()
    resetInterval()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-12 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">System Dashboard</h1>
      
      {lastUpdated && (
      <p className="text-sm text-gray-500 -mt-4 mb-4">
        Last updated: {lastUpdated}
      </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <MetricCard 
          title="CPU Usage" 
          value={metrics.cpu}
          onClick={() => handleMetricClick('CPU Usage', metrics.cpu)}
        />
        <MetricCard 
          title="Memory" 
          value={metrics.memory}
          onClick={() => handleMetricClick('Memory', metrics.memory)}
        />
        <MetricCard 
          title="Disk" 
          value={metrics.disk}
          onClick={() => handleMetricClick('Disk', metrics.disk)}
        />
        <MetricCard 
          unit='bps'
          title="Network Input" 
          value={metrics.network_in}
          onClick={() => handleMetricClick('Network Input', metrics.network_in)}
        />
        <MetricCard 
          unit='bps'
          title="Network Output" 
          value={metrics.network_out}
          onClick={() => handleMetricClick('Network Output', metrics.network_out)}
        />
        <MetricCard 
          unit='°C'
          title="Temperature" 
          value={metrics.temperature}
          onClick={() => handleMetricClick('Temperature', metrics.temperature)}
        />
        
        <MetricsChart data={history} />
      </div>
      
      <button 
        onClick={handleRefresh}
        className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Refresh Now
      </button>

      <MetricDetails
        open={selectedMetric.open}
        onClose={() => setSelectedMetric(prev => ({ ...prev, open: false }))}
        title={selectedMetric.title}
        value={selectedMetric.value}
      />
    </div>
  )
}
