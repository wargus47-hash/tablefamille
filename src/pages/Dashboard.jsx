import { useState } from 'react'
import { useStore } from '../store/useStore'
import { RECIPE_MAP, RECIPES } from '../data/recipes'
import { getCurrentProduce, getCurrentSeason } from '../data/seasonal'
import { Link } from 'react-router-dom'
import { ChevronRight, Flame, ShoppingCart, TrendingUp, Target, Play, Sparkles, Coffee } from 'lucide-react'
import clsx from 'clsx'

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const SEASON_LABELS = { winter: '❄️ Hiver', spring: '🌸 Printemps', summer: '☀️ Été', fall: '🍂 Automne' }

const DAILY_TIPS = [
  { emoji: '🧂', tip: 'Salez l\'eau des pâtes généreusement — ça change tout !' },
  { emoji: '🔥', tip: 'Préchauffez la poêle avant d\'ajouter l\'huile pour mieux saisir.' },
  { emoji: '🧄', tip: 'L\'ail écrasé (non coupé) donne plus de saveur dans les sauces.' },
  { emoji: '🫙', tip: 'Cuisinez en double quantité et congelez — vous gagnerez du temps.' },
  { emoji: '🍋', tip: 'Un trait de jus de citron en fin de cuisson réveille tous les plats.' },
  { emoji: '🧅', tip: 'Caramélisez les oignons à feu doux 30 min pour un résultat fondant.' },
  { emoji: '🥩', tip: 'Laissez la viande reposer 5 min hors du feu avant de la couper.' },
  { emoji: '🌿', tip: 'Ajoutez les herbes fraîches toujours hors du feu pour garder l\'arôme.' },
  { emoji: '🥚', tip: 'Pour des œufs brouillés parfaits : feu doux et spatule douce.' },
  { emoji: '🍝', tip: 'Gardez l\'eau de cuisson des pâtes — elle lie parfaitement les sauces.' },
  { emoji: '🧈', tip: 'Un cube de beurre en fin de sauce (montée au beurre) la rend brillante.' },
  { emoji: '🫕', tip: 'Les plats mijotés sont toujours meilleurs réchauffés le lendemain.' },
  { emoji: '🥦', tip: 'Faites sauter les légumes à feu très vif pour garder leur croquant.' },
  { emoji: '🍅', tip: 'Stockez les tomates à température ambiante — le frigo tue leur saveur.' },
]

const BATCH_IDEAS = [
  { emoji: '🍚', label: 'Cuire 500g de riz', desc: 'Base pour 3-4 repas de la semaine' },
  { emoji: '🫘', label: 'Préparer des lentilles', desc: 'Prêtes en 25 min, se gardent 4 jours' },
  { emoji: '🥕', label: 'Éplucher & couper les légumes', desc: 'Carottes, céleri, poireaux pour la semaine' },
  { emoji: '🍗', label: 'Rôtir du poulet', desc: 'À décliner en salades, wraps, soupes' },
  { emoji: '🥫', label: 'Sauce tomate maison', desc: '1 grande casserole = 4 repas' },
]

const MOODS = [
  { id: 'tired', emoji: '😴', label: 'Je suis crevé', filter: r => r.time <= 20 },
  { id: 'inspired', emoji: '👨‍🍳', label: 'J\'ai du temps', filter: r => r.difficulty >= 3 },
  { id: 'kids', emoji: '👶', label: 'Les enfants', filter: r => r.tags.includes('enfants') },
  { id: 'eco', emoji: '💰', label: 'Petit budget', filter: r => r.cost <= 4 },
  { id: 'world', emoji: '🌍', label: 'Voyage', filter: r => ['asiatique','méditerranéen','mexicain','africain','indien'].some(t => r.tags.includes(t)) },
  { id: 'surprise', emoji: '✨', label: 'Surprise !', filter: null },
]

function getTodayDayIdx() {
  const d = new Date().getDay()
  return d === 0 ? 6 : d - 1
}

function getGreeting(name) {
  const h = new Date().getHours()
  if (h < 6) return { text: `Bonne nuit, ${name} 🌙`, sub: 'Vous êtes couche-tard !' }
  if (h < 12) return { text: `Bonjour, ${name} ☀️`, sub: 'Quelle belle journée en perspective !' }
  if (h < 14) return { text: `Bon appétit, ${name} 🍽️`, sub: 'C\'est l\'heure du déjeuner !' }
  if (h < 18) return { text: `Bon après-midi, ${name} 👋`, sub: 'Le dîner se prépare bientôt...' }
  if (h < 22) return { text: `Bonsoir, ${name} 🌆`, sub: 'C\'est l\'heure de cuisiner !' }
  return { text: `Bonsoir, ${name} 🌙`, sub: 'Dernière ligne droite !' }
}

function NutritionRing({ value, max, size = 52, color = '#f97316' }) {
  const pct = Math.min(value / max, 1)
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round" className="transition-all duration-700" />
    </svg>
  )
}

function HeroMeal({ recipe, label, onCook }) {
  if (!recipe) return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl">❓</div>
      <p className="text-sm text-gray-300 font-medium">Non planifié</p>
    </div>
  )
  return (
    <div className="flex items-center gap-3">
      <Link to={`/recipes/${recipe.id}`}
        className="w-16 h-16 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 hover:scale-105 transition-transform">
        {recipe.emoji}
      </Link>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        <Link to={`/recipes/${recipe.id}`}>
          <p className="font-extrabold text-gray-900 text-sm leading-tight line-clamp-1">{recipe.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{recipe.time} min · {recipe.nutrition.calories} kcal</p>
        </Link>
      </div>
      <button onClick={onCook}
        className="flex-shrink-0 flex items-center gap-1.5 bg-gray-900 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-gray-700 active:scale-95 transition-all">
        <Play size={11} />
        Cuisiner
      </button>
    </div>
  )
}

export default function Dashboard() {
  const { profile, weekPlan, generatePlan, shoppingList, estimatedBudget, streak, startCooking, totalSavedEver, totalMealsPrepared } = useStore()
  const produce = getCurrentProduce()
  const season = getCurrentSeason()
  const todayIdx = getTodayDayIdx()
  const todayDay = DAYS[todayIdx]
  const todayMeals = weekPlan?.[todayDay]
  const [activeMood, setActiveMood] = useState(null)
  const [moodRecipes, setMoodRecipes] = useState([])

  const memberName = profile.members[0]?.name || 'Chef'
  const nbPersons = profile.members.length || 1
  const greeting = getGreeting(memberName)

  const lunch = todayMeals?.lunch ? RECIPE_MAP[todayMeals.lunch] : null
  const dinner = todayMeals?.dinner ? RECIPE_MAP[todayMeals.dinner] : null

  const todayCalories = ((lunch?.nutrition.calories || 0) / (lunch?.servings || 1) + (dinner?.nutrition.calories || 0) / (dinner?.servings || 1))
  const calorieGoal = profile.calorieGoal || 2000

  const totalItems = Object.values(shoppingList).flat().length
  const checkedItems = Object.values(shoppingList).flat().filter(i => i.checked).length

  // Savings
  const restaurantCostPerWeek = 14 * 12 * nbPersons
  const weekSavings = estimatedBudget > 0 ? Math.max(0, restaurantCostPerWeek - estimatedBudget) : 0

  // Daily tip (rotates by day of year)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  const tip = DAILY_TIPS[dayOfYear % DAILY_TIPS.length]

  // Batch cooking (suggest on Thu/Fri/Sat/Sun)
  const isPreWeekend = todayIdx >= 3
  const batchRecipe = weekPlan
    ? Object.values(weekPlan).flatMap(d => [RECIPE_MAP[d.lunch], RECIPE_MAP[d.dinner]]).filter(Boolean).sort((a, b) => b.time - a.time)[0]
    : null

  const handleMood = (mood) => {
    setActiveMood(mood.id)
    const pool = mood.filter ? RECIPES.filter(mood.filter) : [...RECIPES]
    const shuffled = pool.sort(() => Math.random() - 0.5)
    setMoodRecipes(shuffled.slice(0, 4))
  }

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Greeting */}
      <div className="flex items-start justify-between pt-1">
        <div>
          <p className="text-gray-400 text-sm capitalize">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-xl font-extrabold text-gray-900 leading-tight mt-0.5">{greeting.text}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{greeting.sub}</p>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1 bg-orange-50 border border-orange-200 px-2.5 py-1.5 rounded-xl">
              <Flame size={14} className="text-orange-500" />
              <span className="font-bold text-orange-600 text-sm">{streak}</span>
            </div>
          )}
          <Link to="/profile">
            <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-lg border-2 border-primary-200">
              {profile.members[0]?.avatar || '👤'}
            </div>
          </Link>
        </div>
      </div>

      {/* Today's meals */}
      {weekPlan ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <p className="font-bold text-gray-900 text-sm">Au menu aujourd'hui</p>
            <Link to="/planner" className="text-xs text-primary-500 font-semibold flex items-center gap-0.5">
              Modifier <ChevronRight size={12} />
            </Link>
          </div>
          <div className="px-4 py-3 space-y-3 divide-y divide-gray-50">
            <HeroMeal recipe={lunch} label="☀️ Déjeuner" onCook={() => lunch && startCooking(lunch.id)} />
            <div className="pt-3">
              <HeroMeal recipe={dinner} label="🌙 Dîner" onCook={() => dinner && startCooking(dinner.id)} />
            </div>
          </div>
          {todayCalories > 0 && (
            <div className="px-4 pb-4">
              <div className="bg-gray-50 rounded-2xl px-4 py-2.5 flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <NutritionRing value={todayCalories} max={calorieGoal} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] font-black text-gray-600">{Math.round(todayCalories / calorieGoal * 100)}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-700">{Math.round(todayCalories)} kcal aujourd'hui</p>
                  <p className="text-[10px] text-gray-400">Objectif : {calorieGoal} kcal</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs font-bold text-gray-600">{lunch?.nutrition.proteins || 0 + dinner?.nutrition.proteins || 0}g</p>
                  <p className="text-[10px] text-gray-400">protéines</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button onClick={generatePlan}
          className="w-full bg-gradient-to-r from-primary-500 to-orange-400 text-white rounded-3xl p-5 text-left shadow-lg shadow-primary-100 hover:shadow-primary-200 transition-all active:scale-[0.98]">
          <div className="flex items-center gap-3">
            <Sparkles size={24} />
            <div>
              <p className="font-extrabold text-base">Générer mon menu ✨</p>
              <p className="text-white/70 text-sm mt-0.5">7 jours équilibrés · liste de courses auto</p>
            </div>
          </div>
        </button>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Savings */}
        <div className={clsx(
          'bg-white rounded-2xl border shadow-sm p-3 text-center transition-all',
          weekSavings > 0 ? 'border-green-100' : 'border-gray-100'
        )}>
          <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-1.5">
            <TrendingUp size={16} className="text-green-500" />
          </div>
          <p className="font-black text-gray-900 text-sm">{weekSavings > 0 ? `${weekSavings}€` : '—'}</p>
          <p className="text-[10px] text-gray-400 leading-tight">Économisé<br/>cette semaine</p>
        </div>

        {/* Shopping */}
        <Link to="/shopping" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center hover:shadow-md transition-all active:scale-95">
          <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-1.5">
            <ShoppingCart size={16} className="text-blue-500" />
          </div>
          <p className="font-black text-gray-900 text-sm">{totalItems > 0 ? `${checkedItems}/${totalItems}` : '—'}</p>
          <p className="text-[10px] text-gray-400">Courses</p>
        </Link>

        {/* Total saved ever */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
          <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-1.5">
            <Target size={16} className="text-amber-500" />
          </div>
          <p className="font-black text-gray-900 text-sm">{totalMealsPrepared || 0}</p>
          <p className="text-[10px] text-gray-400">Repas<br/>cuisinés</p>
        </div>
      </div>

      {/* Savings highlight */}
      {(totalSavedEver || 0) >= 50 && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-4 text-white animate-pop">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <p className="font-extrabold text-base">Incroyable !</p>
              <p className="text-white/80 text-sm">Vous avez économisé <span className="font-black text-white">{Math.round(totalSavedEver || 0)} €</span> au total vs restaurant !</p>
            </div>
          </div>
        </div>
      )}

      {/* Mood selector */}
      <section>
        <h2 className="font-bold text-gray-900 mb-2.5">Comment tu te sens ce soir ?</h2>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {MOODS.map(mood => (
            <button key={mood.id} onClick={() => handleMood(mood)}
              className={clsx(
                'flex-shrink-0 flex flex-col items-center gap-1 px-3.5 py-2.5 rounded-2xl border-2 transition-all',
                activeMood === mood.id ? 'border-primary-400 bg-primary-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'
              )}>
              <span className="text-xl">{mood.emoji}</span>
              <p className="text-[11px] font-bold text-gray-700 whitespace-nowrap">{mood.label}</p>
            </button>
          ))}
        </div>
        {activeMood && moodRecipes.length > 0 && (
          <div className="mt-3 space-y-2 animate-slide-up">
            {moodRecipes.map(r => (
              <Link key={r.id} to={`/recipes/${r.id}`}
                className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 px-4 py-3 shadow-sm hover:shadow-md transition-all">
                <span className="text-3xl">{r.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.time} min · {r.cost.toFixed(2)} €</p>
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Batch cooking */}
      {isPreWeekend && weekPlan && (
        <section>
          <div className="flex items-center gap-2 mb-2.5">
            <Coffee size={16} className="text-primary-500" />
            <h2 className="font-bold text-gray-900">Prep du dimanche</h2>
            <span className="text-[10px] bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full font-semibold">Gain de temps</span>
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 space-y-2.5">
            {BATCH_IDEAS.slice(0, 3).map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">{b.emoji}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{b.label}</p>
                  <p className="text-xs text-gray-400">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Daily tip */}
      <div className="bg-amber-50 border border-amber-100 rounded-3xl px-4 py-3.5 flex items-start gap-3">
        <span className="text-2xl flex-shrink-0 mt-0.5">{tip.emoji}</span>
        <div>
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wide mb-0.5">Astuce du jour</p>
          <p className="text-sm text-amber-900 font-medium leading-snug">{tip.tip}</p>
        </div>
      </div>

      {/* Seasonal produce */}
      <section>
        <h2 className="font-bold text-gray-900 mb-2.5">{SEASON_LABELS[season]} — De saison</h2>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div>
            <p className="text-[11px] font-bold text-green-600 uppercase tracking-wide mb-2">Légumes</p>
            <div className="flex flex-wrap gap-1.5">
              {produce.veggies.slice(0, 8).map(v => (
                <span key={v} className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">{v}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold text-orange-500 uppercase tracking-wide mb-2">Fruits</p>
            <div className="flex flex-wrap gap-1.5">
              {produce.fruits.slice(0, 6).map(f => (
                <span key={f} className="text-xs bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full font-medium">{f}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Regen button */}
      {weekPlan && (
        <button onClick={generatePlan}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 text-sm font-medium hover:border-primary-200 hover:text-primary-400 transition-colors">
          🔄 Regénérer le planning de la semaine
        </button>
      )}

    </div>
  )
}
