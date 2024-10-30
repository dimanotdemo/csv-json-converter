import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

interface HowItWorksCardProps {
  icon: React.ReactNode
  title: string
  description: string
  step?: number
}

export function HowItWorksCard({ icon, title, description, step }: HowItWorksCardProps) {
  return (
    <Card className="relative">
      <CardContent className="flex flex-col items-center space-y-4 p-6">
        {step && (
          <div className="absolute -top-3 -left-3 rounded-full bg-primary text-primary-foreground w-12 h-12 flex items-center justify-center text-xl font-bold shadow-lg">
            {step}
          </div>
        )}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="mt-4"
        >
          {icon}
        </motion.div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-center text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  )
} 