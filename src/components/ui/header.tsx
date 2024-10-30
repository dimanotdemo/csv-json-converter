import { Link } from 'react-router-dom'
import { FileJson, Moon, Sun } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  showNav?: boolean;
}

export function Header({ showNav = false }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white dark:bg-gray-900">
      <Link className="flex items-center justify-center" to="/">
        <FileJson className="h-6 w-6 mr-2" />
        <span className="font-bold">CSV2JSON</span>
      </Link>
      <nav className="ml-auto flex items-center gap-4 sm:gap-6">
        {showNav && (
          <a 
            href="#features" 
            onClick={(e) => handleScroll(e, 'features')}
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Features
          </a>
        )}
        <button 
          onClick={toggleDarkMode} 
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700" 
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </nav>
    </header>
  )
} 