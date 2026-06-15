import { useState, useMemo } from 'react'
import { RECIPES } from '../data/recipes'
import RecipeCard from '../components/RecipeCard'
import { Search } from 'lucide-react'

const FILTERS = [
  { key: 'all', label: '🍽️ Tout' },
  { key: 'rapide', label: '⚡ Rapides' },
  { key: 'végétarien', label: '🥦 Végé' },
  { key: 'enfants', label: '👶 Enfants' },
  { key: 'économique', label: '💰 Éco' },
  { key: 'réconfort', label: '🤗 Réconfort' },
]

export default function Recipes() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const filtered = useMemo(() => {
    return RECIPES.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.tags.some(t => t.includes(search.toLowerCase()))
      const matchesFilter = activeFilter === 'all' || r.tags.includes(activeFilter)
      return matchesSearch && matchesFilter
    })
  }, [search, activeFilter])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Recettes</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Rechercher une recette..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === f.key
                ? 'bg-primary-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-gray-400">{filtered.length} recette{filtered.length > 1 ? 's' : ''}</p>

      {/* List */}
      <div className="space-y-3">
        {filtered.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p>Aucune recette trouvée</p>
          </div>
        )}
      </div>
    </div>
  )
}
