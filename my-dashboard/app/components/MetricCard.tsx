import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface MetricCardProps {
  title: string
  value: number
  unit?: string
}

export default function MetricCard({ title, value, unit = '%' }: MetricCardProps) {
  const getColor = () => {
    if (value > 80) return 'text-red-600'
    if (value > 60) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${getColor()}`}>
          {value}{unit}
        </div>
        {unit === '%' && (
          <Progress value={value} className="mt-2" />
        )}
      </CardContent>
    </Card>
  )
}
