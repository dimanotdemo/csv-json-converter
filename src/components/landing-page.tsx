import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, FileJson, FileSpreadsheet, Zap, Columns, Table } from "lucide-react"
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Footer } from "@/components/ui/footer"
import { Header } from "@/components/ui/header"
import { EXAMPLE_DATASETS } from '@/data/example-datasets'
import { StreamingText } from "@/components/ui/streaming-text"
import { FeatureCard } from "@/components/ui/feature-card"
import { HowItWorksCard } from "@/components/ui/how-it-works-card"
import { siShopify } from "simple-icons/icons"

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: <Zap className="h-12 w-12 text-primary" />,
    title: "Lightning Fast",
    description: "Convert your CSV files to JSON in milliseconds"
  },
  {
    icon: <FileSpreadsheet className="h-12 w-12 text-primary" />,
    title: "Advanced Parsing",
    description: "Support for complex CSV structures and custom delimiters"
  },
  {
    icon: <FileJson className="h-12 w-12 text-primary" />,
    title: "Elegant Output",
    description: "Get beautifully formatted and valid JSON results"
  },
  {
    icon: (
      <svg
        role="img"
        viewBox="0 0 24 24"
        className="h-12 w-12 text-primary"
        fill="currentColor"
      >
        <path d={siShopify.path} />
      </svg>
    ),
    title: "Shopify Compatible",
    description: "Perfect for Shopify product imports and metafields"
  },
  {
    icon: <Columns className="h-12 w-12 text-primary" />,
    title: "Column Management",
    description: "Drag-and-drop column ordering with custom mapping options"
  },
  {
    icon: <Table className="h-12 w-12 text-primary" />,
    title: "Live Preview",
    description: "Real-time data preview with sticky headers and resizable columns"
  }
]

export function LandingPage() {
  const [isConverted, setIsConverted] = useState(false)
  const [currentDataset, setCurrentDataset] = useState(EXAMPLE_DATASETS[0])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // Load random dataset on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * EXAMPLE_DATASETS.length)
    setCurrentDataset(EXAMPLE_DATASETS[randomIndex])
    
    let timer1: NodeJS.Timeout
    let timer2: NodeJS.Timeout

    const initializeAnimation = () => {
      timer1 = setTimeout(() => {
        setIsConverted(true)
      }, 1000)
    }

    initializeAnimation()

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  const handleGenerateExample = () => {
    try {
      setIsLoading(true)
      setIsConverted(false)
      
      const currentIndex = EXAMPLE_DATASETS.findIndex(d => d.name === currentDataset.name)
      const nextIndex = (currentIndex + 1) % EXAMPLE_DATASETS.length
      setCurrentDataset(EXAMPLE_DATASETS[nextIndex])
      
      setTimeout(() => {
        setIsConverted(true)
        setIsLoading(false)
      }, 500)
    } catch {
      setIsLoading(false)
    }
  }

  const jsonOutput = useMemo(() => ({
    [currentDataset.name.toLowerCase()]: currentDataset.data.map(currentDataset.transform)
  }), [currentDataset])

  const handleGetLucky = () => {
    setIsLoading(true)
    setTimeout(() => {
      navigate('/convert?demo=true')
    }, 100)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header showNav={true} />

      <main className="flex-1">
        <section className="w-full py-8 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-12 space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tighter">
                Convert CSV to JSON with Elegance
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-[700px] mx-auto px-4">
                Transform your data seamlessly with our sophisticated CSV to JSON converter.
              </p>
            </div>

            <Card className="border-0 shadow-none mb-8">
              <div className="flex justify-end mb-4 px-4">
                <Button 
                  variant="outline" 
                  onClick={handleGenerateExample}
                  className="text-sm w-full sm:w-auto"
                  disabled={isLoading}
                >
                  {isLoading ? "Generating..." : "Generate Another Example"}
                </Button>
              </div>
              <div className="overflow-hidden">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="grid grid-cols-1 lg:grid-cols-[minmax(400px,1fr),auto,minmax(400px,1fr)] gap-4 lg:gap-8 px-4"
                >
                  {/* CSV Side */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full min-w-[400px] max-w-[600px] mx-auto lg:mx-0"
                  >
                    <div className="rounded-lg border bg-card text-card-foreground">
                      <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted">
                        <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{currentDataset.name.toLowerCase()}.csv</span>
                      </div>
                      <div className="overflow-auto" style={{ height: '234px' }}>
                        <table className="w-full table-fixed border-collapse">
                          <thead>
                            <tr>
                              {Object.keys(currentDataset.data[0]).map((header) => (
                                <th
                                  key={header}
                                  className="sticky top-0 text-left py-3 px-4 bg-muted font-medium text-muted-foreground whitespace-nowrap w-[200px]"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {currentDataset.data.map((row, i) => (
                              <tr key={i} className="border-b last:border-0">
                                {Object.values(row).map((cell, j) => (
                                  <td key={j} className="py-3 px-4 whitespace-nowrap overflow-hidden text-ellipsis w-[200px]">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>

                  {/* Arrow */}
                  <div className="hidden lg:flex items-center justify-center">
                    <motion.div
                      animate={isConverted ? 
                        { rotate: 360, scale: 1.2, color: 'var(--primary)' } : 
                        { rotate: 0, scale: 1, color: 'var(--muted-foreground)' }
                      }
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    >
                      <ArrowRight className="h-8 w-8" />
                    </motion.div>
                  </div>

                  {/* Mobile Arrow */}
                  <div className="flex lg:hidden items-center justify-center">
                    <motion.div
                      animate={isConverted ? 
                        { rotate: 90, scale: 1.2, color: 'var(--primary)' } : 
                        { rotate: 90, scale: 1, color: 'var(--muted-foreground)' }
                      }
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    >
                      <ArrowRight className="h-8 w-8" />
                    </motion.div>
                  </div>

                  {/* JSON Side */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full min-w-[400px] max-w-[600px] mx-auto lg:mx-0"
                  >
                    <div className="rounded-lg border bg-card h-full">
                      <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted">
                        <FileJson className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{currentDataset.name.toLowerCase()}.json</span>
                      </div>
                      <div className="bg-muted/50 p-4 font-mono text-xs md:text-sm overflow-auto" style={{ minHeight: '234px', maxHeight: '234px' }}>
                        <AnimatePresence mode="wait">
                          {isConverted ? (
                            <motion.pre
                              key="json"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="text-primary"
                            >
                              <StreamingText 
                                text={JSON.stringify(jsonOutput, null, 2)}
                                duration={1500}
                              />
                            </motion.pre>
                          ) : (
                            <motion.div
                              key="placeholder"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="text-muted-foreground"
                            >
                              {`{
  "${currentDataset.name.toLowerCase()}": [
    {
      // Your structured JSON data
      // will appear here...
    }
  ]
}`}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </Card>

            <div className="flex justify-center gap-4 px-4">
              <Link to="/convert" className="w-full sm:w-auto">
                <Button size="lg" className="text-lg px-8 w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 w-full sm:w-auto"
                onClick={handleGetLucky}
              >
                Get Lucky
                <Zap className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800"
        >
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-5xl font-bold tracking-tighter text-center mb-8 md:mb-12">Features</h2>
            <div className="grid gap-6 md:gap-10 sm:grid-cols-2 md:grid-cols-3">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </motion.section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-900">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-8 md:mb-12">How It Works</h2>
            <div className="grid gap-6 md:gap-10 sm:grid-cols-2 md:grid-cols-3">
              <HowItWorksCard
                step={1}
                icon={<FileSpreadsheet className="h-12 w-12 text-primary" />}
                title="Upload CSV"
                description="Drag and drop your CSV file or paste content directly. Support for multiple file formats."
              />
              <HowItWorksCard
                step={2}
                icon={<Columns className="h-12 w-12 text-primary" />}
                title="Configure"
                description="Customize column mapping, data types, and transformation rules to match your needs."
              />
              <HowItWorksCard
                step={3}
                icon={<FileJson className="h-12 w-12 text-primary" />}
                title="Export JSON"
                description="Preview your structured JSON data and download it in your preferred format."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-8 md:py-12 lg:py-24 bg-primary">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-primary-foreground">
                Ready to Transform Your Data?
              </h2>
              <p className="text-lg md:text-xl text-primary-foreground/80 max-w-[600px] mx-auto">
                Join thousands of users who trust CSV2JSON for their data conversion needs.
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <Link to="/convert" className="w-full sm:w-auto">
                  <Button size="lg" variant="secondary" className="text-lg px-8 w-full sm:w-auto">
                    Start Converting
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}