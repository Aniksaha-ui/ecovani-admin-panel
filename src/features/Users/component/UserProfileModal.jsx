import { BriefcaseBusiness, ReceiptText, ShieldAlert, Tickets, UserRound, X } from 'lucide-react'

function MetricCard({ label, toneClassName = 'text-white', value }) {
  return (
    <article className="rounded-lg border border-[#332d30] bg-[#171314] p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8fa0bd]">{label}</p>
      <p className={`mt-2 text-lg font-bold ${toneClassName}`}>{value}</p>
    </article>
  )
}

function EmptyState({ message }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-dashed border-[#332d30] bg-[#171314] px-5 py-8 text-center text-sm font-medium text-[#8fa0bd]">
      {message}
    </div>
  )
}

function StatusBadge({ label, toneClassName }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${toneClassName}`}>
      {label}
    </span>
  )
}

export function UserProfileModal({ error, fallbackUser, isLoading, onClose, profile }) {
  if (!fallbackUser && !isLoading && !error) {
    return null
  }

  const activeProfile = profile?.user?.name ? profile : null
  const title = activeProfile?.user?.name ?? fallbackUser?.name ?? 'User'

  return (
    <div className="crud-modal" role="dialog" aria-modal="true">
      <button type="button" className="crud-modal__backdrop" aria-label="Close customer profile" onClick={onClose} />

      <section className="crud-modal__panel" style={{ width: 'min(1180px, 100%)' }}>
        <header className="crud-modal__header">
          <div className="min-w-0">
            <p className="crud-modal__eyebrow">Customer Profile</p>
            <h2>{title}</h2>
            <p className="mt-2 text-sm text-[#8fa0bd]">
              Review bookings, support complaints, refund history, visa activity, and customer summary from one place.
            </p>
          </div>

          <button type="button" aria-label="Close customer profile" onClick={onClose}>
            <X size={14} />
          </button>
        </header>

        <div className="max-h-[72vh] overflow-y-auto p-4 sm:p-5">
          {isLoading ? (
            <div className="flex min-h-[280px] items-center justify-center rounded-lg border border-[#332d30] bg-[#171314] text-sm font-semibold text-[#8fa0bd]">
              Loading customer profile...
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-900/60 bg-red-950/20 px-4 py-5 text-sm font-medium text-red-200">
              {error}
            </div>
          ) : activeProfile ? (
            <>
              <section className="mb-5 grid gap-3 md:grid-cols-4">
                <MetricCard label="Accounts Spend" toneClassName="text-white" value={activeProfile.summary.totalSpentLabel} />
                <MetricCard label="Total Bookings" toneClassName="text-cyan-200" value={activeProfile.summary.totalBookings} />
                <MetricCard label="Tickets" toneClassName="text-amber-200" value={activeProfile.summary.totalTickets} />
                <MetricCard label="Visa Applications" toneClassName="text-emerald-200" value={activeProfile.summary.visaApplications} />
              </section>

              <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
                <div className="space-y-5">
                  <div className="rounded-lg border border-[#332d30] bg-[#231f21]">
                    <header className="flex min-h-[50px] items-center gap-2 border-b border-[#2d282b] px-4 sm:px-5">
                      <UserRound size={16} className="text-blue-400" />
                      <h3 className="text-sm font-bold text-white">Customer Summary</h3>
                    </header>

                    <div className="grid gap-3 p-4 md:grid-cols-2">
                      <MetricCard label="Name" value={activeProfile.user.name} />
                      <MetricCard label="Email" value={activeProfile.user.email} />
                      <MetricCard label="Role" value={activeProfile.user.roleLabel} />
                      <MetricCard label="Joined" value={activeProfile.user.joinedAtLabel} />
                      <MetricCard label="Paid / Pending" value={`${activeProfile.summary.paidBookings} / ${activeProfile.summary.pendingBookings}`} />
                      <MetricCard label="Cancelled / Refund Pending" value={`${activeProfile.summary.cancelledBookings} / ${activeProfile.summary.refundPending}`} />
                      <MetricCard label="Last Booking" value={activeProfile.summary.lastBookingAtLabel} />
                      <MetricCard label="Last Ticket" value={activeProfile.summary.lastTicketAtLabel} />
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#332d30] bg-[#231f21]">
                    <header className="flex min-h-[50px] items-center gap-2 border-b border-[#2d282b] px-4 sm:px-5">
                      <ShieldAlert size={16} className="text-amber-400" />
                      <h3 className="text-sm font-bold text-white">Reports</h3>
                    </header>

                    <div className="grid gap-3 p-4 md:grid-cols-3">
                      <MetricCard label="Booking Health" value={`${activeProfile.summary.paidBookings} paid`} />
                      <MetricCard label="Support Health" value={`${activeProfile.summary.openTickets} open`} />
                      <MetricCard label="Refund Queue" value={`${activeProfile.summary.totalRefunds} requests`} />
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#332d30] bg-[#231f21]">
                    <header className="flex min-h-[50px] items-center gap-2 border-b border-[#2d282b] px-4 sm:px-5">
                      <Tickets size={16} className="text-rose-400" />
                      <h3 className="text-sm font-bold text-white">Complaints / Tickets</h3>
                    </header>

                    <div className="p-4">
                      {activeProfile.tickets.length ? (
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
                              {activeProfile.tickets.map((ticket) => (
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
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-lg border border-[#332d30] bg-[#231f21]">
                    <header className="flex min-h-[50px] items-center gap-2 border-b border-[#2d282b] px-4 sm:px-5">
                      <BriefcaseBusiness size={16} className="text-cyan-400" />
                      <h3 className="text-sm font-bold text-white">Bookings</h3>
                    </header>

                    <div className="space-y-3 p-4">
                      {activeProfile.bookings.length ? (
                        activeProfile.bookings.map((booking) => (
                          <article key={booking.id} className="rounded-lg border border-[#332d30] bg-[#171314] p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-bold text-white">{booking.displayTitle}</p>
                                <p className="mt-1 text-xs text-[#8fa0bd]">
                                  {booking.bookingType} • {booking.createdAtLabel}
                                </p>
                              </div>

                              <StatusBadge label={booking.status} toneClassName={booking.statusToneClassName} />
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                              <MetricCard label="Amount" value={booking.amountLabel} />
                              <MetricCard label="Payment" value={booking.paymentLabel} />
                              <MetricCard label="Travel / Stay" value={booking.travelDateLabel} />
                              <MetricCard label="Seats" value={booking.seatNumbers} />
                              <MetricCard label="Extra Status" value={booking.extraStatus} />
                              {booking.visaApplicationNo ? (
                                <MetricCard label="Visa Link" value={`${booking.visaApplicationNo} • ${booking.visaCountry} • ${booking.visaType}`} />
                              ) : booking.refundStatus !== 'N/A' ? (
                                <MetricCard label="Refund" value={`${booking.refundAmountLabel} • ${booking.refundStatus}`} />
                              ) : (
                                <MetricCard label="Notes" value="No additional linked records." />
                              )}
                            </div>
                          </article>
                        ))
                      ) : (
                        <EmptyState message="No bookings found for this customer." />
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#332d30] bg-[#231f21]">
                    <header className="flex min-h-[50px] items-center gap-2 border-b border-[#2d282b] px-4 sm:px-5">
                      <ReceiptText size={16} className="text-emerald-400" />
                      <h3 className="text-sm font-bold text-white">Refunds & Visa Activity</h3>
                    </header>

                    <div className="grid gap-5 p-4 xl:grid-cols-2">
                      <div>
                        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8fa0bd]">Refunds</p>
                        {activeProfile.refunds.length ? (
                          <div className="space-y-3">
                            {activeProfile.refunds.map((refund) => (
                              <article key={refund.id} className="rounded-lg border border-[#332d30] bg-[#171314] p-4">
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
                          <EmptyState message="No refund records found." />
                        )}
                      </div>

                      <div>
                        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8fa0bd]">Visa Applications</p>
                        {activeProfile.visaApplications.length ? (
                          <div className="space-y-3">
                            {activeProfile.visaApplications.map((application) => (
                              <article key={application.id} className="rounded-lg border border-[#332d30] bg-[#171314] p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-white">{application.applicationNo}</p>
                                    <p className="mt-1 text-xs text-[#8fa0bd]">{application.countryAndTypeLabel}</p>
                                  </div>
                                  <StatusBadge label={application.status} toneClassName={application.statusToneClassName} />
                                </div>
                                <div className="mt-3 space-y-1 text-sm text-[#dbe7fb]">
                                  <p>{application.packageLabel}</p>
                                  <p>{application.feeLabel}</p>
                                  <p className="text-xs text-[#8fa0bd]">
                                    Payment: {application.paymentStatus} • {application.createdAtLabel}
                                  </p>
                                </div>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <EmptyState message="No visa applications found." />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#332d30] bg-[#171314] p-4 text-sm text-[#8fa0bd]">
                    This profile is loaded from the admin customer-profile endpoint and stays connected to the live user management list.
                  </div>
                </div>
              </section>
            </>
          ) : null}
        </div>
      </section>
    </div>
  )
}
