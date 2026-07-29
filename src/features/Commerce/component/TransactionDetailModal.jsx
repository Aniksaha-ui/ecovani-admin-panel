import { CreditCard, X } from 'lucide-react'

const value = (input) => input === null || input === undefined || input === '' ? '—' : input
const money = (amount, currency = '৳') => `${currency === 'BDT' ? '৳' : currency || '৳'}${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function TransactionDetailModal({ transaction, onClose }) {
  const fields = [
    ['Transaction ID', transaction.id], ['Type', transaction.transaction_type], ['Status', transaction.status], ['Payment method', transaction.payment_method],
    ['Amount', money(transaction.amount, transaction.currency)], ['Store amount', money(transaction.store_amount, transaction.currency)], ['Currency', transaction.currency], ['Transaction date', transaction.tran_date],
    ['Gateway reference', transaction.bank_ssl_id], ['Bank approval ID', transaction.bank_approval_id], ['Card number', transaction.card_no], ['Settlement status', transaction.settlement_status],
    ['Risk title', transaction.risk_title], ['Discount percentage', transaction.discount_percentage], ['Discount remarks', transaction.discount_remarks], ['Gateway', transaction.method],
    ['Created at', transaction.created_at ? new Date(transaction.created_at).toLocaleString() : null],
  ]
  return <div className="admin-modal-backdrop"><section className="admin-modal admin-modal--wide commerce-transaction-modal"><header className="admin-modal__header"><div><h2><CreditCard size={18} /> Transaction #{transaction.id}</h2><p>Complete payment gateway and linked order record.</p></div><button className="admin-icon-button" onClick={onClose} aria-label="Close transaction details"><X size={18} /></button></header><section className="commerce-transaction-summary"><div><span>Customer</span><strong>{value(transaction.customer_name)}</strong><small>{value(transaction.customer_email)} · {value(transaction.customer_phone)}</small></div><div><span>Order</span><strong>#{transaction.order_id}</strong><small>{value(transaction.order_status)} · {money(transaction.order_total_amount, transaction.currency)}</small></div><div><span>Transaction amount</span><strong>{money(transaction.amount, transaction.currency)}</strong><small>{value(transaction.status)}</small></div></section><section className="commerce-transaction-fields">{fields.map(([label, fieldValue]) => <p key={label}><span>{label}</span><strong>{value(fieldValue)}</strong></p>)}</section><div className="admin-modal__actions"><button className="routes-control routes-control--blue" onClick={onClose}>Close</button></div></section></div>
}
