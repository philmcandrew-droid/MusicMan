import { useEffect } from 'react'
import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { appRoutes } from './app/routeConfig'
import { AppRoutes } from './app/routes'

/**
 * Make the Android hardware back button navigate within the app instead of
 * exiting it. At the home screen we send the app to the background rather
 * than closing it.
 */
function useAndroidBackButton() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const listenerPromise = CapacitorApp.addListener('backButton', () => {
      if (window.location.pathname !== '/') {
        navigate(-1)
      } else {
        CapacitorApp.minimizeApp()
      }
    })

    return () => {
      listenerPromise.then((listener) => listener.remove())
    }
  }, [navigate])
}

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
  useAndroidBackButton()

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>Songster</h1>
          <span>Musician Assistant · Phil McAndrew</span>
        </div>
        {appRoutes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            end={route.path === '/'}
            className={({ isActive }) =>
              `nav-link${isActive ? ' active' : ''}${route.hideOnMobile ? ' desktop-only' : ''}`
            }
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
