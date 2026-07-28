import {
  Activity,
  ArrowLeft,
  BarChart3,
  BadgeAlert,
  BriefcaseBusiness,
  ChevronDown,
  ChevronUp,
  CreditCard,
  FileBadge2,
  PieChart as PieChartIcon,
  ShieldCheck,
  Tickets,
  UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import FullPageLoader from '../../../components/common/FullPageLoader'
import { useToast } from '../../../components/common/Toaster'
import { APP_ROUTES } from '../../../constants/routes'
import { formatUserProfileCurrency } from '../utils/usersUtils'
import { emptyUserProfileDetails, getUserProfile } from '../service/usersService'

const CHART_COLORS = ['#4f83ff', '#2dd4bf', '#f59e0b', '#f43f5e', '#a78bfa', '#38bdf8']

function MetricCard({ icon: Icon, label, toneClassName = 'text-white', value, hint }) {
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

function Panel({ title, subtitle, action, children, icon: Icon }) {
  return (
    <section className="rounded-2xl border border-[#332d30] bg-[#231f21] shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#2d282b] px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {Icon ? <Icon size={16} className="text-blue-400" /> : null}
            <h2 className="text-sm font-bold text-white">{title}</h2>
          </div>
          {subtitle ? <p className="mt-2 text-sm text-[#8fa0bd]">{subtitle}</p> : null}
        </div>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  )
}

function StatusBadge({ label, toneClassName }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${toneClassName}`}>
      {label}
    </span>
  )
}

function EmptyState({ message }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-[#332d30] bg-[#171314] px-5 py-8 text-center text-sm font-medium text-[#8fa0bd]">
      {message}
    </div>
  )
}

function DetailGrid({ items }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-[#332d30] bg-[#171314] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8fa0bd]">{item.label}</p>
          <p className="mt-2 break-words text-sm font-semibold text-white">{item.value}</p>
        </div>
      ))}
    </div>
  )
}

export default function UserProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [profile, setProfile] = useState(emptyUserProfileDetails)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedBookings, setExpandedBookings] = useState({})

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      setIsLoading(true)
      setError('')
      setExpandedBookings({})

      try {
        const response = await getUserProfile(id)
        if (isMounted) {
          setProfile(response)
        }
      } catch (loadError) {
        const message = loadError.message || 'Unable to load customer profile.'
        if (isMounted) {
          setError(message)
          setProfile(emptyUserProfileDetails)
        }
        toast.error(message)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadProfile()

    return () => {
      isMounted = false
    }
  }, [id, toast])

  const toggleBooking = (bookingId) => {
    setExpandedBookings((currentState) => ({
      ...currentState,
      [bookingId]: !currentState[bookingId],
    }))
  }

  const bookingHealthChartData = useMemo(
    () => [
      { label: 'Paid', value: profile.summary.paidBookings, fill: '#2dd4bf' },
      { label: 'Pending', value: profile.summary.pendingBookings, fill: '#f59e0b' },
      { label: 'Cancelled', value: profile.summary.cancelledBookings, fill: '#f43f5e' },
    ],
    [profile.summary.cancelledBookings, profile.summary.paidBookings, profile.summary.pendingBookings],
  )

  const portfolioChartData = useMemo(
    () => [
      { label: 'Bookings', value: profile.summary.totalBookings },
      { label: 'Tickets', value: profile.summary.totalTickets },
      { label: 'Refunds', value: profile.summary.totalRefunds },
      { label: 'Visa', value: profile.summary.visaApplications },
    ].filter((item) => item.value > 0),
    [profile.summary.totalBookings, profile.summary.totalRefunds, profile.summary.totalTickets, profile.summary.visaApplications],
  )

  const operationsChartData = useMemo(
    () => [
      { label: 'Open Tickets', value: profile.summary.openTickets, fill: '#4f83ff' },
      { label: 'Refund Pending', value: profile.summary.refundPending, fill: '#a78bfa' },
      { label: 'Visa Apps', value: profile.summary.visaApplications, fill: '#38bdf8' },
    ],
    [profile.summary.openTickets, profile.summary.refundPending, profile.summary.visaApplications],
  )

  const monthlyBookingTrendData = useMemo(() => {
    const monthlyMap = new Map()

    profile.bookings.forEach((booking) => {
      const rawDate = booking.createdAt
      if (!rawDate) {
        return
      }

      const parsedDate = new Date(rawDate)
      if (Number.isNaN(parsedDate.getTime())) {
        return
      }

      const monthKey = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = parsedDate.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })

      const currentEntry = monthlyMap.get(monthKey) ?? {
        amount: 0,
        bookingCount: 0,
        monthKey,
        monthLabel,
      }

      currentEntry.bookingCount += 1
      currentEntry.amount += Number(booking.amount ?? 0)
      monthlyMap.set(monthKey, currentEntry)
    })

    return [...monthlyMap.values()]
      .sort((firstEntry, secondEntry) => firstEntry.monthKey.localeCompare(secondEntry.monthKey))
      .slice(-8)
      .map((entry) => ({
        ...entry,
        amountLabel: formatUserProfileCurrency(entry.amount),
      }))
  }, [profile.bookings])

  const customerHighlights = useMemo(
    () => [
      { label: 'Customer', value: profile.user.name },
      { label: 'Email', value: profile.user.email },
      { label: 'Role', value: profile.user.roleLabel },
      { label: 'Joined', value: profile.user.joinedAtLabel },
      { label: 'Last Booking', value: profile.summary.lastBookingAtLabel },
      { label: 'Last Ticket', value: profile.summary.lastTicketAtLabel },
      { label: 'Paid / Pending', value: `${profile.summary.paidBookings} / ${profile.summary.pendingBookings}` },
      { label: 'Cancelled / Refund Pending', value: `${profile.summary.cancelledBookings} / ${profile.summary.refundPending}` },
    ],
    [profile],
  )

  if (isLoading) {
    return <FullPageLoader message="Loading customer profile..." subtext="Fetching customer analytics, bookings, and support history." />
  }

  return (
    <main className="routes-page">
      <div className="routes-page__inner">
        <div className="mb-5">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-[#332d30] bg-[#171314] px-4 py-2 text-sm font-semibold text-[#c5d9f7] transition hover:bg-white/5 hover:text-white"
            onClick={() => navigate(APP_ROUTES.users)}
          >
            <ArrowLeft size={15} />
            Back to User Management
          </button>
        </div>

        <header className="routes-page__header">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="routes-page__title">
                <UserRound size={20} color="#4f83ff" />
                <h1>{profile.user.name}</h1>
              </div>
              <p className="routes-page__subtitle">
                Full customer intelligence view with bookings, support activity, refund pressure, and visa operations.
              </p>
            </div>

            <div className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#332d30] bg-[#171314] px-4 text-sm font-semibold text-[#c5d9f7]">
              <CreditCard size={16} />
              <span>{profile.summary.totalSpentLabel} lifetime value</span>
            </div>
          </div>
        </header>

        {error ? <p className="month-balance-alert">{error}</p> : null}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={CreditCard}
            label="Lifetime Spend"
            value={profile.summary.totalSpentLabel}
            hint={`${profile.summary.totalBookings} total bookings recorded`}
          />
          <MetricCard
            icon={BriefcaseBusiness}
            label="Booking Health"
            toneClassName="text-cyan-200"
            value={`${profile.summary.paidBookings} paid`}
            hint={`${profile.summary.pendingBookings} pending • ${profile.summary.cancelledBookings} cancelled`}
          />
          <MetricCard
            icon={Tickets}
            label="Support Pulse"
            toneClassName="text-amber-200"
            value={`${profile.summary.openTickets} open`}
            hint={`${profile.summary.totalTickets} complaints or tickets created`}
          />
          <MetricCard
            icon={FileBadge2}
            label="Visa Activity"
            toneClassName="text-emerald-200"
            value={profile.summary.visaApplications}
            hint={`${profile.summary.totalRefunds} refund records on file`}
          />
        </section>

        <section className="mb-6 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <Panel
            icon={Activity}
            title="Customer Snapshot"
            subtitle="Core account and operational signals for this customer."
          >
            <DetailGrid items={customerHighlights} />
          </Panel>

          <Panel
            icon={BadgeAlert}
            title="Operations Scoreboard"
            subtitle="Fast read on support load and financial follow-up."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricCard label="Open Tickets" value={profile.summary.openTickets} toneClassName="text-blue-200" />
              <MetricCard label="Refund Pending" value={profile.summary.refundPending} toneClassName="text-violet-200" />
              <MetricCard label="Visa Applications" value={profile.summary.visaApplications} toneClassName="text-sky-200" />
              <MetricCard label="Total Refunds" value={profile.summary.totalRefunds} toneClassName="text-rose-200" />
            </div>
          </Panel>
        </section>

        <section className="mb-6 grid gap-5 xl:grid-cols-3">
          <Panel
            icon={ShieldCheck}
            title="Booking Health Graph"
            subtitle="Paid, pending, and cancelled distribution."
          >
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingHealthChartData}>
                  <CartesianGrid stroke="#2d282b" vertical={false} />
                  <XAxis dataKey="label" stroke="#8fa0bd" tickLine={false} axisLine={false} />
                  <YAxis stroke="#8fa0bd" tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ background: '#171314', border: '1px solid #332d30', borderRadius: 14 }}
                  />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {bookingHealthChartData.map((entry) => (
                      <Cell key={entry.label} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel
            icon={PieChartIcon}
            title="Activity Mix"
            subtitle="How this customer’s records are distributed across modules."
          >
            <div className="h-[280px]">
              {portfolioChartData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioChartData}
                      dataKey="value"
                      innerRadius={58}
                      outerRadius={94}
                      paddingAngle={3}
                    >
                      {portfolioChartData.map((entry, index) => (
                        <Cell key={entry.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#171314', border: '1px solid #332d30', borderRadius: 14 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No activity records available for the chart yet." />
              )}
            </div>
          </Panel>

          <Panel
            icon={BadgeAlert}
            title="Operational Pressure"
            subtitle="Current live follow-up areas for admins."
          >
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={operationsChartData} layout="vertical" margin={{ left: 12, right: 8 }}>
                  <CartesianGrid stroke="#2d282b" horizontal={false} />
                  <XAxis type="number" stroke="#8fa0bd" tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    stroke="#8fa0bd"
                    tickLine={false}
                    axisLine={false}
                    width={92}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ background: '#171314', border: '1px solid #332d30', borderRadius: 14 }}
                  />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                    {operationsChartData.map((entry) => (
                      <Cell key={entry.label} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </section>

        <section className="mb-6">
          <Panel
            icon={BarChart3}
            title="Monthly Booking Trend"
            subtitle="Month-by-month booking count and booking amount for this customer."
          >
            {monthlyBookingTrendData.length ? (
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyBookingTrendData}>
                    <CartesianGrid stroke="#2d282b" vertical={false} />
                    <XAxis dataKey="monthLabel" stroke="#8fa0bd" tickLine={false} axisLine={false} />
                    <YAxis
                      yAxisId="left"
                      stroke="#8fa0bd"
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#8fa0bd"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${Math.round(value)}`}
                    />
                    <Tooltip
                      contentStyle={{ background: '#171314', border: '1px solid #332d30', borderRadius: 14 }}
                      formatter={(value, name) => {
                        if (name === 'Amount') {
                          return formatUserProfileCurrency(value)
                        }

                        return value
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="bookingCount"
                      name="Bookings"
                      fill="#4f83ff"
                      radius={[10, 10, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="amount"
                      name="Amount"
                      stroke="#2dd4bf"
                      strokeWidth={3}
                      dot={{ fill: '#2dd4bf', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState message="Not enough booking history to plot a monthly trend yet." />
            )}
          </Panel>
        </section>

        <section className="space-y-6">
          <Panel
            icon={BriefcaseBusiness}
            title="All Bookings"
            subtitle="Each booking is shown as its own card with payment and linked record context."
          >
            {profile.bookings.length ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {profile.bookings.map((booking) => (
                  <article
                    key={booking.id}
                    className="rounded-2xl border border-[#332d30] bg-[linear-gradient(180deg,rgba(24,20,21,0.98),rgba(17,14,15,0.98))] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-bold text-white">{booking.displayTitle}</p>
                        <p className="mt-1 text-xs text-[#8fa0bd]">
                          Booking #{booking.id} • {booking.bookingType} • {booking.createdAtLabel}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge label={booking.status} toneClassName={booking.statusToneClassName} />
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-lg border border-[#332d30] bg-[#171314] px-3 py-2 text-xs font-semibold text-[#c5d9f7] transition hover:bg-white/5 hover:text-white"
                          onClick={() => toggleBooking(booking.id)}
                        >
                          {expandedBookings[booking.id] ? (
                            <>
                              <ChevronUp size={14} />
                              Close
                            </>
                          ) : (
                            <>
                              <ChevronDown size={14} />
                              Open
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[#332d30] bg-[#171314] px-4 py-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8fa0bd]">Amount</p>
                        <p className="mt-1 text-sm font-semibold text-white">{booking.amountLabel}</p>
                      </div>
                      <div className="h-8 w-px bg-[#2d282b]" />
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8fa0bd]">Payment</p>
                        <p className="mt-1 text-sm font-semibold text-white">{booking.paymentLabel}</p>
                      </div>
                      <div className="h-8 w-px bg-[#2d282b]" />
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8fa0bd]">Travel / Stay</p>
                        <p className="mt-1 text-sm font-semibold text-white">{booking.travelDateLabel}</p>
                      </div>
                    </div>

                    {expandedBookings[booking.id] ? (
                      <>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-xl border border-[#332d30] bg-[#171314] p-4">
                            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8fa0bd]">Amount</p>
                            <p className="mt-2 text-sm font-semibold text-white">{booking.amountLabel}</p>
                          </div>
                          <div className="rounded-xl border border-[#332d30] bg-[#171314] p-4">
                            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8fa0bd]">Payment</p>
                            <p className="mt-2 text-sm font-semibold text-white">{booking.paymentLabel}</p>
                          </div>
                          <div className="rounded-xl border border-[#332d30] bg-[#171314] p-4">
                            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8fa0bd]">Travel / Stay</p>
                            <p className="mt-2 text-sm font-semibold text-white">{booking.travelDateLabel}</p>
                          </div>
                          <div className="rounded-xl border border-[#332d30] bg-[#171314] p-4">
                            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8fa0bd]">Seats</p>
                            <p className="mt-2 text-sm font-semibold text-white">{booking.seatNumbers}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <StatusBadge label={booking.extraStatus} toneClassName={booking.extraStatusToneClassName} />
                          {booking.visaApplicationNo ? (
                            <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-cyan-100">
                              {booking.visaApplicationNo} • {booking.visaCountry} • {booking.visaType}
                            </span>
                          ) : null}
                          {booking.refundStatus !== 'N/A' ? (
                            <span className="inline-flex rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-rose-100">
                              Refund {booking.refundAmountLabel} • {booking.refundStatus}
                            </span>
                          ) : null}
                        </div>
                      </>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState message="No bookings found for this customer." />
            )}
          </Panel>

          <div className="grid gap-6 xl:grid-cols-2">
            <Panel
              icon={Tickets}
              title="Complaints / Tickets"
              subtitle="Raised issues and support history for this customer."
            >
              {profile.tickets.length ? (
                <div className="overflow-x-auto">
                  <table className="trip-summary-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Resolved By</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.tickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td>
                            <div className="font-semibold text-white">{ticket.title}</div>
                            <div className="mt-1 text-xs text-[#8fa0bd]">{ticket.description}</div>
                          </td>
                          <td>
                            <StatusBadge label={ticket.status} toneClassName={ticket.statusToneClassName} />
                          </td>
                          <td>{ticket.resolvedBy}</td>
                          <td>{ticket.createdAtLabel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState message="No complaints or tickets found for this customer." />
              )}
            </Panel>

            <Panel
              icon={BadgeAlert}
              title="Refund History"
              subtitle="Financial follow-up requests generated by this customer."
            >
              {profile.refunds.length ? (
                <div className="space-y-3">
                  {profile.refunds.map((refund) => (
                    <article key={refund.id} className="rounded-xl border border-[#332d30] bg-[#171314] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{refund.bookingLabel}</p>
                          <p className="mt-1 text-xs text-[#8fa0bd]">{refund.reason}</p>
                        </div>
                        <StatusBadge label={refund.status} toneClassName={refund.statusToneClassName} />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm text-[#dbe7fb]">
                        <span>{refund.amountLabel}</span>
                        <span>{refund.createdAtLabel}</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState message="No refund records found for this customer." />
              )}
            </Panel>
          </div>

          <Panel
            icon={FileBadge2}
            title="Visa Applications"
            subtitle="Current and historical visa-related records tied to this customer."
          >
            {profile.visaApplications.length ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {profile.visaApplications.map((application) => (
                  <article key={application.id} className="rounded-2xl border border-[#332d30] bg-[#171314] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-white">{application.applicationNo}</p>
                        <p className="mt-1 text-xs text-[#8fa0bd]">{application.countryAndTypeLabel}</p>
                      </div>
                      <StatusBadge label={application.status} toneClassName={application.statusToneClassName} />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-[#332d30] bg-[#120f10] p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8fa0bd]">Package / Owner</p>
                        <p className="mt-2 text-sm font-semibold text-white">{application.packageLabel}</p>
                      </div>
                      <div className="rounded-xl border border-[#332d30] bg-[#120f10] p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8fa0bd]">Fee</p>
                        <p className="mt-2 text-sm font-semibold text-white">{application.feeLabel}</p>
                      </div>
                      <div className="rounded-xl border border-[#332d30] bg-[#120f10] p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8fa0bd]">Payment Status</p>
                        <p className="mt-2 text-sm font-semibold text-white">{application.paymentStatus}</p>
                      </div>
                      <div className="rounded-xl border border-[#332d30] bg-[#120f10] p-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8fa0bd]">Created</p>
                        <p className="mt-2 text-sm font-semibold text-white">{application.createdAtLabel}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState message="No visa applications found for this customer." />
            )}
          </Panel>
        </section>
      </div>
    </main>
  )
}
