import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Home, CalendarDays, BookOpen, ShoppingCart, User } from 'lucide-react'
import { useStore } from '../store/useStore'
import clsx from 'clsx'

const NAV = [
  { to: '/', icon: Home, label: 'Accueil', end: true },
  { to: '/planner', icon: CalendarDays, label: 'Planning' },
  { to: '/recipes', icon: BookOpen, label: 'Recettes' },
  { to: '/shopping', icon: ShoppingCart, label: 'Courses' },
  { to: '/profile', icon: User, label: 'Famille' },
]

const PAGE_TITLES = {
  '/': null,
  '/planner': 'Planning',
  '/recipes': 'Recettes',
  '/shopping': 'Courses',
  '/profile': 'Ma famille',
}

export default function Layout() {
  const { shoppingList, profile } = useStore()
  const location = useLocation()

  const pendingItems = Object.values(shoppingList).flat().filter(i => !i.checked).length
  const title = PAGE_TITLES[location.pathname]
  const memberName = profile.members[0]?.name || 'Moi'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍳</span>
            <span className="font-black text-lg text-gray-900 tracking-tight">
              {title || <>Table<span className="text-primary-500">Famille</span></>}
            </span>
          </div>
          {!title && (
            <span className="text-sm text-gray-400">Bonjour, <span className="font-semibold text-gray-700">{memberName}</span> 👋</span>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 pb-28">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40">
        <div className="bg-white/90 backdrop-blur-md border-t border-gray-100 max-w-2xl mx-auto">
          <div className="flex safe-bottom">
            {NAV.map(({ to, icon: Icon, label, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) => clsx(
                  'flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs font-medium transition-all relative',
                  isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
                )}>
                {({ isActive }) => (
                  <>
                    {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-500 rounded-full" />}
                    <div className="relative">
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                      {to === '/shopping' && pendingItems > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-primary-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {pendingItems > 9 ? '9+' : pendingItems}
                        </span>
                      )}
                    </div>
                    <span className={isActive ? 'font-semibold' : ''}>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}
