import { useState } from 'react'
import { useStore } from '../store/useStore'
import { RECIPE_MAP, RECIPES } from '../data/recipes'
import { DAYS } from '../utils/matcher'
import { Link } from 'react-router-dom'
import { RefreshCw, ChevronDown, ChevronUp, Shuffle } from 'lucide-react'

export default function Planner() {
  const { weekPlan, generatePlan, setMealForDay, estimatedBudget } = useStore()
  const [expandedDay, setExpandedDay] = useState(null)
  const [swapTarget, setSwapTarget] = useState(null) // { day, meal }

  if (!weekPlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <span className="text-6xl mb-4">🗓️</span>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Aucun planning</h1>
        <p className="text-gray-500 text-sm mb-6">
          Génère ton menu de la semaine en un clic — l'algorithme choisit pour toi selon tes goûts, le budget et la saison.
        </p>
        <button
          onClick={generatePlan}
          className="bg-primary-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors"
        >
          ✨ Générer mon planning
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Planning de la semaine</h1>
          {estimatedBudget > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">Budget estimé : <span className="font-semibold text-green-600">{estimatedBudget} €</span></p>
          )}
        </div>
        <button
          onClick={generatePlan}
          className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors"
        >
          <RefreshCw size={14} />
          Regénérer
        </button>
      </div>

      {/* Swap modal */}
      {swapTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => setSwapTarget(null)}>
          <div className="bg-white rounded-t-3xl w-full max-h-[70vh] overflow-y-auto p-4" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <h2 className="font-bold text-gray-900 mb-3">Choisir une recette</h2>
            <div className="space-y-2">
              {RECIPES.map(r => (
                <button
                  key={r.id}
                  onClick={() => { setMealForDay(swapTarget.day, swapTarget.meal, r.id); setSwapTarget(null) }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-left"
                >
                  <span className="text-2xl">{r.emoji}</span>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.time} min · {r.cost.toFixed(2)} €</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Days */}
      <div className="space-y-2">
        {DAYS.map(day => {
          const meals = weekPlan[day] || {}
          const isOpen = expandedDay === day
          const lunch = meals.lunch ? RECIPE_MAP[meals.lunch] : null
          const dinner = meals.dinner ? RECIPE_MAP[meals.dinner] : null

          return (
            <div key={day} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3"
                onClick={() => setExpandedDay(isOpen ? null : day)}
              >
                <span className="font-semibold text-gray-900">{day}</span>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  {lunch && <span>{lunch.emoji}</span>}
                  {dinner && <span>{dinner.emoji}</span>}
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-gray-50 divide-y divide-gray-50">
                  {[['lunch', '☀️ Déjeuner', lunch], ['dinner', '🌙 Dîner', dinner]].map(([key, label, recipe]) => (
                    <div key={key} className="px-4 py-3 flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-1">{label}</p>
                        {recipe ? (
                          <Link to={`/recipes/${recipe.id}`} className="font-medium text-gray-900 text-sm hover:text-primary-600">
                            {recipe.emoji} {recipe.name}
                          </Link>
                        ) : (
                          <p className="text-sm text-gray-300">—</p>
                        )}
                        {recipe && (
                          <p className="text-xs text-gray-400 mt-0.5">{recipe.time} min · {recipe.cost.toFixed(2)} €</p>
                        )}
                      </div>
                      <button
                        onClick={() => setSwapTarget({ day, meal: key })}
                        className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 transition-colors"
                        title="Changer"
                      >
                        <Shuffle size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
