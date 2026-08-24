import { loadDashboardData } from '@/lib/yaml'
import { AuthGate } from '@/components/AuthGate'
import { Dashboard } from '@/components/Dashboard'

export default async function Page() {
  const data = await loadDashboardData()
  return (
    <AuthGate>
      <Dashboard data={data} />
    </AuthGate>
  )
}
