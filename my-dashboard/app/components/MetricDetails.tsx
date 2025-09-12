import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface MetricDetailsProps {
  open: boolean
  onClose: () => void
  title: string
  value: number
  unit?: string
}

export default function MetricDetails({ open, onClose, title, value, unit = '%' }: MetricDetailsProps) {
  const status = value > 80 ? 'Critical' : value > 60 ? 'Warning' : 'Healthy'
  const statusColor = value > 80 ? 'text-red-600' : value > 60 ? 'text-yellow-600' : 'text-green-600'
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title} Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Current Value</p>
            <p className="text-3xl font-bold">{value}{unit}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className={`text-xl font-semibold ${statusColor}`}>{status}</p>
          </div>
          <div className="bg-gray-100 p-3 rounded">
            <p className="text-sm">
              {value > 80 && "⚠️ System resources are critically high. Consider scaling or optimization."}
              {value > 60 && value <= 80 && "📊 Moderate usage detected. Monitor for trends."}
              {value <= 60 && "✅ System is running smoothly within normal parameters."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
