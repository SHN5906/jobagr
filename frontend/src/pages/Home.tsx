import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Find your next opportunity
        </h1>
        <p className="text-xl text-gray-500 mb-10">
          Jobryx aggregates tech jobs and internships from top sources in one place.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/register"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-indigo-700"
          >
            Get started
          </Link>
          <Link
            to="/login"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-lg font-medium hover:bg-gray-100"
          >
            Sign in
          </Link>
        </div>
      </main>
    </div>
  )
}
