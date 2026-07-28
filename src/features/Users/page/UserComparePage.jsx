import {
  ArrowLeft,
  BarChart3,
  BriefcaseBusiness,
  CircleDollarSign,
  Download,
  Medal,
  Scale,
  Ticket,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import FullPageLoader from '../../../components/common/FullPageLoader'
import { useToast } from '../../../components/common/Toaster'
import { APP_ROUTES } from '../../../constants/routes'
import { emptyUsersComparison, getUsersComparison } from '../service/usersService'

const SERIES_COLORS = ['#4f83ff', '#2dd4bf', '#f59e0b', '#f43f5e', '#a78bfa']

const buildComparisonSections = () => [
  {
    title: 'Basic Information',
    rows: [
      {
        label: 'Role',
        getValue: (customer) => customer.roleLabel,
      },
      {
        label: 'Email',
        getValue: (customer) => customer.email,
      },
      {
        label: 'Joined',
        getValue: (customer) => customer.createdAtLabel,
      },
    ],
  },
  {
    title: 'Bookings & Value',
    rows: [
      {
        label: 'Total Bookings',
        getValue: (customer) => customer.totalBookings,
      },
      {
        label: 'Net Spent',
        getValue: (customer) => customer.netSpentLabel,
        valueClassName: 'text-[#4f83ff]',
      },
      {
        label: 'Average Booking Value',
        getValue: (customer) => customer.avgBookingValueLabel,
      },
      {
        label: 'Paid Amount',
        getValue: (customer) => customer.totalPaidLabel,
      },
      {
        label: 'Refunded Amount',
        getValue: (customer) => customer.totalRefundedLabel,
      },
      {
        label: 'Average Profit Margin',
        getValue: (customer) => customer.avgProfitMarginLabel,
        valueClassName: 'text-emerald-300',
      },
      {
        label: 'Gross Profit',
        getValue: (customer) => customer.grossProfitLabel,
      },
    ],
  },
  {
    title: 'Booking Mix',
    rows: [
      {
        label: 'Trip Bookings',
        getValue: (customer) => customer.tripBookings,
      },
      {
        label: 'Package Bookings',
        getValue: (customer) => customer.packageBookings,
      },
      {
        label: 'Hotel Bookings',
        getValue: (customer) => customer.hotelBookings,
      },
      {
        label: 'Visa Applications',
        getValue: (customer) => customer.visaApplications,
      },
    ],
  },
  {
    title: 'Rankings & Support',
    rows: [
      {
        label: 'Selected Value Rank',
        getValue: (customer) => `#${customer.selectedValueRank || 0}`,
        valueClassName: 'text-emerald-300',
      },
      {
        label: 'Selected Booking Rank',
        getValue: (customer) => `#${customer.selectedBookingRank || 0}`,
      },
      {
        label: 'Global Value Rank',
        getValue: (customer) => `#${customer.valueRankGlobal || 0}`,
      },
      {
        label: 'Global Activity Rank',
        getValue: (customer) => `#${customer.activityRankGlobal || 0}`,
      },
      {
        label: 'Total Tickets',
        getValue: (customer) => customer.totalTickets,
      },
      {
        label: 'Open Tickets',
        getValue: (customer) => customer.openTickets,
      },
      {
        label: 'Refund Pending',
        getValue: (customer) => customer.refundPending,
      },
      {
        label: 'Revenue Growth Trend',
        getValue: (customer) => customer.revenueGrowthPercentageLabel,
        valueClassName: (customer) => getGrowthToneClassName(customer.revenueGrowthDirection),
        helper: (customer) => `vs previous month • ${customer.growthReferenceMonth}`,
      },
      {
        label: 'Booking Growth Trend',
        getValue: (customer) => customer.bookingGrowthPercentageLabel,
        valueClassName: (customer) => getGrowthToneClassName(customer.bookingGrowthDirection),
        helper: (customer) => `vs previous month • ${customer.growthReferenceMonth}`,
      },
    ],
  },
]

const getGrowthToneClassName = (direction) => {
  if (direction === 'up') {
    return 'text-emerald-300'
  }

  if (direction === 'down') {
    return 'text-rose-300'
  }

  return 'text-slate-200'
}

function GrowthPill({ direction, label }) {
  const isUp = direction === 'up'
  const isDown = direction === 'down'
  const toneClassName = isUp
    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
    : isDown
      ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
      : 'border-slate-500/30 bg-slate-500/10 text-slate-200'
  const Icon = isDown ? TrendingDown : TrendingUp

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClassName}`}>
      <Icon size={12} />
      {label}
    </span>
  )
}

function MetricCard({ icon: Icon, label, value, hint, toneClassName = 'text-white' }) {
  return (
    <article className="rounded-2xl border border-[#332d30] bg-[linear-gradient(180deg,rgba(32,27,29,0.96),rgba(18,15,16,0.96))] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.25)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8fa0bd]">{label}</p>
          <p className={`mt-3 text-2xl font-bold ${toneClassName}`}>{value}</p>
        </div>
        {Icon ? (
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#3a3337] bg-[#171314] text-[#7ea1ff]">
            <Icon size={18} />
          </span>
        ) : null}
      </div>
      {hint ? <p className="mt-3 text-sm text-[#8fa0bd]">{hint}</p> : null}
    </article>
  )
}

function Panel({ icon: Icon, title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-[#332d30] bg-[#231f21] shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
      <header className="border-b border-[#2d282b] px-5 py-4">
        <div className="flex items-center gap-2">
          {Icon ? <Icon size={16} className="text-blue-400" /> : null}
          <h2 className="text-sm font-bold text-white">{title}</h2>
        </div>
        {subtitle ? <p className="mt-2 text-sm text-[#8fa0bd]">{subtitle}</p> : null}
      </header>
      <div className="p-5">{children}</div>
    </section>
  )
}

function StatusPill({ children }) {
  return (
    <span className="inline-flex rounded-full border border-[#3a3337] bg-[#171314] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#c5d9f7]">
      {children}
    </span>
  )
}

function CustomerHeaderCard({ customer }) {
  const initials = customer.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'CU'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#3d3639] bg-[#171314] text-sm font-bold text-[#dbe7fb]">
          {initials}
        </span>
      </div>
      <div className="text-base font-bold uppercase tracking-[0.04em] text-white">{customer.name}</div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8fa0bd]">
        {customer.roleLabel}
      </div>
    </div>
  )
}

export default function UserComparePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const [comparison, setComparison] = useState(emptyUsersComparison)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const selectedIds = useMemo(
    () =>
      [...new Set(
        (searchParams.get('ids') || '')
          .split(',')
          .map((id) => Number(id))
          .filter((id) => Number.isFinite(id) && id > 0),
      )],
    [searchParams],
  )

  useEffect(() => {
    let isMounted = true

    const loadComparison = async () => {
      if (selectedIds.length < 2) {
        setIsLoading(false)
        setError('Select at least two customers from User Management to compare.')
        setComparison(emptyUsersComparison)
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const response = await getUsersComparison(selectedIds)
        if (isMounted) {
          setComparison(response)
        }
      } catch (loadError) {
        const message = loadError.message || 'Unable to load customer comparison.'
        if (isMounted) {
          setError(message)
          setComparison(emptyUsersComparison)
        }
        toast.error(message)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadComparison()

    return () => {
      isMounted = false
    }
  }, [selectedIds, toast])

  const valueComparisonData = useMemo(
    () =>
      comparison.customers.map((customer) => ({
        customer: customer.name.length > 14 ? `${customer.name.slice(0, 14)}…` : customer.name,
        netSpent: customer.netSpent,
        activityScore: customer.activityScore,
      })),
    [comparison.customers],
  )

  const bookingMixData = useMemo(
    () =>
      comparison.customers.map((customer) => ({
        customer: customer.name.length > 12 ? `${customer.name.slice(0, 12)}…` : customer.name,
        hotel: customer.hotelBookings,
        package: customer.packageBookings,
        trip: customer.tripBookings,
        visa: customer.visaApplications,
      })),
    [comparison.customers],
  )

  const monthlyTrendData = useMemo(() => {
    const monthMap = new Map()

    comparison.customers.forEach((customer) => {
      customer.monthlyTrends.forEach((trend) => {
        const key = trend.monthKey || trend.month
        if (!monthMap.has(key)) {
          monthMap.set(key, {
            month: trend.month,
            monthKey: key,
          })
        }

        monthMap.get(key)[customer.name] = trend.amount
      })
    })

    return [...monthMap.values()].sort((first, second) => String(first.monthKey).localeCompare(String(second.monthKey)))
  }, [comparison.customers])

  const monthlyBookingCountData = useMemo(() => {
    const monthMap = new Map()

    comparison.customers.forEach((customer) => {
      customer.monthlyTrends.forEach((trend) => {
        const key = trend.monthKey || trend.month
        if (!monthMap.has(key)) {
          monthMap.set(key, {
            month: trend.month,
            monthKey: key,
          })
        }

        monthMap.get(key)[customer.name] = trend.bookingCount
      })
    })

    return [...monthMap.values()].sort((first, second) => String(first.monthKey).localeCompare(String(second.monthKey)))
  }, [comparison.customers])

  const comparisonSections = useMemo(
    () => buildComparisonSections(comparison.customers),
    [comparison.customers],
  )

  const marginAndGrowthData = useMemo(
    () =>
      comparison.customers.map((customer) => ({
        customer: customer.name.length > 12 ? `${customer.name.slice(0, 12)}…` : customer.name,
        avgProfitMargin: customer.avgProfitMargin,
        revenueGrowth: customer.revenueGrowthPercentage,
      })),
    [comparison.customers],
  )

  const customerValueShareData = useMemo(
    () =>
      comparison.customers.map((customer) => ({
        name: customer.name,
        value: customer.netSpent,
      })),
    [comparison.customers],
  )

  const supportLoadData = useMemo(
    () =>
      comparison.customers.map((customer) => ({
        customer: customer.name.length > 12 ? `${customer.name.slice(0, 12)}…` : customer.name,
        totalTickets: customer.totalTickets,
        openTickets: customer.openTickets,
        refundPending: customer.refundPending,
      })),
    [comparison.customers],
  )

  const paymentBalanceData = useMemo(
    () =>
      comparison.customers.map((customer) => ({
        customer: customer.name.length > 12 ? `${customer.name.slice(0, 12)}…` : customer.name,
        paid: customer.totalPaidLabel,
        refunded: customer.totalRefundedLabel,
        paidValue: customer.monthlyTrends.reduce((sum, trend) => sum + trend.amount, 0),
        refundedValue: customer.totalRefunds,
      })),
    [comparison.customers],
  )

  if (isLoading) {
    return <FullPageLoader message="Loading customer comparison..." subtext="Preparing side-by-side customer analytics and trend charts." />
  }

  return (
    <main className="routes-page">
      <div className="routes-page__inner">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-[#332d30] bg-[#171314] px-4 py-2 text-sm font-semibold text-[#c5d9f7] transition hover:bg-white/5 hover:text-white"
            onClick={() => navigate(APP_ROUTES.users)}
          >
            <ArrowLeft size={15} />
            Back to User Management
          </button>

          <StatusPill>{comparison.summary.comparedCustomers} customers selected</StatusPill>
        </div>

        <header className="routes-page__header">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="routes-page__title">
                <Scale size={20} color="#4f83ff" />
                <h1>Customer Comparison</h1>
              </div>
              <p className="routes-page__subtitle">
                Compare booking volume, value, rankings, support load, and monthly customer momentum side by side.
              </p>
            </div>

            <div className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#332d30] bg-[#171314] px-4 text-sm font-semibold text-[#c5d9f7]">
              <CircleDollarSign size={16} />
              <span>{comparison.summary.totalNetSpentLabel} combined value</span>
            </div>
          </div>
        </header>

        {error ? <p className="month-balance-alert">{error}</p> : null}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={CircleDollarSign}
            label="Combined Value"
            value={comparison.summary.totalNetSpentLabel}
            hint={comparison.summary.topValueCustomer ? `${comparison.summary.topValueCustomer.name} leads by value` : 'No leader yet'}
          />
          <MetricCard
            icon={BriefcaseBusiness}
            label="Combined Bookings"
            toneClassName="text-cyan-200"
            value={comparison.summary.totalBookings}
            hint={comparison.summary.topBookingCustomer ? `${comparison.summary.topBookingCustomer.name} leads bookings` : 'No booking leader yet'}
          />
          <MetricCard
            icon={Medal}
            label="Average Net Spend"
            toneClassName="text-amber-200"
            value={comparison.summary.avgNetSpentLabel}
            hint="Average net spend across the selected customers"
          />
          <MetricCard
            icon={Ticket}
            label="Top Activity"
            toneClassName="text-emerald-200"
            value={comparison.summary.topActivityCustomer?.name ?? 'N/A'}
            hint={comparison.summary.topActivityCustomer ? `Activity score ${comparison.summary.topActivityCustomer.value}` : 'No activity leader yet'}
          />
        </section>

        <section className="mb-6 grid gap-5 xl:grid-cols-2">
          <Panel
            icon={CircleDollarSign}
            title="Value Comparison"
            subtitle="Net spend and overall activity score across selected customers."
          >
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={valueComparisonData}>
                  <CartesianGrid stroke="#2d282b" vertical={false} />
                  <XAxis dataKey="customer" stroke="#8fa0bd" tickLine={false} axisLine={false} />
                  <YAxis stroke="#8fa0bd" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#171314', border: '1px solid #332d30', borderRadius: 14 }}
                    formatter={(value, name) =>
                      name === 'Activity Score' ? value : `BDT ${Number(value || 0).toLocaleString()}`
                    }
                  />
                  <Legend />
                  <Bar dataKey="netSpent" name="Net Spent" fill="#4f83ff" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="activityScore" name="Activity Score" fill="#2dd4bf" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel
            icon={BarChart3}
            title="Booking Mix"
            subtitle="Trip, package, hotel, and visa engagement by customer."
          >
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingMixData}>
                  <CartesianGrid stroke="#2d282b" vertical={false} />
                  <XAxis dataKey="customer" stroke="#8fa0bd" tickLine={false} axisLine={false} />
                  <YAxis stroke="#8fa0bd" tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#171314', border: '1px solid #332d30', borderRadius: 14 }} />
                  <Legend />
                  <Bar dataKey="trip" stackId="booking" fill="#4f83ff" name="Trip" />
                  <Bar dataKey="package" stackId="booking" fill="#2dd4bf" name="Package" />
                  <Bar dataKey="hotel" stackId="booking" fill="#f59e0b" name="Hotel" />
                  <Bar dataKey="visa" stackId="booking" fill="#a78bfa" name="Visa" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </section>

        <section className="mb-6 grid gap-5 xl:grid-cols-3">
          <Panel
            icon={CircleDollarSign}
            title="Customer Value Share"
            subtitle="How much of the selected group value belongs to each customer."
          >
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerValueShareData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={112}
                    paddingAngle={3}
                  >
                    {customerValueShareData.map((entry, index) => (
                      <Cell key={`${entry.name}-value-share`} fill={SERIES_COLORS[index % SERIES_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#171314', border: '1px solid #332d30', borderRadius: 14 }}
                    formatter={(value) => `BDT ${Number(value || 0).toLocaleString()}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel
            icon={Ticket}
            title="Support Pressure"
            subtitle="Open tickets and pending refunds per customer."
          >
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supportLoadData}>
                  <CartesianGrid stroke="#2d282b" vertical={false} />
                  <XAxis dataKey="customer" stroke="#8fa0bd" tickLine={false} axisLine={false} />
                  <YAxis stroke="#8fa0bd" tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#171314', border: '1px solid #332d30', borderRadius: 14 }} />
                  <Legend />
                  <Bar dataKey="totalTickets" name="Total Tickets" fill="#4f83ff" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="openTickets" name="Open Tickets" fill="#f59e0b" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="refundPending" name="Refund Pending" fill="#f43f5e" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel
            icon={Medal}
            title="Customer Booking Share"
            subtitle="Selected-customer booking distribution in one glance."
          >
            <div className="space-y-4">
              {comparison.customers.map((customer, index) => {
                const totalBookings = comparison.summary.totalBookings || 1
                const share = (customer.totalBookings / totalBookings) * 100

                return (
                  <div key={`${customer.id}-share`} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-white">{customer.name}</span>
                      <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#8fa0bd]">
                        {share.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#171314]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(share, 4)}%`,
                          backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>
        </section>

        <section className="mb-6 grid gap-5 xl:grid-cols-2">
          <Panel
            icon={BarChart3}
            title="Monthly Value Trend"
            subtitle="Month-by-month booking amount comparison for the selected customers."
          >
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid stroke="#2d282b" vertical={false} />
                  <XAxis dataKey="month" stroke="#8fa0bd" tickLine={false} axisLine={false} />
                  <YAxis stroke="#8fa0bd" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#171314', border: '1px solid #332d30', borderRadius: 14 }}
                    formatter={(value) => `BDT ${Number(value || 0).toLocaleString()}`}
                  />
                  <Legend />
                  {comparison.customers.map((customer, index) => (
                    <Line
                      key={customer.id}
                      type="monotone"
                      dataKey={customer.name}
                      name={customer.name}
                      stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                      strokeWidth={3}
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel
            icon={BriefcaseBusiness}
            title="Monthly Booking Count"
            subtitle="Month-by-month booking count comparison for the selected customers."
          >
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyBookingCountData}>
                  <CartesianGrid stroke="#2d282b" vertical={false} />
                  <XAxis dataKey="month" stroke="#8fa0bd" tickLine={false} axisLine={false} />
                  <YAxis stroke="#8fa0bd" tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: '#171314', border: '1px solid #332d30', borderRadius: 14 }}
                    formatter={(value) => `${Number(value || 0)} bookings`}
                  />
                  <Legend />
                  {comparison.customers.map((customer, index) => (
                    <Line
                      key={`${customer.id}-bookings`}
                      type="monotone"
                      dataKey={customer.name}
                      name={customer.name}
                      stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                      strokeWidth={3}
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </section>

        <section className="mb-6 grid gap-5 xl:grid-cols-2">
          <Panel
            icon={Medal}
            title="Margin & Revenue Growth"
            subtitle="Average profit margin and month-over-month revenue growth per customer."
          >
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marginAndGrowthData}>
                  <CartesianGrid stroke="#2d282b" vertical={false} />
                  <XAxis dataKey="customer" stroke="#8fa0bd" tickLine={false} axisLine={false} />
                  <YAxis stroke="#8fa0bd" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#171314', border: '1px solid #332d30', borderRadius: 14 }}
                    formatter={(value) => `${Number(value || 0).toFixed(2)}%`}
                  />
                  <Legend />
                  <Bar dataKey="avgProfitMargin" name="Avg Profit Margin" fill="#2dd4bf" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="revenueGrowth" name="Revenue Growth" fill="#f59e0b" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel
            icon={BarChart3}
            title="Growth Snapshot"
            subtitle="Quick view of the latest customer growth direction."
          >
            <div className="grid gap-3">
              {comparison.customers.map((customer) => (
                <article
                  key={`${customer.id}-growth`}
                  className="rounded-2xl border border-[#332d30] bg-[#171314] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">{customer.name}</h3>
                      <p className="mt-1 text-xs text-[#8fa0bd]">Reference month: {customer.growthReferenceMonth}</p>
                    </div>
                    <GrowthPill
                      direction={customer.revenueGrowthDirection}
                      label={`Revenue ${customer.revenueGrowthPercentageLabel}`}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <GrowthPill
                      direction={customer.bookingGrowthDirection}
                      label={`Bookings ${customer.bookingGrowthPercentageLabel}`}
                    />
                    <span className="inline-flex rounded-full border border-[#3a3337] bg-[#231f21] px-2.5 py-1 text-xs font-semibold text-[#dbe7fb]">
                      Margin {customer.avgProfitMarginLabel}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </Panel>
        </section>

        <section className="mb-6">
          <Panel
            icon={BriefcaseBusiness}
            title="Revenue Flow Overview"
            subtitle="Compare total booking amount trend sum against refund count pressure."
          >
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentBalanceData}>
                  <CartesianGrid stroke="#2d282b" vertical={false} />
                  <XAxis dataKey="customer" stroke="#8fa0bd" tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#8fa0bd" tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#8fa0bd" tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: '#171314', border: '1px solid #332d30', borderRadius: 14 }}
                    formatter={(value, name) =>
                      name === 'Refund Count' ? Number(value || 0) : `BDT ${Number(value || 0).toLocaleString()}`
                    }
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="paidValue" name="Revenue Trend Sum" fill="#2dd4bf" radius={[10, 10, 0, 0]} />
                  <Bar yAxisId="right" dataKey="refundedValue" name="Refund Count" fill="#f43f5e" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-[#332d30] bg-[linear-gradient(180deg,rgba(34,29,31,0.98),rgba(20,16,18,0.98))] shadow-[0_24px_60px_rgba(0,0,0,0.22)]">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2d282b] px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-white">Side-by-Side Customer Comparison</h2>
              <p className="mt-1 text-sm text-[#8fa0bd]">
                Scan value, bookings, ranking, and support metrics in a single matrix.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-[#3a3337] bg-[#171314] px-4 py-2 text-sm font-semibold text-[#c5d9f7] transition hover:bg-white/5 hover:text-white"
            >
              <Download size={15} />
              Export
            </button>
          </header>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="min-w-[260px] border-b border-r border-[#2d282b] bg-[#262123] px-6 py-5 text-left text-xs font-bold uppercase tracking-[0.12em] text-[#89a0c5]">
                    Metric / Attribute
                  </th>
                  {comparison.customers.map((customer) => (
                    <th
                      key={customer.id}
                      className="min-w-[220px] border-b border-[#2d282b] bg-[#262123] px-6 py-5 text-center align-top"
                    >
                      <CustomerHeaderCard customer={customer} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonSections.map((section) => (
                  <Fragment key={section.title}>
                    <tr>
                      <td
                        colSpan={comparison.customers.length + 1}
                        className="border-b border-t border-[#2d282b] bg-[#1c1819] px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#89a0c5]"
                      >
                        {section.title}
                      </td>
                    </tr>
                    {section.rows.map((row) => (
                      <tr key={`${section.title}-${row.label}`}>
                        <td className="border-b border-r border-[#2d282b] bg-[#231f21] px-6 py-4 text-sm font-semibold text-[#dbe7fb]">
                          {row.label}
                        </td>
                        {comparison.customers.map((customer) => (
                          <td
                            key={`${customer.id}-${section.title}-${row.label}`}
                            className="border-b border-[#2d282b] bg-[#231f21] px-6 py-4 text-center text-sm font-semibold text-white"
                          >
                            <div className={typeof row.valueClassName === 'function' ? row.valueClassName(customer) : row.valueClassName ?? ''}>
                              {row.getValue(customer)}
                            </div>
                            {row.helper ? (
                              <div className="mt-1 text-[11px] font-medium text-[#8fa0bd]">{row.helper(customer)}</div>
                            ) : null}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
