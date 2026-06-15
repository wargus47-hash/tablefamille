import { Outlet, NavLink } from 'react-router-dom'
import { Home, CalendarDays, BookOpen, ShoppingCart, User } from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { to: '/', icon: Home, label: 'Accueil', end: true },
  { to: '/planner', icon: CalendarDays, label: 'Planning' },
  { to: '/recipes', icon: BookOpen, label: 'Recettes' },
  { to: '/shopping', icon: ShoppingCart, label: 'Courses' },
  { to: '/profile', icon: User, label: 'Famille' },
]

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-2">
          <span className="text-2xl">🍳</span>
          <span className="font-bold text-lg text-gray-900">TableFamille</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-24">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 safe-bottom">
        <div className="max-w-2xl mx-auto flex">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors',
                  isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
