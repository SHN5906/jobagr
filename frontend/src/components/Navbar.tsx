import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-indigo-600">Jobryx</Link>
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <span className="text-sm text-gray-600">{user?.username}</span>
            <Link to="/dashboard" className="text-sm text-gray-700 hover:text-indigo-600">
              Dashboard
            </Link>
            <button
              onClick={logout}
              className="text-sm text-gray-700 hover:text-red-500"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-gray-700 hover:text-indigo-600">Login</Link>
            <Link
              to="/register"
              className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
