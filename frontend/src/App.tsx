import { NavLink } from 'react-router-dom'
import { appRoutes } from './app/routeConfig'
import { AppRoutes } from './app/routes'

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
        <AppRoutes />
      </main>
    </div>
  )
}

export default App
