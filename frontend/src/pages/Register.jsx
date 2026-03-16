import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Zap, ArrowRight } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', company_name: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password !== form.password_confirmation) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      await register({ ...form, role: 'admin' })
      toast.success('Account created!')
      navigate('/')
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).flat().forEach(m => toast.error(m))
      else toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20, backgroundImage: 'radial-gradient(ellipse at 70% 80%, rgba(99,102,241,0.08) 0%, transparent 60%)' }}>
      <div style={{ width: '100%', maxWidth: 460 }} className="animate-in">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: 'var(--accent)', borderRadius: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Zap size={26} color="#fff" /></div>
          <h1 style={{ fontSize: 26, marginBottom: 6 }}>Create your account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Set up your billing workspace</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group"><label>Full Name *</label><input required value={form.name} onChange={set('name')} placeholder="Your name" /></div>
              <div className="form-group"><label>Company Name</label><input value={form.company_name} onChange={set('company_name')} placeholder="Your company" /></div>
            </div>
            <div className="form-group"><label>Email *</label><input type="email" required value={form.email} onChange={set('email')} placeholder="you@company.com" /></div>
            <div className="form-group"><label>Phone</label><input value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group"><label>Password *</label><input type="password" required value={form.password} onChange={set('password')} placeholder="Min 8 chars" /></div>
              <div className="form-group"><label>Confirm *</label><input type="password" required value={form.password_confirmation} onChange={set('password_confirmation')} placeholder="Repeat" /></div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
              {loading ? <span className="spinner" /> : <>Create Account <ArrowRight size={16} /></>}
            </button>
          </form>
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Already have an account? <Link to="/login" style={{ color: 'var(--accent-light)', fontWeight: 500 }}>Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
