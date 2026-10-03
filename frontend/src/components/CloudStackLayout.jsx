import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Activity, Boxes, CircleUserRound, Cloud, Github, LayoutDashboard, LogOut, Menu, Plus, UserRound } from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/templates', label: 'Templates', icon: Boxes },
  { to: '/deployments', label: 'Deployments', icon: Activity },
  { to: '/github', label: 'GitHub simulation', icon: Github },
  { to: '/profile', label: 'Profile', icon: UserRound },
]

export default function CloudStackLayout({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <NavLink to="/" className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-icon"><Cloud size={22} /></span>
          <span>cloud<span className="brand-accent">stack</span><small>PLATFORM TEMPLATES</small></span>
        </NavLink>
        <p className="nav-caption">WORKSPACE</p>
        <nav>
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`} onClick={() => setMenuOpen(false)}>
              <Icon size={18} strokeWidth={1.8} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="live-dot" />
          <div><strong>Local demo mode</strong><small>No AWS connection</small></div>
        </div>
        <button className="nav-link logout-link" onClick={onLogout}><LogOut size={18} />Log out</button>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(!menuOpen)}><Menu size={20} /></button>
          <div className="breadcrumbs">CloudStack <span>/</span> Platform workspace</div>
          <div className="topbar-right">
            <span className="demo-pill">SIMULATION</span>
            <button className="user-chip" onClick={() => navigate('/profile')}><span className="avatar"><CircleUserRound size={19} /></span><span>{user?.name || 'Demo User'}</span></button>
          </div>
        </header>
        <div className="page-content"><Outlet /></div>
      </main>
    </div>
  )
}

export function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p className="page-description">{description}</p>}</div>{action}</div>
}

export function ButtonLink({ to, children, variant = 'primary' }) {
  return <NavLink className={`button button-${variant}`} to={to}>{children}</NavLink>
}

export function EmptyState({ title, text, action }) {
  return <div className="empty-state"><div className="empty-icon"><Boxes size={22} /></div><h3>{title}</h3><p>{text}</p>{action}</div>
}
