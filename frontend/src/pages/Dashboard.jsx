import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { TrendingUp, AlertCircle, FileText, Plus, ArrowRight } from 'lucide-react'

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN')

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/index.php').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>

  const { stats, recent_invoices, recent_expenses, monthly_revenue } = data || {}

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, marginBottom: 4 }}>
          Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Here's what's happening with your business today.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Invoiced',  value: fmt(stats?.total_invoiced), color: 'var(--accent-light)', sub: 'All time' },
          { label: 'Total Collected', value: fmt(stats?.total_paid),      color: 'var(--success)',      sub: 'Payments received' },
          { label: 'Outstanding',     value: fmt(stats?.outstanding),     color: 'var(--warning)',      sub: 'Awaiting payment' },
          { label: 'This Month Exp.', value: fmt(stats?.total_expenses),  color: 'var(--danger)',       sub: 'Expenses' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: 22 }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {stats?.overdue_count > 0 && (
        <div style={{ background: 'var(--danger-dim)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={16} color="var(--danger)" />
          <span style={{ fontSize: 13, color: 'var(--danger)' }}>
            <strong>{stats.overdue_count}</strong> invoice{stats.overdue_count > 1 ? 's are' : ' is'} overdue.{' '}
            <Link to="/invoices?status=overdue" style={{ color: 'var(--danger)', textDecoration: 'underline' }}>View now →</Link>
          </span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16 }}>Revenue — {new Date().getFullYear()}</h2>
            <TrendingUp size={16} color="var(--accent-light)" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthly_revenue} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '₹' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v)} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={v => [fmt(v), 'Revenue']} labelStyle={{ color: 'var(--text-secondary)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 16, marginBottom: 16 }}>Overview</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Overdue',       count: stats?.overdue_count, color: 'var(--danger)' },
              { label: 'Drafts',        count: stats?.draft_count,   color: 'var(--text-muted)' },
              { label: 'Total Clients', count: stats?.total_clients, color: 'var(--accent-light)' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: s.color }}>{s.count}</span>
              </div>
            ))}
          </div>
          <Link to="/invoices/new" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
            <Plus size={14} /> New Invoice
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15 }}>Recent Invoices</h2>
            <Link to="/invoices" style={{ fontSize: 12, color: 'var(--accent-light)', display: 'flex', alignItems: 'center', gap: 4 }}>View all <ArrowRight size={12} /></Link>
          </div>
          {!recent_invoices?.length ? (
            <div className="empty-state"><FileText size={32} style={{ opacity: 0.3 }} /><p>No invoices yet</p></div>
          ) : recent_invoices.map(inv => (
            <Link key={inv.id} to={`/invoices/${inv.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', textDecoration: 'none' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{inv.invoice_number}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{inv.client_name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{fmt(inv.total)}</div>
                <span className={`badge badge-${inv.status}`} style={{ fontSize: 10 }}>{inv.status.replace('_', ' ')}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15 }}>Recent Expenses</h2>
            <Link to="/expenses" style={{ fontSize: 12, color: 'var(--accent-light)', display: 'flex', alignItems: 'center', gap: 4 }}>View all <ArrowRight size={12} /></Link>
          </div>
          {!recent_expenses?.length ? (
            <div className="empty-state"><p>No expenses yet</p></div>
          ) : recent_expenses.map(exp => (
            <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 13 }}>{exp.description}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{exp.category} · {new Date(exp.expense_date).toLocaleDateString('en-IN')}</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)' }}>−{fmt(exp.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
