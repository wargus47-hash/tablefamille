import { useParams, useNavigate } from 'react-router-dom'
import { RECIPE_MAP } from '../data/recipes'
import { useStore } from '../store/useStore'
import { ArrowLeft, Clock, Users, Euro, Star, ChefHat } from 'lucide-react'
import clsx from 'clsx'

const DIFF_LABEL = ['', 'Facile', 'Moyen', 'Avancé']
const DIFF_COLOR = ['', 'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700', 'bg-red-100 text-red-700']

export default function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const recipe = RECIPE_MAP[id]
  const { ratings, rateRecipe, profile } = useStore()
  const rating = ratings[id]

  if (!recipe) {
    return <div className="text-center py-20 text-gray-400">Recette introuvable</div>
  }

  const nbPersons = profile.members.length || 2
  const totalCost = recipe.cost

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white border border-gray-100 shadow-sm">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="font-bold text-gray-900 text-lg leading-tight">{recipe.name}</h1>
      </div>

      {/* Hero emoji */}
      <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-3xl flex items-center justify-center py-10">
        <span className="text-8xl">{recipe.emoji}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
          <Clock size={18} className="mx-auto text-primary-500 mb-1" />
          <p className="font-bold text-gray-900">{recipe.time} min</p>
          <p className="text-xs text-gray-400">Durée</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
          <Euro size={18} className="mx-auto text-green-500 mb-1" />
          <p className="font-bold text-gray-900">{totalCost.toFixed(2)} €</p>
          <p className="text-xs text-gray-400">Budget</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
          <ChefHat size={18} className="mx-auto text-blue-500 mb-1" />
          <span className={clsx('text-xs font-bold px-2 py-0.5 rounded-full', DIFF_COLOR[recipe.difficulty])}>
            {DIFF_LABEL[recipe.difficulty]}
          </span>
          <p className="text-xs text-gray-400 mt-1">Difficulté</p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {recipe.tags.map(tag => (
          <span key={tag} className="text-xs bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full font-medium">
            {tag}
          </span>
        ))}
      </div>

      {/* Nutrition */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Valeurs nutritionnelles <span className="text-xs text-gray-400 font-normal">(par personne)</span></h2>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            ['🔥', recipe.nutrition.calories, 'kcal'],
            ['🥩', recipe.nutrition.proteins, 'g prot.'],
            ['🌾', recipe.nutrition.carbs, 'g glucides'],
            ['🫙', recipe.nutrition.fat, 'g lipides'],
          ].map(([icon, value, label]) => (
            <div key={label}>
              <p className="text-lg">{icon}</p>
              <p className="font-bold text-sm text-gray-900">{Math.round(value / recipe.servings * nbPersons)}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ingredients */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h2 className="font-semibold text-gray-900 mb-3">
          Ingrédients <span className="text-xs text-gray-400 font-normal">({recipe.servings} personnes)</span>
        </h2>
        <ul className="space-y-2">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
              <span className="text-gray-800 text-sm">{ing.name}</span>
              <span className="text-sm text-gray-500 font-medium">{ing.qty} {ing.unit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Steps */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Préparation</h2>
        <ol className="space-y-3">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <p className="text-sm text-gray-700 leading-relaxed pt-0.5">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Rating */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
        <h2 className="font-semibold text-gray-900 mb-3">Note de la famille</h2>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button key={star} onClick={() => rateRecipe(id, star)}>
              <Star
                size={28}
                className={star <= (rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-100'}
              />
            </button>
          ))}
        </div>
        {rating && <p className="text-xs text-gray-400 mt-2">Note : {rating}/5</p>}
      </div>
    </div>
  )
}
