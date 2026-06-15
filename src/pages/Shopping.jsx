import { useStore } from '../store/useStore'
import { ShoppingCart, CheckCircle2, Circle, RefreshCw } from 'lucide-react'
import clsx from 'clsx'

const AISLE_ICONS = {
  'Fruits & Légumes': '🥦',
  'Boucherie': '🥩',
  'Poissonnerie': '🐟',
  'Charcuterie': '🥓',
  'Produits frais': '🧀',
  'Épicerie': '🥫',
  'Surgelés': '❄️',
  'Boulangerie': '🥖',
}

export default function Shopping() {
  const { shoppingList, toggleShoppingItem, weekPlan, generatePlan } = useStore()

  const allItems = Object.values(shoppingList).flat()
  const checkedCount = allItems.filter(i => i.checked).length
  const totalCount = allItems.length

  if (!weekPlan || totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <ShoppingCart size={48} className="text-gray-200 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Liste vide</h1>
        <p className="text-gray-500 text-sm mb-6">
          Génère un planning pour créer ta liste de courses automatiquement.
        </p>
        <button
          onClick={generatePlan}
          className="bg-primary-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors"
        >
          ✨ Générer le planning
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Liste de courses</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {checkedCount}/{totalCount} articles cochés
          </p>
        </div>
        <button
          onClick={generatePlan}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
          title="Regénérer la liste"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${(checkedCount / totalCount) * 100}%` }}
          />
        </div>
      )}

      {checkedCount === totalCount && totalCount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-green-700 font-semibold">🎉 Liste complète ! Bonne cuisine !</p>
        </div>
      )}

      {/* By aisle */}
      <div className="space-y-4">
        {Object.entries(shoppingList).map(([aisle, items]) => {
          const remaining = items.filter(i => !i.checked).length
          return (
            <div key={aisle} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{AISLE_ICONS[aisle] || '🛒'}</span>
                  <span className="font-semibold text-gray-800 text-sm">{aisle}</span>
                </div>
                <span className="text-xs text-gray-400">{remaining} restant{remaining > 1 ? 's' : ''}</span>
              </div>
              <ul className="divide-y divide-gray-50">
                {items.map(item => (
                  <li key={item.name}>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                      onClick={() => toggleShoppingItem(aisle, item.name)}
                    >
                      {item.checked
                        ? <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
                        : <Circle size={20} className="text-gray-300 flex-shrink-0" />
                      }
                      <span className={clsx('flex-1 text-sm', item.checked ? 'line-through text-gray-400' : 'text-gray-800')}>
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-400">
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
