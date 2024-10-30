import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface StreamingTextProps {
  text: string;
  duration?: number;
  onComplete?: () => void;
}

export function StreamingText({ text, duration = 1000, onComplete }: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    let timeoutId: number
    const charsPerStep = Math.ceil(text.length / (duration / 16)) // 16ms per frame
    let currentIndex = 0

    const streamText = () => {
      if (currentIndex < text.length) {
        const nextIndex = Math.min(currentIndex + charsPerStep, text.length)
        setDisplayedText(text.slice(0, nextIndex))
        currentIndex = nextIndex
        timeoutId = window.setTimeout(streamText, 16)
      } else {
        onComplete?.()
      }
    }

    streamText()

    return () => {
      clearTimeout(timeoutId)
    }
  }, [text, duration, onComplete])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {displayedText}
    </motion.div>
  )
} 