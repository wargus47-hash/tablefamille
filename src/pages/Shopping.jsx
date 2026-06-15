import { useStore } from '../store/useStore'
import { ShoppingCart, CheckCircle2, Circle, RefreshCw, Share2, Trash2 } from 'lucide-react'
import clsx from 'clsx'

const AISLE_ICONS = {
  'Fruits & Légumes': '🥦', 'Boucherie': '🥩', 'Poissonnerie': '🐟',
  'Charcuterie': '🥓', 'Produits frais': '🧀', 'Épicerie': '🥫',
  'Surgelés': '❄️', 'Boulangerie': '🥖',
}

const AISLE_ORDER = ['Fruits & Légumes', 'Boucherie', 'Poissonnerie', 'Charcuterie',
  'Produits frais', 'Boulangerie', 'Épicerie', 'Surgelés']

export default function Shopping() {
  const { shoppingList, toggleShoppingItem, weekPlan, generatePlan } = useStore()

  const allItems = Object.values(shoppingList).flat()
  const checkedCount = allItems.filter(i => i.checked).length
  const totalCount = allItems.length
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0

  const sortedAisles = Object.keys(shoppingList).sort((a, b) => {
    const ai = AISLE_ORDER.indexOf(a)
    const bi = AISLE_ORDER.indexOf(b)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  const shareList = async () => {
    const lines = sortedAisles.flatMap(aisle => [
      `\n📦 ${aisle}`,
      ...shoppingList[aisle].map(i => `${i.checked ? '✅' : '☐'} ${i.name} — ${typeof i.qty === 'number' ? Math.round(i.qty) : i.qty} ${i.unit}`)
    ])
    const text = `🛒 Liste de courses TableFamille\n${lines.join('\n')}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Ma liste de courses', text })
      } else {
        await navigator.clipboard.writeText(text)
        alert('Liste copiée dans le presse-papiers !')
      }
    } catch { /* user cancelled */ }
  }

  if (!weekPlan || totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
        <ShoppingCart size={56} className="text-gray-200 mb-4" />
        <h1 className="text-xl font-extrabold text-gray-900 mb-2">Liste vide</h1>
        <p className="text-gray-400 text-sm mb-8">
          Génère un planning pour créer ta liste automatiquement, rangée par rayon.
        </p>
        <button onClick={generatePlan}
          className="bg-gradient-to-r from-primary-500 to-orange-400 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary-200 active:scale-95 transition-all">
          ✨ Générer le planning
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Courses</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            <span className="font-semibold text-gray-700">{checkedCount}</span>/{totalCount} articles
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={shareList} className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors">
            <Share2 size={16} />
          </button>
          <button onClick={generatePlan} className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Progression</span>
          <span className="text-sm font-bold text-primary-600">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-400 to-green-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>
        {checkedCount === totalCount && totalCount > 0 && (
          <p className="text-green-600 font-bold text-sm mt-2 text-center animate-pop">🎉 Liste complète ! Bonne cuisine !</p>
        )}
      </div>

      {/* Aisles */}
      <div className="space-y-3">
        {sortedAisles.map(aisle => {
          const items = shoppingList[aisle]
          const remaining = items.filter(i => !i.checked).length
          const allDone = remaining === 0
          return (
            <div key={aisle} className={clsx(
              'bg-white rounded-2xl border shadow-sm overflow-hidden transition-all',
              allDone ? 'border-green-100 opacity-70' : 'border-gray-100'
            )}>
              <div className={clsx('px-4 py-3 flex items-center justify-between', allDone ? 'bg-green-50' : 'bg-gray-50')}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{AISLE_ICONS[aisle] || '🛒'}</span>
                  <span className="font-bold text-gray-800 text-sm">{aisle}</span>
                </div>
                <div className="flex items-center gap-2">
                  {allDone ? (
                    <span className="text-xs text-green-600 font-bold">✓ Fait</span>
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">{remaining} restant{remaining > 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
              <ul className="divide-y divide-gray-50">
                {items.map(item => (
                  <li key={item.name}>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      onClick={() => toggleShoppingItem(aisle, item.name)}>
                      {item.checked
                        ? <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
                        : <Circle size={20} className="text-gray-200 flex-shrink-0" />
                      }
                      <span className={clsx('flex-1 text-sm font-medium', item.checked ? 'line-through text-gray-300' : 'text-gray-800')}>
                        {item.name}
                      </span>
                      <span className={clsx('text-xs px-2 py-1 rounded-lg', item.checked ? 'text-gray-300' : 'text-gray-500 bg-gray-100')}>
                        {typeof item.qty === 'number' ? `${Math.round(item.qty)} ` : ''}{item.unit}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
