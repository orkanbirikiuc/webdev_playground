import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface MetricCardProps {
  title: string
  value: number
  unit?: string
  onClick?: () => void
}

export default function MetricCard({ title, value, unit = '%', onClick }: MetricCardProps) {
  const getColor = () => {
    if (value > 80) return 'text-red-600'
    if (value > 60) return 'text-yellow-600'
    return 'text-green-600'
  }
  const pgBgColor1 = () => {
    if (value > 80) return 'bg-red-600'
    if (value > 60) return 'bg-yellow-600'
    return 'bg-green-600'
  }
  const pgBgColor2 = () => {
    if (value > 80000) return 'bg-red-600'
    if (value > 60000) return 'bg-yellow-600'
    return 'bg-green-600'
  }
  const pgBgColor3 = () => {
    if (value > 80) return 'bg-red-600'
    if (value > 60) return 'bg-yellow-600'
    return 'bg-green-600'
  }

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-lg" 
      onClick={onClick}
    >
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
          <Progress value={value} className="mt-2" primaryColor={pgBgColor1()} />
        )}
        {unit === 'bps' && (
          <Progress value={value} className="mt-2" primaryColor={pgBgColor2()} />
        )}
        {unit === '°C' && (
          <Progress value={value} className="mt-2" primaryColor={pgBgColor3()} />
        )}
      </CardContent>
    </Card>
  )
}
