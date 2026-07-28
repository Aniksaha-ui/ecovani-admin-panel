import { BadgeCheck, ShieldCheck, UserRound, UsersRound } from 'lucide-react'
import { DashboardMetricCard } from '../../../components/ui/DashboardMetricCard'

export function UsersOverview({ isLoading, metrics }) {
  const items = [
    {
      icon: UsersRound,
      label: 'Accounts',
      tone: 'blue',
      value: metrics.totalCountLabel,
    },
    {
      icon: ShieldCheck,
      label: 'Admin Roles',
      tone: 'cyan',
      value: metrics.adminCountLabel,
    },
    {
      icon: UserRound,
      label: 'Team Accounts',
      tone: 'emerald',
      value: metrics.teamCountLabel,
    },
    {
      icon: BadgeCheck,
      label: 'Verified',
      tone: 'amber',
      value: metrics.verifiedCountLabel,
    },
  ]

  return (
    <section className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <DashboardMetricCard
          key={item.label}
          icon={item.icon}
          label={item.label}
          tone={item.tone}
          value={isLoading ? '...' : item.value}
        />
      ))}
    </section>
  )
}

