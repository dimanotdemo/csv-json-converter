import App, { AppHandle } from "@/App"
import { useSearchParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { EXAMPLE_DATASETS } from '@/data/example-datasets'
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ConvertPage() {
  const [searchParams] = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'
  const appRef = useRef<AppHandle>(null)
  const [isLoading, setIsLoading] = useState(isDemo)
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    if (!isDemo) {
      setIsLoading(false)
      return
    }

    const timer = setTimeout(() => {
      if (appRef.current) {
        try {
          const randomIndex = Math.floor(Math.random() * EXAMPLE_DATASETS.length)
          const dataset = EXAMPLE_DATASETS[randomIndex]
          
          const headers = Object.keys(dataset.data[0]).join(',')
          const rows = dataset.data.map(row => Object.values(row).join(','))
          const csvContent = [headers, ...rows].join('\n')

          appRef.current.handleFileSelect(csvContent, `${dataset.name.toLowerCase()}.csv`)
          
          setTimeout(() => {
            setIsLoading(false)
          }, 500)
        } catch (error) {
          console.error('Error in demo initialization:', error)
          setIsLoading(false)
        }
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [isDemo])

  const handleUploadClick = () => {
    setShowUpload(true)
  }

  return (
    <>
      <div style={{ display: isLoading ? 'none' : 'block' }}>
        <App ref={appRef} hideUpload={isDemo && !showUpload} />
        
        {/* Add Upload Button when in demo mode and upload not shown */}
        {isDemo && !showUpload && (
          <div className="fixed bottom-4 left-4 z-50">
            <Button 
              size="lg"
              onClick={handleUploadClick}
              className="shadow-lg"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Your CSV
            </Button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isLoading && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50"
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="h-12 w-12 text-primary" />
              </motion.div>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-medium text-muted-foreground"
              >
                Generating demo data...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 