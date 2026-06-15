import { useState } from 'react'
import { useStore } from '../store/useStore'
import { RECIPE_MAP, RECIPES } from '../data/recipes'
import { getCurrentProduce, getCurrentSeason } from '../data/seasonal'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, ChevronRight, Flame, ShoppingCart } from 'lucide-react'

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

const MOODS = [
  { id: 'tired', emoji: '😴', label: 'Je suis crevé', sub: '≤ 20 min', filter: r => r.time <= 20 },
  { id: 'inspired', emoji: '👨‍🍳', label: 'J\'ai du temps', sub: 'Plats élaborés', filter: r => r.difficulty >= 2 },
  { id: 'kids', emoji: '👶', label: 'Les enfants', sub: 'Recettes kids', filter: r => r.tags.includes('enfants') },
  { id: 'eco', emoji: '💰', label: 'Petit budget', sub: '≤ 4€', filter: r => r.cost <= 4 },
  { id: 'world', emoji: '🌍', label: 'Voyage culinaire', sub: 'Recettes du monde', filter: r => ['asiatique','méditerranéen','mexicain','africain','américain'].some(t => r.tags.includes(t)) },
  { id: 'surprise', emoji: '✨', label: 'Surprends-moi', sub: 'Aléatoire !', filter: null },
]

const SEASON_LABELS = { winter: '❄️ Hiver', spring: '🌸 Printemps', summer: '☀️ Été', fall: '🍂 Automne' }

function getTodayDayIdx() {
  const d = new Date().getDay()
  return d === 0 ? 6 : d - 1
}

function NutritionRing({ calories, max = 2000, size = 56 }) {
  const pct = Math.min(calories / max, 1)
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const dash = circ * pct
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f97316" strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" className="transition-all duration-700" />
    </svg>
  )
}

export default function Dashboard() {
  const { profile, weekPlan, generatePlan, shoppingList, estimatedBudget, streak, startCooking } = useStore()
  const navigate = useNavigate()
  const produce = getCurrentProduce()
  const season = getCurrentSeason()
  const todayIdx = getTodayDayIdx()
  const todayDay = DAYS[todayIdx]
  const todayMeals = weekPlan?.[todayDay]
  const [activeMood, setActiveMood] = useState(null)
  const [moodRecipes, setMoodRecipes] = useState([])

  const totalItems = Object.values(shoppingList).flat().length
  const checkedItems = Object.values(shoppingList).flat().filter(i => i.checked).length

  const lunch = todayMeals?.lunch ? RECIPE_MAP[todayMeals.lunch] : null
  const dinner = todayMeals?.dinner ? RECIPE_MAP[todayMeals.dinner] : null
  const todayCalories = ((lunch?.nutrition.calories || 0) + (dinner?.nutrition.calories || 0)) / 2

  const handleMood = (mood) => {
    setActiveMood(mood.id)
    if (mood.filter) {
      const filtered = RECIPES.filter(mood.filter)
      setMoodRecipes(filtered.slice(0, 4))
    } else {
      const shuffled = [...RECIPES].sort(() => Math.random() - 0.5)
      setMoodRecipes(shuffled.slice(0, 4))
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Date + streak */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm capitalize">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Bonsoir ! 👋</h1>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-3 py-2 rounded-2xl">
            <Flame size={16} className="text-orange-500" />
            <span className="font-bold text-orange-600 text-sm">{streak}</span>
          </div>
        )}
      </div>

      {/* Today's meals */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Au menu aujourd'hui</h2>
          <Link to="/planner" className="text-xs text-primary-500 font-semibold flex items-center gap-0.5">
            Planning <ChevronRight size={14} />
          </Link>
        </div>
        {weekPlan ? (
          <div className="grid grid-cols-2 gap-3">
            {[['lunch', '☀️ Déjeuner', lunch], ['dinner', '🌙 Dîner', dinner]].map(([key, label, recipe]) => (
              <div key={key}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center py-5">
                  <span className="text-5xl">{recipe?.emoji || '❓'}</span>
                </div>
                <div className="p-3">
                  <p className="text-[10px] text-gray-400 font-semibold mb-0.5">{label}</p>
                  {recipe ? (
                    <>
                      <p className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">{recipe.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">{recipe.time} min</span>
                        <button onClick={() => startCooking(recipe.id)}
                          className="text-xs bg-primary-500 text-white px-2.5 py-1 rounded-full font-semibold hover:bg-primary-600 transition-colors">
                          Cuisiner
                        </button>
                      </div>
                    </>
                  ) : <p className="text-sm text-gray-300">Non planifié</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <button onClick={generatePlan}
            className="w-full bg-gradient-to-r from-primary-500 to-orange-400 text-white rounded-3xl p-5 text-left shadow-lg shadow-primary-200 hover:shadow-primary-300 transition-all active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <Sparkles size={24} />
              <div>
                <p className="font-bold text-base">Générer mon menu ✨</p>
                <p className="text-white/70 text-sm mt-0.5">7 jours de repas équilibrés en 1 clic</p>
              </div>
            </div>
          </button>
        )}
      </section>

      {/* Mood selector */}
      <section>
        <h2 className="font-bold text-gray-900 mb-3">Comment tu te sens ce soir ?</h2>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {MOODS.map(mood => (
            <button key={mood.id} onClick={() => handleMood(mood)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-2xl border-2 transition-all ${
                activeMood === mood.id ? 'border-primary-400 bg-primary-50' : 'border-gray-100 bg-white hover:border-gray-200'
              }`}>
              <span className="text-2xl">{mood.emoji}</span>
              <p className="text-[11px] font-bold text-gray-800 whitespace-nowrap">{mood.label}</p>
              <p className="text-[10px] text-gray-400 whitespace-nowrap">{mood.sub}</p>
            </button>
          ))}
        </div>
        {activeMood && moodRecipes.length > 0 && (
          <div className="mt-3 space-y-2 animate-slide-up">
            {moodRecipes.map(r => (
              <Link key={r.id} to={`/recipes/${r.id}`}
                className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-3xl">{r.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.time} min · {r.cost.toFixed(2)} €</p>
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
          <div className="flex justify-center mb-1 relative">
            <NutritionRing calories={todayCalories} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-gray-600">{Math.round(todayCalories)}</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 font-medium">kcal</p>
        </div>

        <Link to="/shopping" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center hover:shadow-md transition-shadow">
          <div className="flex justify-center mb-1">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <ShoppingCart size={18} className="text-green-500" />
            </div>
          </div>
          <p className="font-bold text-gray-900 text-sm">{totalItems > 0 ? `${checkedItems}/${totalItems}` : '—'}</p>
          <p className="text-[10px] text-gray-400">Courses</p>
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
          <div className="flex justify-center mb-1">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <span className="text-lg">💰</span>
            </div>
          </div>
          <p className="font-bold text-gray-900 text-sm">{estimatedBudget > 0 ? `${estimatedBudget}€` : '—'}</p>
          <p className="text-[10px] text-gray-400">Budget</p>
        </div>
      </div>

      {/* Seasonal */}
      <section>
        <h2 className="font-bold text-gray-900 mb-3">
          {SEASON_LABELS[season]} — De saison
        </h2>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div>
            <p className="text-[11px] font-bold text-green-600 uppercase tracking-wide mb-2">Légumes</p>
            <div className="flex flex-wrap gap-1.5">
              {produce.veggies.map(v => (
                <span key={v} className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">{v}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold text-orange-500 uppercase tracking-wide mb-2">Fruits</p>
            <div className="flex flex-wrap gap-1.5">
              {produce.fruits.map(f => (
                <span key={f} className="text-xs bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full font-medium">{f}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {weekPlan && (
        <button onClick={generatePlan}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 text-sm font-medium hover:border-primary-200 hover:text-primary-400 transition-colors">
          🔄 Regénérer le planning
        </button>
      )}
    </div>
  )
}
