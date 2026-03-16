import { useEffect, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Plus, X, Receipt, Trash2, Pencil } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = ['Travel', 'Utilities', 'Software', 'Office', 'Marketing', 'Salaries', 'Rent', 'Other']
const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })
const empty = { category: 'Software', amount: '', description: '', expense_date: new Date().toISOString().split('T')[0] }
const CAT_COLORS = { Travel: '#6366f1', Utilities: '#10b981', Software: '#3b82f6', Office: '#f59e0b', Marketing: '#ec4899', Salaries: '#8b5cf6', Rent: '#ef4444', Other: '#6b7280' }

export default function Expenses() {
  const { user }  = useAuth()
  const [expenses, setExpenses]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(empty)
  const [saving, setSaving]       = useState(false)
  const [catFilter, setCat]       = useState('')

  const load = () =>
    api.get('/expenses/index.php').then(r => setExpenses(r.data)).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const setF     = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const openNew  = () => { setEditing(null); setForm(empty); setShowModal(true) }
  const openEdit = ex => {
    setEditing(ex)
    setForm({ category: ex.category, amount: ex.amount, description: ex.description, expense_date: ex.expense_date })
    setShowModal(true)
  }

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/expenses/index.php?id=${editing.id}`, form)
        toast.success('Expense updated')
      } else {
        await api.post('/expenses/index.php', form)
        toast.success('Expense added')
      }
      setShowModal(false)
      load()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).flat().forEach(m => toast.error(m))
      else toast.error('Failed to save')
    } finally { setSaving(false) }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this expense?')) return
    try { await api.delete(`/expenses/index.php?id=${id}`); toast.success('Deleted'); load() }
    catch { toast.error('Failed to delete') }
  }

  const filtered = catFilter ? expenses.filter(e => e.category === catFilter) : expenses
  const total    = filtered.reduce((s, e) => s + Number(e.amount), 0)

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>Expenses</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            Total: <strong style={{ color: 'var(--danger)' }}>{fmt(total)}</strong>
          </p>
        </div>
        <button onClick={openNew} className="btn btn-primary"><Plus size={16} /> Log Expense</button>
      </div>

      {/* Category filter chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <button onClick={() => setCat('')} className="btn btn-sm"
          style={{ background: !catFilter ? 'var(--accent)' : 'var(--bg-elevated)', border: '1px solid var(--border)', color: !catFilter ? '#fff' : 'var(--text-secondary)' }}>
          All
        </button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c === catFilter ? '' : c)} className="btn btn-sm"
            style={{ background: catFilter === c ? CAT_COLORS[c] + '30' : 'var(--bg-elevated)', border: `1px solid ${catFilter === c ? CAT_COLORS[c] + '60' : 'var(--border)'}`, color: catFilter === c ? CAT_COLORS[c] : 'var(--text-secondary)' }}>
            {c}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><span className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Receipt size={40} style={{ opacity: 0.2, margin: '0 auto 12px' }} />
            <p>No expenses logged</p>
            <button onClick={openNew} className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
              <Plus size={14} /> Log First Expense
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>Date</th><th>Category</th><th>Description</th><th style={{ textAlign: 'right' }}>Amount</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map(exp => (
                <tr key={exp.id}>
                  <td style={{ color: 'var(--text-secondary)' }}>{new Date(exp.expense_date).toLocaleDateString('en-IN')}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: CAT_COLORS[exp.category] || '#6b7280', flexShrink: 0 }} />
                      {exp.category}
                    </span>
                  </td>
                  <td>{exp.description}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--danger)' }}>{fmt(exp.amount)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(exp)} className="btn btn-secondary btn-sm"><Pencil size={12} /></button>
                      {user?.role === 'admin' && (
                        <button onClick={() => handleDelete(exp.id)} className="btn btn-danger btn-sm"><Trash2 size={12} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h2>{editing ? 'Edit Expense' : 'Log Expense'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Category *</label>
                  <select required value={form.category} onChange={setF('category')}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount (₹) *</label>
                  <input type="number" required min="0.01" step="0.01" value={form.amount} onChange={setF('amount')} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" required value={form.expense_date} onChange={setF('expense_date')} />
                </div>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <input required value={form.description} onChange={setF('description')} placeholder="What was this expense for?" />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : editing ? 'Save Changes' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
