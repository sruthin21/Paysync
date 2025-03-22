import type React from "react"
import { Link } from "react-router-dom"

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white">
          PaySync
        </Link>
        <div className="flex space-x-4">
          <Link to="/users" className="text-gray-300 hover:text-white transition-colors">
            Users
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
