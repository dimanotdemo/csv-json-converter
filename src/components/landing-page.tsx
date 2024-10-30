import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, FileJson, FileSpreadsheet, Zap, Columns, Table } from "lucide-react"
import { Link } from 'react-router-dom'
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { siShopify } from 'simple-icons/icons'
import { Footer } from "@/components/ui/footer"
import { Header } from "@/components/ui/header"
import { EXAMPLE_DATASETS } from '@/data/example-datasets'
import { StreamingText } from "@/components/ui/streaming-text"

export function LandingPage() {
  const [isConverted, setIsConverted] = useState(false)
  const [currentDataset, setCurrentDataset] = useState(EXAMPLE_DATASETS[0])

  // Load random dataset on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * EXAMPLE_DATASETS.length)
    setCurrentDataset(EXAMPLE_DATASETS[randomIndex])
    const timer = setTimeout(() => {
      setIsConverted(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleGenerateExample = () => {
    setIsConverted(false)
    // Get next dataset (cycle through them)
    const currentIndex = EXAMPLE_DATASETS.findIndex(d => d.name === currentDataset.name)
    const nextIndex = (currentIndex + 1) % EXAMPLE_DATASETS.length
    setCurrentDataset(EXAMPLE_DATASETS[nextIndex])
    setTimeout(() => {
      setIsConverted(true)
    }, 500)
  }

  const jsonOutput = {
    [currentDataset.name.toLowerCase()]: currentDataset.data.map(currentDataset.transform)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header showNav={true} />

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12 space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                Convert CSV to JSON with Elegance
              </h1>
              <p className="text-xl text-muted-foreground max-w-[700px] mx-auto">
                Transform your data seamlessly with our sophisticated CSV to JSON converter.
              </p>
            </div>

            <Card className="border-0 shadow-none mb-8">
              <div className="flex justify-end mb-4">
                <Button 
                  variant="outline" 
                  onClick={handleGenerateExample}
                  className="text-sm"
                >
                  Generate Example
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-[1fr,auto,1fr] items-stretch gap-8"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="rounded-lg border bg-card text-card-foreground h-full">
                    <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted">
                      <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{currentDataset.name.toLowerCase()}.csv</span>
                    </div>
                    <div className="overflow-auto" style={{ height: '234px' }}>
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            {Object.keys(currentDataset.data[0]).map((header) => (
                              <th
                                key={header}
                                className="sticky top-0 text-left py-3 px-4 bg-muted font-medium text-muted-foreground"
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
                                <td key={j} className="py-3 px-4">
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

                <div className="flex items-center justify-center">
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

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="rounded-lg border bg-card h-full">
                    <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted">
                      <FileJson className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{currentDataset.name.toLowerCase()}.json</span>
                    </div>
                    <div className="bg-muted/50 p-4 font-mono text-sm overflow-auto" style={{ minHeight: '234px', maxHeight: '234px' }}>
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
            </Card>

            <div className="flex justify-center gap-4">
              <Link to="/convert">
                <Button size="lg" className="text-lg px-8">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800"
        >
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Features</h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Zap className="h-12 w-12 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold">Lightning Fast</h3>
                  <p className="text-center text-muted-foreground">Convert your CSV files to JSON in milliseconds</p>
                </CardContent>
              </Card>

              <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <FileSpreadsheet className="h-12 w-12 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold">Advanced Parsing</h3>
                  <p className="text-center text-muted-foreground">Support for complex CSV structures and custom delimiters</p>
                </CardContent>
              </Card>

              <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <FileJson className="h-12 w-12 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold">Elegant Output</h3>
                  <p className="text-center text-muted-foreground">Get beautifully formatted and valid JSON results</p>
                </CardContent>
              </Card>

              <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <svg
                      role="img"
                      viewBox="0 0 24 24"
                      className="h-12 w-12 text-primary"
                      fill="currentColor"
                    >
                      <path d={siShopify.path} />
                    </svg>
                  </motion.div>
                  <h3 className="text-xl font-bold">Shopify Compatible</h3>
                  <p className="text-center text-muted-foreground">Perfect for Shopify product imports and metafields</p>
                </CardContent>
              </Card>

              <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Columns className="h-12 w-12 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold">Column Management</h3>
                  <p className="text-center text-muted-foreground">Drag-and-drop column ordering with custom mapping options</p>
                </CardContent>
              </Card>

              <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Table className="h-12 w-12 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold">Live Preview</h3>
                  <p className="text-center text-muted-foreground">Real-time data preview with sticky headers and resizable columns</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">How It Works</h2>
            <div className="grid gap-10 sm:grid-cols-3">
              <Card className="relative">
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <div className="absolute -top-3 -left-3 rounded-full bg-primary text-primary-foreground w-12 h-12 flex items-center justify-center text-xl font-bold shadow-lg">
                    1
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="mt-4"
                  >
                    <FileSpreadsheet className="h-12 w-12 text-primary mb-2" />
                  </motion.div>
                  <h3 className="text-xl font-bold">Upload CSV</h3>
                  <p className="text-center text-muted-foreground">
                    Drag and drop your CSV file or paste content directly. Support for multiple file formats.
                  </p>
                </CardContent>
              </Card>
              <Card className="relative sm:mt-8">
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <div className="absolute -top-3 -left-3 rounded-full bg-primary text-primary-foreground w-12 h-12 flex items-center justify-center text-xl font-bold shadow-lg">
                    2
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="mt-4"
                  >
                    <Columns className="h-12 w-12 text-primary mb-2" />
                  </motion.div>
                  <h3 className="text-xl font-bold">Configure</h3>
                  <p className="text-center text-muted-foreground">
                    Customize column mapping, data types, and transformation rules to match your needs.
                  </p>
                </CardContent>
              </Card>
              <Card className="relative sm:mt-16">
                <CardContent className="flex flex-col items-center space-y-4 p-6">
                  <div className="absolute -top-3 -left-3 rounded-full bg-primary text-primary-foreground w-12 h-12 flex items-center justify-center text-xl font-bold shadow-lg">
                    3
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="mt-4"
                  >
                    <FileJson className="h-12 w-12 text-primary mb-2" />
                  </motion.div>
                  <h3 className="text-xl font-bold">Export JSON</h3>
                  <p className="text-center text-muted-foreground">
                    Preview your structured JSON data and download it in your preferred format.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 bg-primary">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-primary-foreground">
                Ready to Transform Your Data?
              </h2>
              <p className="text-xl text-primary-foreground/80 max-w-[600px] mx-auto">
                Join thousands of users who trust CSV2JSON for their data conversion needs.
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <Link to="/convert">
                  <Button size="lg" variant="secondary" className="text-lg px-8">
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