import { useEffect, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Plus, X, Users, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const empty = { name: '', email: '', phone: '', company_name: '', address: '', gst_number: '' }

export default function Clients() {
  const { user }  = useAuth()
  const [clients, setClients]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(empty)
  const [saving, setSaving]       = useState(false)

  const load = () =>
    api.get('/clients/index.php').then(r => setClients(r.data)).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const openNew  = () => { setEditing(null); setForm(empty); setShowModal(true) }
  const openEdit = c  => {
    setEditing(c)
    setForm({ name: c.name, email: c.email, phone: c.phone || '', company_name: c.company_name || '', address: c.address || '', gst_number: c.gst_number || '' })
    setShowModal(true)
  }
  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/clients/index.php?id=${editing.id}`, form)
        toast.success('Client updated')
      } else {
        await api.post('/clients/index.php', form)
        toast.success('Client added')
      }
      setShowModal(false)
      load()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).flat().forEach(m => toast.error(m))
      else toast.error('Failed to save client')
    } finally { setSaving(false) }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this client? Their invoices will also be deleted.')) return
    try {
      await api.delete(`/clients/index.php?id=${id}`)
      toast.success('Client deleted')
      load()
    } catch { toast.error('Cannot delete client') }
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>Clients</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>{clients.length} clients</p>
        </div>
        <button onClick={openNew} className="btn btn-primary"><Plus size={16} /> Add Client</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><span className="spinner" /></div>
        ) : clients.length === 0 ? (
          <div className="empty-state">
            <Users size={40} style={{ opacity: 0.2, margin: '0 auto 12px' }} />
            <p>No clients yet</p>
            <button onClick={openNew} className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
              <Plus size={14} /> Add First Client
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>Name</th><th>Company</th><th>Email</th><th>Phone</th><th>Invoices</th><th></th></tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.company_name || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.email}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.phone || '—'}</td>
                  <td>
                    <span style={{ background: 'var(--accent-dim)', color: 'var(--accent-light)', padding: '2px 10px', borderRadius: 99, fontSize: 12 }}>
                      {c.invoices_count}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(c)} className="btn btn-secondary btn-sm"><Pencil size={12} /></button>
                      {user?.role === 'admin' && (
                        <button onClick={() => handleDelete(c.id)} className="btn btn-danger btn-sm"><Trash2 size={12} /></button>
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
              <h2>{editing ? 'Edit Client' : 'New Client'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label>Name *</label><input required value={form.name} onChange={setF('name')} placeholder="Client name" /></div>
                <div className="form-group"><label>Company</label><input value={form.company_name} onChange={setF('company_name')} placeholder="Company name" /></div>
                <div className="form-group"><label>Email *</label><input type="email" required value={form.email} onChange={setF('email')} placeholder="client@email.com" /></div>
                <div className="form-group"><label>Phone</label><input value={form.phone} onChange={setF('phone')} placeholder="+91 98765 43210" /></div>
                <div className="form-group"><label>GST Number</label><input value={form.gst_number} onChange={setF('gst_number')} placeholder="27AAPFU0939F1ZV" /></div>
              </div>
              <div className="form-group"><label>Address</label><textarea rows={2} value={form.address} onChange={setF('address')} placeholder="Full address" /></div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : editing ? 'Save Changes' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
