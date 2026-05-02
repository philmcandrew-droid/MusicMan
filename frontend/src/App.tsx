import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { appRoutes } from './app/routeConfig'
import { AppRoutes } from './app/routes'

function PageNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  if (isHome) return null

  return (
    <div className="page-nav">
      <button
        type="button"
        className="page-nav-btn"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>
      <button
        type="button"
        className="page-nav-btn"
        onClick={() => navigate('/')}
        aria-label="Go home"
      >
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12l9-9 9 9" />
          <path d="M5 10v10a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V10" />
        </svg>
        Home
      </button>
    </div>
  )
}

function App() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>MusicMan</h1>
          <span>Musician Assistant · Phil McAndrew</span>
        </div>
        {appRoutes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            end={route.path === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <route.icon />
            {route.label}
          </NavLink>
        ))}
      </aside>
      <main className="main-content">
        <PageNav />
        <AppRoutes />
      </main>
    </div>
  )
}

export default App
