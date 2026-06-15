import { useState, useMemo } from 'react'
import { RECIPES } from '../data/recipes'
import { useStore } from '../store/useStore'
import { Link } from 'react-router-dom'
import { Search, X, ChevronRight, Zap, Refrigerator } from 'lucide-react'

const ALL_INGREDIENTS = [...new Set(
  RECIPES.flatMap(r => r.ingredients.map(i => i.name))
)].sort((a, b) => a.localeCompare(b, 'fr'))

const QUICK_INGS = [
  'Oeufs', 'Lait', 'Beurre', 'Farine', 'Pâtes', 'Riz', 'Pommes de terre',
  'Oignon', 'Ail', 'Tomates', 'Poulet', 'Fromage', 'Crème fraîche', 'Carottes',
]

function matchRecipe(recipe, selected) {
  if (!selected.length) return null
  const sel = selected.map(s => s.toLowerCase())
  const recipeIngs = recipe.ingredients.map(i => i.name.toLowerCase())
  const matched = recipeIngs.filter(ri => sel.some(s => ri.includes(s) || s.includes(ri.split(' ')[0])))
  const missing = recipe.ingredients
    .filter(i => !sel.some(s => i.name.toLowerCase().includes(s) || s.includes(i.name.toLowerCase().split(' ')[0])))
    .map(i => i.name)
  const pct = matched.length / recipeIngs.length
  return { matched: matched.length, total: recipeIngs.length, missing, pct }
}

function RecipeRow({ recipe, pct, missing }) {
  return (
    <Link to={`/recipes/${recipe.id}`}
      className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 px-4 py-3 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
      <span className="text-3xl flex-shrink-0">{recipe.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm truncate">{recipe.name}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                pct >= 0.9 ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                : pct >= 0.6 ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                : 'bg-gradient-to-r from-orange-300 to-red-400'
              }`}
              style={{ width: `${Math.round(pct * 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-gray-400 w-7 text-right">{Math.round(pct * 100)}%</span>
        </div>
        {missing.length > 0 && (
          <p className="text-[10px] text-gray-400 mt-0.5 truncate">
            Manque : {missing.slice(0, 3).join(', ')}{missing.length > 3 ? ` +${missing.length - 3}` : ''}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-[10px] text-gray-400">{recipe.time} min</span>
        <ChevronRight size={14} className="text-gray-300" />
      </div>
    </Link>
  )
}

function Section({ title, color, items, max = 6 }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? items : items.slice(0, max)
  if (!items.length) return null
  return (
    <div className="animate-slide-up">
      <div className={`flex items-center gap-2 mb-2 px-1`}>
        <span className="text-sm font-bold text-gray-800">{title}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{items.length}</span>
      </div>
      <div className="space-y-2">
        {visible.map(({ recipe, pct, missing }) => (
          <RecipeRow key={recipe.id} recipe={recipe} pct={pct} missing={missing} />
        ))}
      </div>
      {items.length > max && !showAll && (
        <button onClick={() => setShowAll(true)}
          className="w-full mt-2 py-2 text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors">
          Voir les {items.length - max} autres →
        </button>
      )}
    </div>
  )
}

export default function FrigoMagique() {
  const { fridgeItems, setFridgeItems } = useStore()
  const [search, setSearch] = useState('')

  const suggestions = useMemo(() => {
    if (search.length < 2) return []
    const q = search.toLowerCase()
    return ALL_INGREDIENTS.filter(i => i.toLowerCase().includes(q) && !fridgeItems.includes(i)).slice(0, 8)
  }, [search, fridgeItems])

  const addIng = (ing) => { setFridgeItems([...fridgeItems, ing]); setSearch('') }
  const removeIng = (ing) => setFridgeItems(fridgeItems.filter(i => i !== ing))
  const clearAll = () => { setFridgeItems([]); setSearch('') }

  const { perfect, good, close } = useMemo(() => {
    if (!fridgeItems.length) return { perfect: [], good: [], close: [] }
    const scored = RECIPES
      .map(r => ({ recipe: r, ...matchRecipe(r, fridgeItems) }))
      .sort((a, b) => b.pct - a.pct)
    return {
      perfect: scored.filter(x => x.pct >= 0.85),
      good: scored.filter(x => x.pct >= 0.55 && x.pct < 0.85),
      close: scored.filter(x => x.missing.length <= 2 && x.pct < 0.55).slice(0, 5),
    }
  }, [fridgeItems])

  const totalResults = perfect.length + good.length + close.length

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Frigo Magique</h1>
          <p className="text-gray-400 text-sm mt-0.5">Que puis-je cuisiner avec ce que j'ai ?</p>
        </div>
        <Refrigerator size={28} className="text-primary-400" />
      </div>

      {/* Search card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            placeholder="Tapez un ingrédient..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && suggestions[0]) addIng(suggestions[0]) }}
            className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-100 focus:border-primary-300 rounded-2xl text-sm outline-none transition-colors"
          />
        </div>

        {/* Autocomplete dropdown */}
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map(ing => (
              <button key={ing} onClick={() => addIng(ing)}
                className="text-xs bg-primary-50 text-primary-700 border border-primary-200 px-3 py-1.5 rounded-full font-semibold hover:bg-primary-100 transition-colors">
                + {ing}
              </button>
            ))}
          </div>
        )}

        {/* Selected chips */}
        {fridgeItems.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                {fridgeItems.length} ingrédient{fridgeItems.length > 1 ? 's' : ''} sélectionné{fridgeItems.length > 1 ? 's' : ''}
              </p>
              <button onClick={clearAll} className="text-[11px] text-red-400 font-semibold hover:text-red-500">
                Tout effacer
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {fridgeItems.map(ing => (
                <button key={ing} onClick={() => removeIng(ing)}
                  className="flex items-center gap-1 text-xs bg-gray-900 text-white px-3 py-1.5 rounded-full font-medium active:scale-95 transition-transform">
                  {ing}
                  <X size={10} className="ml-0.5 opacity-70" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick picks when empty */}
      {fridgeItems.length === 0 && !search && (
        <div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-2 px-1">Ingrédients courants</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_INGS.map(ing => (
              <button key={ing} onClick={() => addIng(ing)}
                className="text-xs bg-white border-2 border-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium hover:border-primary-300 hover:text-primary-600 transition-colors">
                {ing}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results summary */}
      {fridgeItems.length > 0 && totalResults > 0 && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
          <Zap size={16} className="text-green-500 flex-shrink-0" />
          <p className="text-sm font-semibold text-green-700">
            <span className="font-black">{totalResults}</span> recette{totalResults > 1 ? 's' : ''} possible{totalResults > 1 ? 's' : ''} avec tes ingrédients
          </p>
        </div>
      )}

      {/* No results */}
      {fridgeItems.length > 0 && totalResults === 0 && (
        <div className="text-center py-12">
          <p className="text-5xl mb-3">🤔</p>
          <p className="font-bold text-gray-700 text-lg">Hmm, pas encore assez...</p>
          <p className="text-gray-400 text-sm mt-1">Ajoute d'autres ingrédients pour trouver des recettes</p>
        </div>
      )}

      {/* Recipe sections */}
      {fridgeItems.length > 0 && (
        <div className="space-y-6">
          <Section
            title="✅ Je peux cuisiner ça maintenant"
            color="bg-green-100 text-green-700"
            items={perfect}
          />
          <Section
            title="🟡 Presque tout — quelques ajouts"
            color="bg-yellow-100 text-yellow-700"
            items={good}
          />
          <Section
            title="🛒 À 1-2 ingrédients près"
            color="bg-orange-100 text-orange-700"
            items={close}
          />
        </div>
      )}
    </div>
  )
}
