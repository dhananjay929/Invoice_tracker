import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import { Plus, Search, FileText } from 'lucide-react'

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN')

export default function Invoices() {
  const [invoices, setInvoices]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('')
  const [searchParams]            = useSearchParams()

  useEffect(() => {
    const s = searchParams.get('status') || ''
    setStatus(s)
    const params = {}
    if (s) params.status = s
    api.get('/invoices/index.php', { params })
      .then(r => setInvoices(r.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      inv.invoice_number.toLowerCase().includes(q) ||
      (inv.client_name || '').toLowerCase().includes(q)
    const matchStatus = !statusFilter || inv.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>Invoices</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>{invoices.length} total</p>
        </div>
        <Link to="/invoices/new" className="btn btn-primary"><Plus size={16} /> New Invoice</Link>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input placeholder="Search by invoice number or client name..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <select value={statusFilter} onChange={e => setStatus(e.target.value)} style={{ width: 160 }}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><span className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <FileText size={40} style={{ opacity: 0.2, margin: '0 auto 12px' }} />
            <p>No invoices found</p>
            <Link to="/invoices/new" className="btn btn-primary btn-sm" style={{ marginTop: 12, display: 'inline-flex' }}>
              <Plus size={14} /> Create your first invoice
            </Link>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 500 }}>{inv.invoice_number}</td>
                  <td>
                    <div>{inv.client_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{inv.client_company}</div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{new Date(inv.issue_date).toLocaleDateString('en-IN')}</td>
                  <td style={{ color: inv.status === 'overdue' ? 'var(--danger)' : 'var(--text-secondary)' }}>
                    {new Date(inv.due_date).toLocaleDateString('en-IN')}
                  </td>
                  <td style={{ fontWeight: 600 }}>{fmt(inv.total)}</td>
                  <td><span className={`badge badge-${inv.status}`}>{inv.status.replace('_', ' ')}</span></td>
                  <td><Link to={`/invoices/${inv.id}`} className="btn btn-secondary btn-sm">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
