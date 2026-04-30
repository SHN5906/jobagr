import Navbar from '../components/Navbar'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {user?.username}
        </h1>
        <p className="text-gray-500 mb-10">Here are your job opportunities.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Data insights
            </h2>
            <p className="text-gray-400 text-sm">Coming in Phase 3</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              AI recommendations
            </h2>
            <p className="text-gray-400 text-sm">Coming in Phase 3</p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Latest offers</h2>
          <p className="text-gray-400 text-sm">Job offers will appear here after Phase 2 data ingestion.</p>
        </div>
      </main>
    </div>
  )
}
