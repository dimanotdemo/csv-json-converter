import { Link } from 'react-router-dom'
import { siGithub, siX } from 'simple-icons/icons'

export function Footer() {
  return (
    <footer className="w-full border-t py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link className="text-sm text-muted-foreground hover:text-primary" to="/convert">Converter</Link></li>
              <li><Link className="text-sm text-muted-foreground hover:text-primary" to="/#features">Features</Link></li>
              <li><Link className="text-sm text-muted-foreground hover:text-primary" to="/#how-it-works">How It Works</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link className="text-sm text-muted-foreground hover:text-primary" to="#">Documentation</Link></li>
              <li><Link className="text-sm text-muted-foreground hover:text-primary" to="#">API</Link></li>
              <li><Link className="text-sm text-muted-foreground hover:text-primary" to="#">Support</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link className="text-sm text-muted-foreground hover:text-primary" to="#">Privacy Policy</Link></li>
              <li><Link className="text-sm text-muted-foreground hover:text-primary" to="#">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="https://github.com" className="text-muted-foreground hover:text-primary">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                  <path d={siGithub.path} />
                </svg>
              </a>
              <a href="https://twitter.com" className="text-muted-foreground hover:text-primary">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                  <path d={siX.path} />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t">
          <p className="text-sm text-muted-foreground text-center">
            © 2024 CSV2JSON. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 