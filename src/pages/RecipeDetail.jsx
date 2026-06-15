import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { RECIPE_MAP } from '../data/recipes'
import { useStore } from '../store/useStore'
import { ArrowLeft, Heart, Star, ChefHat, Clock, Users, Euro, Play, Share2, Minus, Plus } from 'lucide-react'
import clsx from 'clsx'

const DIFF_LABEL = ['', 'Facile', 'Moyen', 'Avancé']
const DIFF_COLOR = ['', 'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700', 'bg-red-100 text-red-700']

const CUISINE_GRADIENTS = {
  asiatique: 'from-red-400 to-pink-500',
  méditerranéen: 'from-blue-400 to-teal-500',
  mexicain: 'from-yellow-400 to-orange-500',
  américain: 'from-blue-500 to-indigo-600',
  africain: 'from-amber-400 to-orange-500',
  végétarien: 'from-green-400 to-emerald-500',
  dessert: 'from-purple-400 to-pink-500',
}

function getHeroGradient(recipe) {
  for (const [key, grad] of Object.entries(CUISINE_GRADIENTS)) {
    if (recipe.tags.includes(key)) return grad
  }
  return 'from-orange-400 to-primary-500'
}

function NutrBar({ label, value, max, color }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        <span className="text-xs font-bold text-gray-900">{Math.round(value)}g</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min((value / max) * 100, 100)}%` }} />
      </div>
    </div>
  )
}

export default function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const recipe = RECIPE_MAP[id]
  const { ratings, rateRecipe, favorites, toggleFavorite, startCooking, profile } = useStore()
  const [servings, setServings] = useState(recipe?.servings || 4)
  const [completedSteps, setCompletedSteps] = useState(new Set())

  if (!recipe) return <div className="text-center py-20 text-gray-400">Recette introuvable</div>

  const ratio = servings / recipe.servings
  const isFav = favorites.includes(recipe.id)
  const rating = ratings[id]

  const toggleStep = (i) => {
    setCompletedSteps(s => {
      const next = new Set(s)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const shareRecipe = async () => {
    const text = `🍳 ${recipe.name}\n⏱ ${recipe.time} min · ${recipe.servings} pers. · ${recipe.cost.toFixed(2)}€\n\nIngrédients :\n${recipe.ingredients.map(i => `• ${i.name} : ${i.qty} ${i.unit}`).join('\n')}`
    try {
      await navigator.clipboard.writeText(text)
      alert('Recette copiée dans le presse-papiers !')
    } catch {
      alert(text)
    }
  }

  return (
    <div className="animate-fade-in pb-8">
      {/* Hero */}
      <div className={`bg-gradient-to-br ${getHeroGradient(recipe)} rounded-3xl mb-5 overflow-hidden`}>
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <button onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex gap-2">
            <button onClick={shareRecipe}
              className="p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors">
              <Share2 size={18} />
            </button>
            <button onClick={() => toggleFavorite(id)}
              className="p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors">
              <Heart size={18} className={isFav ? 'fill-white' : ''} />
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center py-8">
          <span className="text-8xl mb-3 drop-shadow-lg">{recipe.emoji}</span>
          <h1 className="text-white font-extrabold text-xl text-center px-4 leading-tight">{recipe.name}</h1>
          <div className="flex gap-2 mt-3 flex-wrap justify-center px-4">
            {recipe.tags.slice(0, 4).map(t => (
              <span key={t} className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {[
          [<Clock size={16} />, `${recipe.time}`, 'min', 'text-blue-500 bg-blue-50'],
          [<Euro size={16} />, recipe.cost.toFixed(2), '€', 'text-green-500 bg-green-50'],
          [<ChefHat size={16} />, DIFF_LABEL[recipe.difficulty], '', 'text-orange-500 bg-orange-50'],
          [<span className="text-base">🔥</span>, recipe.nutrition.calories, 'kcal', 'text-red-500 bg-red-50'],
        ].map(([icon, val, unit, colors], i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2.5 text-center">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center mx-auto mb-1 ${colors}`}>{icon}</div>
            <p className="font-black text-gray-900 text-sm">{val}</p>
            {unit && <p className="text-[10px] text-gray-400">{unit}</p>}
          </div>
        ))}
      </div>

      {/* Servings adjuster */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-gray-400" />
          <span className="font-semibold text-gray-900">Portions</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setServings(s => Math.max(1, s - 1))}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <Minus size={14} />
          </button>
          <span className="font-bold text-lg text-gray-900 w-6 text-center">{servings}</span>
          <button onClick={() => setServings(s => Math.min(12, s + 1))}
            className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center hover:bg-primary-200 transition-colors text-primary-600">
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Nutrition bars */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <h2 className="font-bold text-gray-900 mb-3">Nutrition <span className="text-xs font-normal text-gray-400">/ personne</span></h2>
        <div className="space-y-2.5">
          <NutrBar label="Protéines" value={recipe.nutrition.proteins / recipe.servings * servings} max={60} color="bg-blue-400" />
          <NutrBar label="Glucides" value={recipe.nutrition.carbs / recipe.servings * servings} max={130} color="bg-amber-400" />
          <NutrBar label="Lipides" value={recipe.nutrition.fat / recipe.servings * servings} max={70} color="bg-red-400" />
          <NutrBar label="Fibres" value={recipe.nutrition.fiber / recipe.servings * servings} max={30} color="bg-green-400" />
        </div>
      </div>

      {/* Ingredients */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <h2 className="font-bold text-gray-900 mb-3">Ingrédients
          <span className="text-xs font-normal text-gray-400 ml-2">pour {servings} personnes</span>
        </h2>
        <ul className="divide-y divide-gray-50">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex justify-between items-center py-2.5">
              <span className="text-gray-800 text-sm">{ing.name}</span>
              <span className="text-sm font-semibold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-xl">
                {typeof ing.qty === 'number' ? (Math.round(ing.qty * ratio * 10) / 10) : ing.qty} {ing.unit}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Steps with checkboxes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Préparation</h2>
          <span className="text-xs text-gray-400">{completedSteps.size}/{recipe.steps.length} étapes</span>
        </div>
        <div className="space-y-3">
          {recipe.steps.map((step, i) => (
            <button key={i} onClick={() => toggleStep(i)}
              className={clsx(
                'w-full flex gap-3 text-left rounded-2xl p-3 transition-all',
                completedSteps.has(i) ? 'bg-green-50 opacity-60' : 'bg-gray-50 hover:bg-gray-100'
              )}>
              <div className={clsx(
                'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm transition-all',
                completedSteps.has(i) ? 'bg-green-500 text-white' : 'bg-primary-500 text-white'
              )}>
                {completedSteps.has(i) ? '✓' : i + 1}
              </div>
              <p className={clsx('text-sm leading-relaxed pt-0.5', completedSteps.has(i) && 'line-through text-gray-400')}>
                {step}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Cuisine mode button */}
      <button onClick={() => startCooking(recipe.id)}
        className="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-xl hover:from-gray-800 hover:to-gray-600 active:scale-[0.98] transition-all mb-4">
        <Play size={20} className="text-primary-400" />
        Mode cuisine pas-à-pas
      </button>

      {/* Rating */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
        <h2 className="font-semibold text-gray-900 mb-3">Note de la famille</h2>
        <div className="flex justify-center gap-3">
          {[1, 2, 3, 4, 5].map(star => (
            <button key={star} onClick={() => rateRecipe(id, star)} className="active:scale-125 transition-transform">
              <Star size={30} className={star <= (rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-100'} />
            </button>
          ))}
        </div>
        {rating && <p className="text-xs text-gray-400 mt-2">Note : {rating}/5</p>}
      </div>
    </div>
  )
}
