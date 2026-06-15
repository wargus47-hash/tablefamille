import { useStore } from '../store/useStore'
import { RECIPE_MAP } from '../data/recipes'
import { getCurrentProduce } from '../data/seasonal'
import { Link } from 'react-router-dom'
import { CalendarDays, ShoppingCart, Sparkles, TrendingUp } from 'lucide-react'

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

function getTodayDay() {
  const d = new Date().getDay()
  return DAYS[d === 0 ? 6 : d - 1]
}

export default function Dashboard() {
  const { profile, weekPlan, generatePlan, shoppingList, estimatedBudget } = useStore()
  const produce = getCurrentProduce()
  const today = getTodayDay()
  const todayMeals = weekPlan?.[today]

  const totalShoppingItems = Object.values(shoppingList).flat().length
  const checkedItems = Object.values(shoppingList).flat().filter(i => i.checked).length

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour ! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Today's meals */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Au menu aujourd'hui
        </h2>
        {weekPlan ? (
          <div className="grid grid-cols-2 gap-3">
            {[['lunch', '☀️ Déjeuner'], ['dinner', '🌙 Dîner']].map(([key, label]) => {
              const recipe = todayMeals?.[key] ? RECIPE_MAP[todayMeals[key]] : null
              return (
                <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <p className="text-xs text-gray-400 font-medium mb-2">{label}</p>
                  {recipe ? (
                    <Link to={`/recipes/${recipe.id}`}>
                      <span className="text-3xl block mb-1">{recipe.emoji}</span>
                      <p className="font-semibold text-sm text-gray-900 leading-tight">{recipe.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{recipe.time} min · {recipe.cost.toFixed(2)} €</p>
                    </Link>
                  ) : (
                    <p className="text-sm text-gray-400">Non planifié</p>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-2xl border border-primary-100 p-5 text-center">
            <Sparkles className="mx-auto text-primary-500 mb-3" size={28} />
            <p className="font-semibold text-gray-800 mb-1">Aucun planning cette semaine</p>
            <p className="text-sm text-gray-500 mb-4">Génère ton menu en un clic</p>
            <button
              onClick={generatePlan}
              className="bg-primary-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-600 transition-colors"
            >
              ✨ Générer mon menu
            </button>
          </div>
        )}
      </section>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/planner" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <CalendarDays size={20} className="text-blue-500" />
          </div>
          <div>
            <p className="font-bold text-gray-900">{weekPlan ? '7 jours' : '—'}</p>
            <p className="text-xs text-gray-400">Planning</p>
          </div>
        </Link>

        <Link to="/shopping" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <ShoppingCart size={20} className="text-green-500" />
          </div>
          <div>
            <p className="font-bold text-gray-900">{totalShoppingItems > 0 ? `${checkedItems}/${totalShoppingItems}` : '—'}</p>
            <p className="text-xs text-gray-400">Courses</p>
          </div>
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
            <TrendingUp size={20} className="text-purple-500" />
          </div>
          <div>
            <p className="font-bold text-gray-900">{estimatedBudget > 0 ? `${estimatedBudget} €` : '—'}</p>
            <p className="text-xs text-gray-400">Budget semaine</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <span className="text-lg">👨‍👩‍👧</span>
          </div>
          <div>
            <p className="font-bold text-gray-900">{profile.members.length}</p>
            <p className="text-xs text-gray-400">Membres</p>
          </div>
        </div>
      </div>

      {/* Seasonal produce */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          🌱 De saison en ce moment
        </h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="mb-3">
            <p className="text-xs font-medium text-green-700 mb-2">Légumes</p>
            <div className="flex flex-wrap gap-1.5">
              {produce.veggies.map(v => (
                <span key={v} className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full">{v}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-orange-700 mb-2">Fruits</p>
            <div className="flex flex-wrap gap-1.5">
              {produce.fruits.map(f => (
                <span key={f} className="text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full">{f}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Generate plan CTA if plan exists */}
      {weekPlan && (
        <button
          onClick={generatePlan}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium text-sm transition-colors"
        >
          🔄 Regénérer le planning
        </button>
      )}
    </div>
  )
}
