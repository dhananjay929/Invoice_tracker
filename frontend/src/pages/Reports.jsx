import { useEffect, useState } from 'react'
import api from '../lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })

export default function Reports() {
  const [summary, setSummary] = useState(null)
  const [monthly, setMonthly] = useState(null)
  const [overdue, setOverdue] = useState([])
  const [loading, setLoading] = useState(true)
  const [year, setYear]       = useState(new Date().getFullYear())

  useEffect(() => {
    Promise.all([
      api.get('/reports/index.php?type=summary'),
      api.get(`/reports/index.php?type=monthly&year=${year}`),
      api.get('/reports/index.php?type=overdue'),
    ]).then(([s, m, o]) => {
      setSummary(s.data)
      setMonthly(m.data)
      setOverdue(o.data)
    }).finally(() => setLoading(false))
  }, [year])

  if (loading) return <div style={{ textAlign: 'center', paddingTop: 80 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1>Reports</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Financial overview and analytics</p>
        </div>
        <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ width: 120 }}>
          {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'All-time Revenue',   val: fmt(summary?.revenue?.all_time),   color: 'var(--success)',      sub: 'Total collected' },
          { label: 'This Month Revenue', val: fmt(summary?.revenue?.this_month), color: 'var(--accent-light)', sub: 'Current month' },
          { label: `${year} Expenses`,   val: fmt(summary?.expenses?.this_year), color: 'var(--danger)',       sub: 'This year' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: 22, color: s.color }}>{s.val}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Monthly bar chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, marginBottom: 20 }}>Revenue vs Expenses — {year}</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthly?.data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={v => v >= 1000 ? '₹' + (v / 1000).toFixed(0) + 'k' : '₹' + v} />
            <Tooltip
              contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              formatter={v => [fmt(v)]}
              labelStyle={{ color: 'var(--text-secondary)' }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
            <Bar dataKey="revenue"  name="Revenue"  fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown + Overdue */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h2 style={{ fontSize: 15, marginBottom: 16 }}>Invoice Breakdown</h2>
          {[
            { label: 'Total invoices',  val: summary?.invoices?.total,          color: 'var(--text-primary)' },
            { label: 'Paid',            val: summary?.invoices?.paid,            color: 'var(--success)' },
            { label: 'Sent',            val: summary?.invoices?.sent,            color: 'var(--info)' },
            { label: 'Partially paid',  val: summary?.invoices?.partially_paid,  color: 'var(--warning)' },
            { label: 'Overdue',         val: summary?.invoices?.overdue,         color: 'var(--danger)' },
            { label: 'Draft',           val: summary?.invoices?.draft,           color: 'var(--text-muted)' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</span>
              <span style={{ fontWeight: 600, fontSize: 15, color: s.color }}>{s.val}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Total invoiced</span>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--accent-light)' }}>{fmt(summary?.invoices?.total_amount)}</span>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 15, marginBottom: 16 }}>
            Overdue Invoices
            {overdue.length > 0 && (
              <span style={{ marginLeft: 8, background: 'var(--danger-dim)', color: 'var(--danger)', padding: '1px 8px', borderRadius: 99, fontSize: 11 }}>
                {overdue.length}
              </span>
            )}
          </h2>
          {overdue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 13 }}>No overdue invoices</p>
            </div>
          ) : overdue.slice(0, 6).map(inv => (
            <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{inv.invoice_number}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{inv.client_name} · {inv.days_overdue} days overdue</div>
              </div>
              <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--danger)' }}>{fmt(inv.balance_due)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
