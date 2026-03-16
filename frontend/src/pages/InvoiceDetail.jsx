import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Download, Send, Plus, X } from 'lucide-react'

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })

export default function InvoiceDetail() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const [invoice, setInvoice]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [sending, setSending]     = useState(false)
  const [showPayment, setShowPay] = useState(false)
  const [payForm, setPayForm]     = useState({
    amount: '', paid_at: new Date().toISOString().split('T')[0],
    method: 'bank_transfer', reference: '',
  })

  const load = () =>
    api.get(`/invoices/index.php`, { params: { id } })
      .then(r => setInvoice(r.data))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [id])

  const handleSend = async () => {
    setSending(true)
    try {
      await api.post(`/invoices/send.php?id=${id}`)
      toast.success('Invoice sent to client!')
      load()
    } catch { toast.error('Failed to send. Check mail settings.') }
    finally { setSending(false) }
  }

  const handleDownloadPdf = async () => {
    try {
      const token = localStorage.getItem('token')
      // Direct link download with Authorization header via fetch
      const res = await fetch(`/api/invoices/pdf.php?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `Invoice-${invoice.invoice_number}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch { toast.error('PDF download failed') }
  }

  const handlePayment = async e => {
    e.preventDefault()
    try {
      await api.post(`/payments/index.php?invoice_id=${id}`, payForm)
      toast.success('Payment recorded!')
      setShowPay(false)
      setPayForm({ amount: '', paid_at: new Date().toISOString().split('T')[0], method: 'bank_transfer', reference: '' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment')
    }
  }

  if (loading) return <div style={{ textAlign: 'center', paddingTop: 80 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
  if (!invoice) return <div style={{ padding: 40 }}>Invoice not found.</div>

  const totalPaid = invoice.total_paid || 0
  const balance   = invoice.balance_due || 0

  return (
    <div className="animate-in" style={{ maxWidth: 820 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/invoices')} className="btn btn-secondary btn-sm"><ArrowLeft size={14} /></button>
          <div>
            <h1 style={{ fontSize: 22 }}>{invoice.invoice_number}</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{invoice.client_name}</p>
          </div>
          <span className={`badge badge-${invoice.status}`}>{invoice.status.replace('_', ' ')}</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleDownloadPdf} className="btn btn-secondary btn-sm"><Download size={14} /> PDF</button>
          {['draft', 'sent', 'overdue', 'partially_paid'].includes(invoice.status) && (
            <button onClick={() => setShowPay(true)} className="btn btn-secondary btn-sm"><Plus size={14} /> Payment</button>
          )}
          {invoice.status === 'draft' && (
            <button onClick={handleSend} className="btn btn-primary btn-sm" disabled={sending}>
              {sending ? <span className="spinner" /> : <><Send size={14} /> Send to Client</>}
            </button>
          )}
        </div>
      </div>

      {/* Meta cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Bill To</div>
          <div style={{ fontWeight: 500 }}>{invoice.client_name}</div>
          {invoice.client_company && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{invoice.client_company}</div>}
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{invoice.client_email}</div>
          {invoice.client_phone && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{invoice.client_phone}</div>}
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Dates</div>
          {[['Issue Date', invoice.issue_date], ['Due Date', invoice.due_date]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{l}</span>
              <span>{new Date(v).toLocaleDateString('en-IN')}</span>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Summary</div>
          {[
            ['Total',   fmt(invoice.total),   'var(--text-primary)'],
            ['Paid',    fmt(totalPaid),        'var(--success)'],
            ['Balance', fmt(balance),          balance > 0 ? 'var(--danger)' : 'var(--success)'],
          ].map(([l, v, c]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{l}</span>
              <span style={{ fontWeight: 600, color: c }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Line items */}
      <div className="card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 15 }}>Line Items</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style={{ textAlign: 'right' }}>Qty</th>
              <th style={{ textAlign: 'right' }}>Unit Price</th>
              <th style={{ textAlign: 'right' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map(item => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right' }}>{fmt(item.unit_price)}</td>
                <td style={{ textAlign: 'right', fontWeight: 500 }}>{fmt(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
              <span>Subtotal</span><span>{fmt(invoice.subtotal)}</span>
            </div>
            {invoice.tax_percent > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                <span>Tax ({invoice.tax_percent}%)</span><span>{fmt(invoice.tax_amount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <span>Total</span><span style={{ color: 'var(--accent-light)' }}>{fmt(invoice.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payments */}
      {invoice.payments?.length > 0 && (
        <div className="card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 15 }}>Payments Received</h2>
          </div>
          <table>
            <thead>
              <tr><th>Date</th><th>Method</th><th>Reference</th><th style={{ textAlign: 'right' }}>Amount</th></tr>
            </thead>
            <tbody>
              {invoice.payments.map(p => (
                <tr key={p.id}>
                  <td>{new Date(p.paid_at).toLocaleDateString('en-IN')}</td>
                  <td style={{ textTransform: 'capitalize' }}>{p.method.replace('_', ' ')}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{p.reference || '—'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--success)' }}>{fmt(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Notes & Terms */}
      {(invoice.notes || invoice.terms) && (
        <div className="card" style={{ marginBottom: 20 }}>
          {invoice.notes && (
            <div style={{ marginBottom: invoice.terms ? 16 : 0 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Notes</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Terms</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{invoice.terms}</p>
            </div>
          )}
        </div>
      )}

      {/* Record Payment Modal */}
      {showPayment && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h2>Record Payment</h2>
              <button onClick={() => setShowPay(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Balance due: <strong style={{ color: 'var(--danger)' }}>{fmt(balance)}</strong>
            </p>
            <form onSubmit={handlePayment}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Amount *</label>
                  <input type="number" min="0.01" step="0.01" required value={payForm.amount}
                    onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" required value={payForm.paid_at}
                    onChange={e => setPayForm(f => ({ ...f, paid_at: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Method *</label>
                  <select required value={payForm.method} onChange={e => setPayForm(f => ({ ...f, method: e.target.value }))}>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="card">Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Reference / UTR</label>
                  <input value={payForm.reference} onChange={e => setPayForm(f => ({ ...f, reference: e.target.value }))} placeholder="TXN123456" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => setShowPay(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
