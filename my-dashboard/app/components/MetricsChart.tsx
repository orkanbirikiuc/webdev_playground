'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface MetricsChartProps {
  data: any[]
}

export default function MetricsChart({ data }: MetricsChartProps) {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Metrics History</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="cpu" stroke="#ef4444" name="CPU" />
            <Line type="monotone" dataKey="memory" stroke="#3b82f6" name="Memory" />
            <Line type="monotone" dataKey="disk" stroke="#10b981" name="Disk" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
