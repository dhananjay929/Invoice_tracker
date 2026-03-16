import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'

const emptyItem = () => ({ description: '', quantity: 1, unit_price: '' })

export default function InvoiceCreate() {
  const navigate = useNavigate()
  const [clients, setClients]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [form, setForm]         = useState({
    client_id: '', issue_date: new Date().toISOString().split('T')[0],
    due_date: '', tax_percent: 18, notes: '', terms: 'Payment due within 30 days.',
  })
  const [items, setItems] = useState([emptyItem()])

  useEffect(() => {
    api.get('/clients/index.php').then(r => setClients(r.data))
  }, [])

  const setF    = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const setItem = (i, k) => e => {
    const updated = [...items]
    updated[i] = { ...updated[i], [k]: e.target.value }
    setItems(updated)
  }
  const addItem    = () => setItems(it => [...it, emptyItem()])
  const removeItem = i  => setItems(it => it.filter((_, idx) => idx !== i))

  const subtotal  = items.reduce((s, it) => s + (Number(it.quantity) * Number(it.unit_price) || 0), 0)
  const taxAmount = subtotal * (Number(form.tax_percent) / 100)
  const total     = subtotal + taxAmount
  const fmt       = n => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })

  const handleSubmit = async e => {
    e.preventDefault()
    if (items.some(it => !it.description || !it.unit_price)) return toast.error('Fill all item fields')
    setLoading(true)
    try {
      const { data } = await api.post('/invoices/index.php', {
        ...form,
        items: items.map(it => ({
          description: it.description,
          quantity:    Number(it.quantity),
          unit_price:  Number(it.unit_price),
        })),
      })
      toast.success('Invoice created!')
      navigate(`/invoices/${data.id}`)
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).flat().forEach(m => toast.error(m))
      else toast.error('Failed to create invoice')
    } finally { setLoading(false) }
  }

  return (
    <div className="animate-in" style={{ maxWidth: 860 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button onClick={() => navigate('/invoices')} className="btn btn-secondary btn-sm"><ArrowLeft size={14} /></button>
        <h1 style={{ fontSize: 24 }}>New Invoice</h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Details */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, marginBottom: 18 }}>Invoice Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Client *</label>
              <select required value={form.client_id} onChange={setF('client_id')}>
                <option value="">Select client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}{c.company_name ? ` (${c.company_name})` : ''}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Issue Date *</label>
              <input type="date" required value={form.issue_date} onChange={setF('issue_date')} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Due Date *</label>
              <input type="date" required value={form.due_date} onChange={setF('due_date')} />
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16 }}>Line Items</h2>
            <button type="button" onClick={addItem} className="btn btn-secondary btn-sm"><Plus size={14} /> Add Item</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px 100px 36px', gap: 8, marginBottom: 8 }}>
            {['Description', 'Qty', 'Unit Price', 'Subtotal', ''].map(h => (
              <div key={h} style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 4px' }}>{h}</div>
            ))}
          </div>

          {items.map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px 100px 36px', gap: 8, marginBottom: 10, alignItems: 'center' }}>
              <input placeholder="Service description" value={item.description} onChange={setItem(i, 'description')} />
              <input type="number" min="0.01" step="0.01" value={item.quantity} onChange={setItem(i, 'quantity')} />
              <input type="number" min="0" step="0.01" placeholder="0.00" value={item.unit_price} onChange={setItem(i, 'unit_price')} />
              <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                {fmt(Number(item.quantity) * Number(item.unit_price) || 0)}
              </div>
              <button type="button" onClick={() => removeItem(i)} className="btn btn-danger btn-sm" style={{ padding: 8, justifyContent: 'center' }} disabled={items.length === 1}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {/* Totals */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <div style={{ display: 'flex', gap: 40, fontSize: 13, color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{fmt(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
                <span>Tax</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input type="number" min="0" max="100" value={form.tax_percent} onChange={setF('tax_percent')} style={{ width: 60, padding: '4px 8px', textAlign: 'center' }} />
                  <span>%</span>
                </div>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{fmt(taxAmount)}</span>
              </div>
              <div style={{ display: 'flex', gap: 40, fontSize: 16, fontWeight: 700 }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent-light)' }}>{fmt(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, marginBottom: 16 }}>Notes & Terms</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Notes</label>
              <textarea rows={3} placeholder="Any notes for the client..." value={form.notes} onChange={setF('notes')} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Terms & Conditions</label>
              <textarea rows={3} placeholder="Payment terms..." value={form.terms} onChange={setF('terms')} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate('/invoices')} className="btn btn-secondary">Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  )
}
