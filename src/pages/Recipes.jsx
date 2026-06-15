import { useState, useMemo } from 'react'
import { RECIPES } from '../data/recipes'
import { useStore } from '../store/useStore'
import { Link } from 'react-router-dom'
import { Search, Grid3X3, List, Heart, Clock, Euro } from 'lucide-react'
import clsx from 'clsx'

const CUISINE_FILTERS = [
  { key: 'all', label: '🍽️ Tout' },
  { key: 'rapide', label: '⚡ Rapides' },
  { key: 'végétarien', label: '🥦 Végé' },
  { key: 'enfants', label: '👶 Kids' },
  { key: 'asiatique', label: '🥢 Asie' },
  { key: 'méditerranéen', label: '🫒 Médit.' },
  { key: 'mexicain', label: '🌮 Mexique' },
  { key: 'américain', label: '🍔 Amérique' },
  { key: 'africain', label: '🌍 Afrique' },
  { key: 'dessert', label: '🍫 Desserts' },
  { key: 'économique', label: '💰 Éco' },
  { key: 'réconfort', label: '🤗 Réconfort' },
]

const DIFF_LABELS = ['', '⭐ Facile', '⭐⭐ Moyen', '⭐⭐⭐ Avancé']
const CUISINE_GRADIENTS = {
  asiatique: 'from-red-50 to-pink-50',
  méditerranéen: 'from-blue-50 to-teal-50',
  mexicain: 'from-yellow-50 to-orange-50',
  américain: 'from-blue-50 to-indigo-50',
  africain: 'from-amber-50 to-orange-50',
  français: 'from-blue-50 to-white',
  végétarien: 'from-green-50 to-emerald-50',
  dessert: 'from-purple-50 to-pink-50',
}

function getGradient(recipe) {
  for (const [key, grad] of Object.entries(CUISINE_GRADIENTS)) {
    if (recipe.tags.includes(key) || recipe.category === key) return grad
  }
  return 'from-orange-50 to-amber-50'
}

function RecipeGridCard({ recipe, isFavorite, onToggleFav }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 group">
      <Link to={`/recipes/${recipe.id}`}>
        <div className={`bg-gradient-to-br ${getGradient(recipe)} flex items-center justify-center py-7 relative`}>
          <span className="text-5xl group-hover:scale-110 transition-transform">{recipe.emoji}</span>
        </div>
        <div className="p-3">
          <p className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 mb-2">{recipe.name}</p>
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span className="flex items-center gap-1"><Clock size={10} />{recipe.time} min</span>
            <span className="flex items-center gap-1"><Euro size={10} />{recipe.cost.toFixed(2)}</span>
          </div>
          {recipe.tags.slice(0, 2).map(t => (
            <span key={t} className="inline-block mt-1.5 mr-1 text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
      </Link>
      <button onClick={() => onToggleFav(recipe.id)}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm"
        style={{ position: 'absolute' }}>
        <Heart size={14} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-300'} />
      </button>
    </div>
  )
}

function RecipeListCard({ recipe, isFavorite, onToggleFav }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex overflow-hidden">
      <Link to={`/recipes/${recipe.id}`} className="flex items-center gap-3 flex-1 p-3 min-w-0">
        <div className={`bg-gradient-to-br ${getGradient(recipe)} w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center`}>
          <span className="text-3xl">{recipe.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{recipe.name}</p>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
            <span>{recipe.time} min</span>
            <span>·</span>
            <span>{recipe.cost.toFixed(2)} €</span>
            <span>·</span>
            <span>{DIFF_LABELS[recipe.difficulty]}</span>
          </div>
          <div className="flex gap-1 mt-1">
            {recipe.tags.slice(0, 2).map(t => (
              <span key={t} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        </div>
      </Link>
      <button onClick={() => onToggleFav(recipe.id)} className="px-3 flex items-center justify-center">
        <Heart size={18} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-200'} />
      </button>
    </div>
  )
}

export default function Recipes() {
  const { favorites, toggleFavorite } = useStore()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [maxTime, setMaxTime] = useState(120)
  const [gridView, setGridView] = useState(true)
  const [showFavOnly, setShowFavOnly] = useState(false)

  const filtered = useMemo(() => {
    return RECIPES.filter(r => {
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.tags.some(t => t.includes(search.toLowerCase()))
      const matchFilter = activeFilter === 'all' ||
        r.tags.includes(activeFilter) || r.category === activeFilter
      const matchTime = r.time <= maxTime
      const matchFav = !showFavOnly || favorites.includes(r.id)
      return matchSearch && matchFilter && matchTime && matchFav
    })
  }, [search, activeFilter, maxTime, showFavOnly, favorites])

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
        <input
          type="text" placeholder="Chercher une recette…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-100 focus:border-primary-300 rounded-2xl text-sm outline-none transition-colors shadow-sm"
        />
      </div>

      {/* Cuisine filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {CUISINE_FILTERS.map(f => (
          <button key={f.key} onClick={() => setActiveFilter(f.key)}
            className={clsx(
              'flex-shrink-0 px-3.5 py-2 rounded-full text-sm font-semibold transition-all',
              activeFilter === f.key
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            )}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 text-xs text-gray-500 bg-white border border-gray-200 rounded-xl px-3 py-2">
          <Clock size={14} className="text-gray-400" />
          <span className="font-medium">Max {maxTime === 120 ? '2h+' : `${maxTime} min`}</span>
          <input type="range" min={15} max={120} step={15} value={maxTime}
            onChange={e => setMaxTime(parseInt(e.target.value))}
            className="flex-1 accent-primary-500" />
        </div>
        <button onClick={() => setShowFavOnly(v => !v)}
          className={clsx('p-2.5 rounded-xl border-2 transition-all', showFavOnly ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white')}>
          <Heart size={18} className={showFavOnly ? 'fill-red-500 text-red-500' : 'text-gray-300'} />
        </button>
        <div className="flex bg-white border border-gray-200 rounded-xl p-0.5">
          <button onClick={() => setGridView(true)}
            className={clsx('p-2 rounded-lg transition-all', gridView ? 'bg-gray-900 text-white' : 'text-gray-400')}>
            <Grid3X3 size={16} />
          </button>
          <button onClick={() => setGridView(false)}
            className={clsx('p-2 rounded-lg transition-all', !gridView ? 'bg-gray-900 text-white' : 'text-gray-400')}>
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-gray-400 font-medium">
        {filtered.length} recette{filtered.length > 1 ? 's' : ''}
        {showFavOnly ? ' ❤️ favorites' : ''}
      </p>

      {/* Grid or list */}
      {filtered.length > 0 ? (
        gridView ? (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(r => (
              <div key={r.id} className="relative">
                <RecipeGridCard recipe={r} isFavorite={favorites.includes(r.id)} onToggleFav={toggleFavorite} />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(r => (
              <RecipeListCard key={r.id} recipe={r} isFavorite={favorites.includes(r.id)} onToggleFav={toggleFavorite} />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">🔍</p>
          <p className="text-gray-500 font-medium">Aucune recette trouvée</p>
          <button onClick={() => { setSearch(''); setActiveFilter('all'); setMaxTime(120); setShowFavOnly(false) }}
            className="mt-3 text-sm text-primary-500 font-semibold">
            Effacer les filtres
          </button>
        </div>
      )}
    </div>
  )
}
