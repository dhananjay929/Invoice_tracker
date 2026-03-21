import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Zap, ArrowRight } from 'lucide-react'
import api from '../lib/api'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: 'admin@demo.com', password: 'password' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.post('/auth/login.php', form)

      const data = response.data

      if (!data.token || !data.user) {
        toast.error('Login failed — invalid server response')
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      toast.success('Welcome back, ' + data.user.name + '!')

      // Force full page reload so AuthContext re-reads localStorage
      window.location.href = '/'

    } catch (err) {
      console.error('Login error:', err)
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20, backgroundImage: 'radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.08) 0%, transparent 60%)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 52, height: 52, background: 'var(--accent)', borderRadius: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Zap size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>InvoTrack</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Sign in to your account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@company.com"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label>Password</label>
              <input
                type="password" required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? <span className="spinner" /> : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--accent-light)', fontWeight: 500 }}>Register</Link>
            </p>
          </div>
        </div>

        <div style={{ marginTop: 16, background: 'var(--accent-dim)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
          <p style={{ fontSize: 12, color: 'var(--accent-light)', marginBottom: 4, fontWeight: 600 }}>Demo credentials</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Admin: admin@demo.com / password</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Staff: staff@demo.com / password</p>
        </div>
      </div>
    </div>
  )
}