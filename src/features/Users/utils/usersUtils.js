import dayjs from 'dayjs'
import { USERS_EMPTY_STATE } from '../constants/users.constants'

const compactCountFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  notation: 'compact',
})

const integerFormatter = new Intl.NumberFormat('en-US')

const normalizeText = (value, fallback = '-') => {
  if (value === undefined || value === null) {
    return fallback
  }

  const normalizedValue = String(value).trim()
  return normalizedValue || fallback
}

const toNumber = (value) => {
  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : 0
}

const formatDateLabel = (value, fallback = '-') => {
  const parsedValue = dayjs(value)
  return parsedValue.isValid() ? parsedValue.format('DD MMM YYYY') : fallback
}

const formatDateTimeLabel = (value, fallback = '-') => {
  const parsedValue = dayjs(value)
  return parsedValue.isValid() ? parsedValue.format('DD MMM YYYY, hh:mm A') : fallback
}

const toTitleCase = (value) =>
  normalizeText(value, '')
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(' ')

const normalizeRoleKey = (value) =>
  normalizeText(value, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

export const formatUserRoleLabel = (value) => {
  const normalizedValue = normalizeText(value, '')
  return normalizedValue ? toTitleCase(normalizedValue) : USERS_EMPTY_STATE.noRole
}

export const getUserRoleToneClassName = (role) => {
  const roleKey = normalizeRoleKey(role)

  if (roleKey.includes('super') && roleKey.includes('admin')) {
    return 'border-violet-500/20 bg-violet-500/10 text-violet-100'
  }

  if (roleKey.includes('admin')) {
    return 'border-blue-500/20 bg-blue-500/10 text-blue-100'
  }

  if (roleKey.includes('manager') || roleKey.includes('operator')) {
    return 'border-cyan-500/20 bg-cyan-500/10 text-cyan-100'
  }

  if (roleKey.includes('staff') || roleKey.includes('agent')) {
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
  }

  return 'border-amber-500/20 bg-amber-500/10 text-amber-100'
}

const buildInitials = (name, email) => {
  const source = normalizeText(name, '').trim() || normalizeText(email, '').trim()

  if (!source) {
    return 'U'
  }

  const words = source.split(/[\s@._-]+/).filter(Boolean)

  if (!words.length) {
    return 'U'
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

export const normalizeUser = (item = {}, index = 0, pagination = {}) => {
  const serial = (pagination.from || 0) + index + 1
  const email = normalizeText(item.email, USERS_EMPTY_STATE.noEmail)
  const name = normalizeText(item.name, USERS_EMPTY_STATE.noName)
  const role = normalizeText(item.role, USERS_EMPTY_STATE.noRole)
  const roleKey = normalizeRoleKey(role)
  const emailVerifiedAt = item.email_verified_at ?? item.emailVerifiedAt ?? ''
  const createdAt = item.created_at ?? item.createdAt ?? ''
  const isVerified = Boolean(emailVerifiedAt)

  return {
    createdAt,
    createdAtLabel: formatDateLabel(createdAt, '-'),
    createdAtTimeLabel: formatDateTimeLabel(createdAt, '-'),
    email,
    emailVerifiedAt,
    id: item.id ?? `user-${serial}`,
    initials: buildInitials(name, email),
    isVerified,
    name,
    role,
    roleKey,
    roleLabel: formatUserRoleLabel(role),
    serial,
    verifiedLabel: isVerified ? formatDateLabel(emailVerifiedAt, 'Verified') : USERS_EMPTY_STATE.notVerified,
  }
}

export const normalizeSelectableUser = (user, selectionControl = null) => ({
  ...user,
  selectionControl,
})

export const buildUserMetrics = (rows = []) => {
  const adminCount = rows.filter((row) => row.roleKey.includes('admin')).length
  const verifiedCount = rows.filter((row) => row.isVerified).length
  const roleCount = new Set(rows.map((row) => row.roleKey).filter(Boolean)).size
  const teamCount = rows.length - adminCount

  return {
    adminCount,
    adminCountLabel: compactCountFormatter.format(adminCount),
    roleCount,
    roleCountLabel: integerFormatter.format(roleCount),
    teamCount,
    teamCountLabel: compactCountFormatter.format(teamCount),
    totalCount: rows.length,
    totalCountLabel: compactCountFormatter.format(rows.length),
    verifiedCount,
    verifiedCountLabel: compactCountFormatter.format(verifiedCount),
  }
}

export const buildUserRoleFilters = (rows = []) => {
  const roleMap = new Map()

  rows.forEach((row) => {
    if (!row.roleKey) {
      return
    }

    if (!roleMap.has(row.roleKey)) {
      roleMap.set(row.roleKey, row.roleLabel)
    }
  })

  return [
    { key: 'all', label: 'All Users' },
    ...[...roleMap.entries()]
      .sort((firstEntry, secondEntry) => firstEntry[1].localeCompare(secondEntry[1]))
      .map(([key, label]) => ({ key, label })),
  ]
}

export const filterUsersByRole = (rows = [], roleFilter = 'all') => {
  if (roleFilter === 'all') {
    return rows
  }

  return rows.filter((row) => row.roleKey === roleFilter)
}

export const formatUserProfileDateTime = (value, fallback = '-') => {
  const parsedValue = dayjs(value)
  return parsedValue.isValid() ? parsedValue.format('DD MMM YYYY, hh:mm A') : fallback
}

export const formatUserProfileCurrency = (value, currency = 'BDT') => {
  const amount = toNumber(value)
  return `${currency} ${integerFormatter.format(amount)}`
}

export const formatUserProfilePercentage = (value, fractionDigits = 2) => {
  const amount = toNumber(value)
  return `${amount.toFixed(fractionDigits)}%`
}

const normalizeStatusKey = (value) =>
  normalizeText(value, '')
    .toLowerCase()
    .replace(/\s+/g, '_')

export const getUserProfileStatusToneClassName = (status) => {
  const statusKey = normalizeStatusKey(status)

  if (
    ['paid', 'confirmed', 'resolved', 'approved', 'closed', 'checked_in', 'active'].includes(statusKey)
  ) {
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
  }

  if (['pending', 'submitted', 'processing', 'open'].includes(statusKey)) {
    return 'border-amber-500/20 bg-amber-500/10 text-amber-100'
  }

  if (['cancelled', 'cancle_booking', 'rejected', 'declined'].includes(statusKey)) {
    return 'border-rose-500/20 bg-rose-500/10 text-rose-100'
  }

  return 'border-slate-500/20 bg-slate-500/10 text-slate-100'
}

const normalizeBookingDisplayTitle = (booking) =>
  normalizeText(
    booking?.display_title ??
      booking?.trip_name ??
      booking?.package_name ??
      booking?.hotel_name ??
      (booking?.application_no ? `Visa Application ${booking.application_no}` : ''),
    `Booking #${booking?.id ?? '-'}`,
  )

const normalizeBookingAmount = (booking) =>
  toNumber(
    booking?.payment_amount ??
      booking?.package_total_cost ??
      booking?.hotel_total_cost ??
      booking?.fee_snapshot ??
      booking?.trip_price,
  )

const normalizeBookingPaymentLabel = (booking) =>
  normalizeText(
    booking?.payment_method ??
      booking?.package_payment_status ??
      booking?.hotel_payment_status ??
      booking?.visa_payment_status,
    'N/A',
  )

const normalizeBookingExtraStatus = (booking) =>
  normalizeText(booking?.hotel_booking_status ?? booking?.visa_status ?? booking?.refund_status, 'N/A')

const normalizeUserProfileBooking = (booking = {}, index = 0) => ({
  amount: normalizeBookingAmount(booking),
  amountLabel: formatUserProfileCurrency(normalizeBookingAmount(booking)),
  bookingType: normalizeText(booking.booking_type, 'N/A'),
  createdAt: booking.created_at ?? '',
  createdAtLabel: formatUserProfileDateTime(booking.created_at, 'N/A'),
  displayTitle: normalizeBookingDisplayTitle(booking),
  extraStatus: normalizeBookingExtraStatus(booking),
  extraStatusToneClassName: getUserProfileStatusToneClassName(normalizeBookingExtraStatus(booking)),
  id: booking.id ?? `booking-${index}`,
  paymentLabel: normalizeBookingPaymentLabel(booking),
  refundAmountLabel: booking.refund_id ? formatUserProfileCurrency(booking.refund_amount) : 'N/A',
  refundReason: normalizeText(booking.refund_reason, 'No refund reason added'),
  refundStatus: normalizeText(booking.refund_status, 'N/A'),
  seatNumbers: normalizeText(booking.seat_numbers, 'N/A'),
  status: normalizeText(booking.status, 'N/A'),
  statusToneClassName: getUserProfileStatusToneClassName(booking.status),
  travelDateLabel: normalizeText(booking.departure_time ?? booking.check_in_date, 'N/A'),
  visaApplicationNo: normalizeText(booking.application_no, ''),
  visaCountry: normalizeText(booking.country_name_snapshot, ''),
  visaStatus: normalizeText(booking.visa_status, ''),
  visaType: normalizeText(booking.visa_type_snapshot, ''),
})

const normalizeUserProfileTicket = (ticket = {}, index = 0) => ({
  createdAtLabel: formatUserProfileDateTime(ticket.created_at, 'N/A'),
  description: normalizeText(ticket.description, 'No description provided'),
  id: ticket.id ?? `ticket-${index}`,
  resolvedBy: normalizeText(ticket.resolved_by, 'Not resolved'),
  status: normalizeText(ticket.status, 'N/A'),
  statusToneClassName: getUserProfileStatusToneClassName(ticket.status),
  title: normalizeText(ticket.title, 'Untitled ticket'),
})

const normalizeUserProfileRefund = (refund = {}, index = 0) => ({
  amountLabel: formatUserProfileCurrency(refund.amount),
  bookingLabel: normalizeText(
    refund.trip_name ?? refund.package_name ?? refund.hotel_name,
    `Booking #${refund.booking_id ?? '-'}`,
  ),
  createdAtLabel: formatUserProfileDateTime(refund.created_at, 'N/A'),
  id: refund.id ?? `refund-${index}`,
  reason: normalizeText(refund.reason, 'No reason added'),
  status: normalizeText(refund.status, 'N/A'),
  statusToneClassName: getUserProfileStatusToneClassName(refund.status),
})

const normalizeUserProfileVisa = (application = {}, index = 0) => ({
  applicationNo: normalizeText(application.application_no, 'N/A'),
  countryAndTypeLabel: normalizeText(
    [application.country_name_snapshot, application.visa_type_snapshot].filter(Boolean).join(' • '),
    'N/A',
  ),
  createdAtLabel: formatUserProfileDateTime(application.created_at, 'N/A'),
  feeLabel: formatUserProfileCurrency(application.fee_snapshot),
  id: application.id ?? `visa-${index}`,
  packageLabel: normalizeText(application.visa_package_name ?? application.full_name, 'N/A'),
  paymentStatus: normalizeText(application.payment_status, 'N/A'),
  status: normalizeText(application.status, 'N/A'),
  statusToneClassName: getUserProfileStatusToneClassName(application.status),
})

export const emptyUserProfileDetails = {
  bookings: [],
  refunds: [],
  summary: {
    cancelledBookings: 0,
    lastBookingAtLabel: 'N/A',
    lastTicketAtLabel: 'N/A',
    openTickets: 0,
    paidBookings: 0,
    pendingBookings: 0,
    refundPending: 0,
    totalBookings: 0,
    totalRefunds: 0,
    totalSpentLabel: formatUserProfileCurrency(0),
    totalTickets: 0,
    visaApplications: 0,
  },
  tickets: [],
  user: {
    email: USERS_EMPTY_STATE.noEmail,
    joinedAtLabel: '-',
    name: USERS_EMPTY_STATE.noName,
    roleLabel: USERS_EMPTY_STATE.noRole,
  },
  visaApplications: [],
}

export const normalizeUserProfileDetails = (payload = {}) => {
  const user = payload?.user ?? {}
  const summary = payload?.summary ?? {}

  return {
    bookings: Array.isArray(payload?.bookings)
      ? payload.bookings.map((booking, index) => normalizeUserProfileBooking(booking, index))
      : [],
    refunds: Array.isArray(payload?.refunds)
      ? payload.refunds.map((refund, index) => normalizeUserProfileRefund(refund, index))
      : [],
    summary: {
      cancelledBookings: toNumber(summary.cancelled_bookings),
      lastBookingAtLabel: formatUserProfileDateTime(summary.last_booking_at, 'N/A'),
      lastTicketAtLabel: formatUserProfileDateTime(summary.last_ticket_at, 'N/A'),
      openTickets: toNumber(summary.open_tickets),
      paidBookings: toNumber(summary.paid_bookings),
      pendingBookings: toNumber(summary.pending_bookings),
      refundPending: toNumber(summary.refund_pending),
      totalBookings: toNumber(summary.total_bookings),
      totalRefunds: toNumber(summary.total_refunds),
      totalSpentLabel: formatUserProfileCurrency(summary.total_spent),
      totalTickets: toNumber(summary.total_tickets),
      visaApplications: toNumber(summary.visa_applications),
    },
    tickets: Array.isArray(payload?.tickets)
      ? payload.tickets.map((ticket, index) => normalizeUserProfileTicket(ticket, index))
      : [],
    user: {
      email: normalizeText(user.email, USERS_EMPTY_STATE.noEmail),
      joinedAtLabel: formatUserProfileDateTime(user.created_at, '-'),
      name: normalizeText(user.name, USERS_EMPTY_STATE.noName),
      roleLabel: formatUserRoleLabel(user.role),
    },
    visaApplications: Array.isArray(payload?.visa_applications)
      ? payload.visa_applications.map((application, index) => normalizeUserProfileVisa(application, index))
      : [],
  }
}

export const emptyUsersComparison = {
  customers: [],
  summary: {
    avgNetSpentLabel: formatUserProfileCurrency(0),
    comparedCustomers: 0,
    topActivityCustomer: null,
    topBookingCustomer: null,
    topValueCustomer: null,
    totalBookings: 0,
    totalNetSpentLabel: formatUserProfileCurrency(0),
  },
}

export const normalizeUsersComparison = (payload = {}) => {
  const summary = payload?.summary ?? {}
  const customers = Array.isArray(payload?.customers) ? payload.customers : []

  return {
    customers: customers.map((customer, index) => {
      const metrics = customer?.metrics ?? {}
      const selectedRanks = customer?.rankings?.selected ?? {}
      const globalRanks = customer?.rankings?.global ?? {}

      return {
        activityRankGlobal: toNumber(globalRanks.activity_rank),
        activityScore: toNumber(metrics.activity_score),
        avgBookingValueLabel: formatUserProfileCurrency(metrics.avg_booking_value),
        avgProfitMargin: toNumber(metrics.avg_profit_margin),
        avgProfitMarginLabel: formatUserProfilePercentage(metrics.avg_profit_margin),
        bookingGrowthDirection: normalizeText(metrics.booking_growth_direction, 'flat'),
        bookingGrowthPercentage: toNumber(metrics.booking_growth_percentage),
        bookingGrowthPercentageLabel: formatUserProfilePercentage(metrics.booking_growth_percentage),
        bookingRankGlobal: toNumber(globalRanks.booking_rank),
        createdAtLabel: formatUserProfileDateTime(customer?.created_at, '-'),
        email: normalizeText(customer?.email, USERS_EMPTY_STATE.noEmail),
        grossProfit: toNumber(metrics.gross_profit),
        grossProfitLabel: formatUserProfileCurrency(metrics.gross_profit),
        growthReferenceMonth: normalizeText(metrics.growth_reference_month, 'Latest month'),
        hotelBookings: toNumber(metrics.hotel_bookings),
        id: customer?.id ?? `comparison-${index}`,
        knownMarginCostLabel: formatUserProfileCurrency(metrics.known_margin_cost),
        knownMarginRevenueLabel: formatUserProfileCurrency(metrics.known_margin_revenue),
        monthlyTrends: Array.isArray(customer?.monthly_trends)
          ? customer.monthly_trends.map((trend) => ({
              amount: toNumber(trend.amount),
              amountLabel: formatUserProfileCurrency(trend.amount),
              bookingCount: toNumber(trend.booking_count),
              month: normalizeText(trend.month, 'Unknown'),
              monthKey: normalizeText(trend.month_key, ''),
            }))
          : [],
        name: normalizeText(customer?.name, USERS_EMPTY_STATE.noName),
        netSpent: toNumber(metrics.net_spent),
        netSpentLabel: formatUserProfileCurrency(metrics.net_spent),
        openTickets: toNumber(metrics.open_tickets),
        packageBookings: toNumber(metrics.package_bookings),
        paidBookings: toNumber(metrics.paid_bookings),
        pendingBookings: toNumber(metrics.pending_bookings),
        refundPending: toNumber(metrics.refund_pending),
        revenueGrowthDirection: normalizeText(metrics.amount_growth_direction, 'flat'),
        revenueGrowthPercentage: toNumber(metrics.amount_growth_percentage),
        revenueGrowthPercentageLabel: formatUserProfilePercentage(metrics.amount_growth_percentage),
        roleLabel: formatUserRoleLabel(customer?.role),
        selectedActivityRank: toNumber(selectedRanks.activity_rank),
        selectedBookingRank: toNumber(selectedRanks.booking_rank),
        selectedValueRank: toNumber(selectedRanks.value_rank),
        totalBookings: toNumber(metrics.total_bookings),
        totalPaidLabel: formatUserProfileCurrency(metrics.total_paid),
        totalRefundedLabel: formatUserProfileCurrency(metrics.total_refunded),
        totalRefunds: toNumber(metrics.total_refunds),
        totalTickets: toNumber(metrics.total_tickets),
        tripBookings: toNumber(metrics.trip_bookings),
        valueRankGlobal: toNumber(globalRanks.value_rank),
        visaApplications: toNumber(metrics.visa_applications),
      }
    }),
    summary: {
      avgNetSpentLabel: formatUserProfileCurrency(summary.avg_net_spent),
      comparedCustomers: toNumber(summary.compared_customers),
      topActivityCustomer: summary.top_activity_customer ?? null,
      topBookingCustomer: summary.top_booking_customer ?? null,
      topValueCustomer: summary.top_value_customer ?? null,
      totalBookings: toNumber(summary.total_bookings),
      totalNetSpentLabel: formatUserProfileCurrency(summary.total_net_spent),
    },
  }
}
