import { useState } from 'react'
import { useStore } from '../store/useStore'
import { RECIPE_MAP, RECIPES } from '../data/recipes'
import { DAYS } from '../utils/matcher'
import { Link } from 'react-router-dom'
import { RefreshCw, Shuffle, X, Euro, ChevronDown, ChevronUp } from 'lucide-react'
import clsx from 'clsx'

const DAY_ABBR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function getTodayDayIdx() {
  const d = new Date().getDay()
  return d === 0 ? 6 : d - 1
}

function NutritionSummary({ plan }) {
  if (!plan) return null
  let totCal = 0, totProt = 0, totCarbs = 0
  Object.values(plan).forEach(({ lunch, dinner }) => {
    for (const id of [lunch, dinner]) {
      const r = id ? RECIPE_MAP[id] : null
      if (r) { totCal += r.nutrition.calories / r.servings; totProt += r.nutrition.proteins / r.servings; totCarbs += r.nutrition.carbs / r.servings }
    }
  })
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Bilan nutritionnel de la semaine</p>
      <div className="grid grid-cols-3 gap-3 text-center">
        {[['🔥', Math.round(totCal / 7), 'kcal/jour'], ['💪', Math.round(totProt / 7) + 'g', 'protéines/j'], ['🌾', Math.round(totCarbs / 7) + 'g', 'glucides/j']].map(([icon, val, label]) => (
          <div key={label}>
            <p className="text-lg">{icon}</p>
            <p className="font-black text-gray-900">{val}</p>
            <p className="text-[10px] text-gray-400">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Planner() {
  const { weekPlan, generatePlan, setMealForDay, estimatedBudget } = useStore()
  const [selectedDay, setSelectedDay] = useState(getTodayDayIdx())
  const [swapTarget, setSwapTarget] = useState(null)
  const [swapSearch, setSwapSearch] = useState('')
  const [showNutri, setShowNutri] = useState(false)

  if (!weekPlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
        <span className="text-7xl mb-4">🗓️</span>
        <h1 className="text-xl font-extrabold text-gray-900 mb-2">Aucun planning</h1>
        <p className="text-gray-400 text-sm mb-8 max-w-xs">
          L'algorithme choisit 14 repas selon tes goûts, le budget et la saison. Aucun token IA consommé.
        </p>
        <button onClick={generatePlan}
          className="bg-gradient-to-r from-primary-500 to-orange-400 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-primary-200 hover:shadow-primary-300 active:scale-95 transition-all">
          ✨ Générer mon planning
        </button>
      </div>
    )
  }

  const todayIdx = getTodayDayIdx()
  const dayData = DAYS.map((day, i) => ({ day, idx: i, ...weekPlan[day] }))

  const currentDay = DAYS[selectedDay]
  const currentMeals = weekPlan[currentDay] || {}
  const lunch = currentMeals.lunch ? RECIPE_MAP[currentMeals.lunch] : null
  const dinner = currentMeals.dinner ? RECIPE_MAP[currentMeals.dinner] : null

  const swapFiltered = RECIPES.filter(r =>
    r.name.toLowerCase().includes(swapSearch.toLowerCase()) ||
    r.tags.some(t => t.includes(swapSearch.toLowerCase()))
  )

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Planning</h1>
          {estimatedBudget > 0 && (
            <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1">
              <Euro size={12} /><span className="font-semibold text-green-600">{estimatedBudget} €</span> estimés
            </p>
          )}
        </div>
        <button onClick={generatePlan}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors">
          <RefreshCw size={14} /> Regénérer
        </button>
      </div>

      {/* Day selector strip */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {dayData.map(({ day, idx }) => {
          const l = weekPlan[day]?.lunch ? RECIPE_MAP[weekPlan[day].lunch] : null
          const d = weekPlan[day]?.dinner ? RECIPE_MAP[weekPlan[day].dinner] : null
          const isToday = idx === todayIdx
          const isSelected = idx === selectedDay
          return (
            <button key={day} onClick={() => setSelectedDay(idx)}
              className={clsx(
                'flex-shrink-0 flex flex-col items-center px-3 py-2.5 rounded-2xl transition-all border-2',
                isSelected ? 'bg-gray-900 border-gray-900' : isToday ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-100 hover:border-gray-200'
              )}>
              <span className={clsx('text-[10px] font-bold uppercase tracking-wide mb-1', isSelected ? 'text-white/60' : 'text-gray-400')}>
                {DAY_ABBR[idx]}
              </span>
              <div className="flex gap-0.5 text-base">
                <span>{l?.emoji || '·'}</span>
                <span>{d?.emoji || '·'}</span>
              </div>
              {isToday && <div className="w-1 h-1 bg-primary-500 rounded-full mt-1" />}
            </button>
          )
        })}
      </div>

      {/* Day detail */}
      <div className="space-y-3">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          {currentDay}
          {selectedDay === todayIdx && <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full font-semibold">Aujourd'hui</span>}
        </h2>
        {[['lunch', '☀️ Déjeuner', lunch], ['dinner', '🌙 Dîner', dinner]].map(([key, label, recipe]) => (
          <div key={key} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center px-4 py-3 border-b border-gray-50">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide flex-1">{label}</span>
              <button onClick={() => { setSwapTarget({ day: currentDay, meal: key }); setSwapSearch('') }}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-500 font-semibold transition-colors">
                <Shuffle size={12} /> Changer
              </button>
            </div>
            {recipe ? (
              <Link to={`/recipes/${recipe.id}`} className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-3xl flex-shrink-0">
                  {recipe.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{recipe.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{recipe.time} min · {recipe.cost.toFixed(2)} € · {recipe.nutrition.calories} kcal</p>
                  <div className="flex gap-1 mt-1.5">
                    {recipe.tags.slice(0, 2).map(t => (
                      <span key={t} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ) : (
              <button onClick={() => { setSwapTarget({ day: currentDay, meal: key }); setSwapSearch('') }}
                className="w-full px-4 py-5 text-gray-300 text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                <span className="text-2xl">➕</span> Ajouter un repas
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Nutrition toggle */}
      <button onClick={() => setShowNutri(v => !v)}
        className="w-full flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 text-sm font-semibold text-gray-700">
        📊 Bilan nutritionnel de la semaine
        {showNutri ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {showNutri && <NutritionSummary plan={weekPlan} />}

      {/* Swap modal */}
      {swapTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setSwapTarget(null)}>
          <div className="bg-white rounded-t-3xl w-full max-h-[80vh] flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto" />
            </div>
            <div className="px-4 pt-2 pb-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-900">Choisir une recette</h2>
                <button onClick={() => setSwapTarget(null)}><X size={20} className="text-gray-400" /></button>
              </div>
              <input type="text" placeholder="Rechercher…" value={swapSearch}
                onChange={e => setSwapSearch(e.target.value)}
                className="w-full border-2 border-gray-100 focus:border-primary-300 rounded-xl px-3 py-2 text-sm outline-none" />
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2">
              {swapFiltered.map(r => (
                <button key={r.id}
                  onClick={() => { setMealForDay(swapTarget.day, swapTarget.meal, r.id); setSwapTarget(null) }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 text-left transition-colors">
                  <span className="text-2xl">{r.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.time} min · {r.cost.toFixed(2)} €</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
