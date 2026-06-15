import { Outlet, NavLink } from 'react-router-dom'
import { Home, CalendarDays, BookOpen, ShoppingCart, Refrigerator } from 'lucide-react'
import { useStore } from '../store/useStore'
import clsx from 'clsx'

const NAV = [
  { to: '/', icon: Home, label: 'Accueil', end: true },
  { to: '/planner', icon: CalendarDays, label: 'Planning' },
  { to: '/frigo', icon: Refrigerator, label: 'Frigo' },
  { to: '/recipes', icon: BookOpen, label: 'Recettes' },
  { to: '/shopping', icon: ShoppingCart, label: 'Courses' },
]

export default function Layout() {
  const { shoppingList } = useStore()

  const pendingItems = Object.values(shoppingList).flat().filter(i => !i.checked).length

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Main */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 pb-28">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40">
        <div className="bg-white/95 backdrop-blur-md border-t border-gray-100 max-w-2xl mx-auto">
          <div className="flex safe-bottom">
            {NAV.map(({ to, icon: Icon, label, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) => clsx(
                  'flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs font-medium transition-all relative',
                  isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
                )}>
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-500 rounded-full" />
                    )}
                    <div className="relative">
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                      {to === '/shopping' && pendingItems > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-primary-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {pendingItems > 9 ? '9+' : pendingItems}
                        </span>
                      )}
                      {to === '/frigo' && (
                        <span className="absolute -top-1.5 -right-2 bg-green-500 text-white text-[8px] font-bold px-1 py-px rounded-full leading-none">
                          NEW
                        </span>
                      )}
                    </div>
                    <span className={clsx('text-[10px]', isActive ? 'font-bold' : '')}>{label}</span>
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
