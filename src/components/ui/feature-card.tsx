import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardContent className="flex flex-col items-center space-y-4 p-6">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 10 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {icon}
        </motion.div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-center text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
} 