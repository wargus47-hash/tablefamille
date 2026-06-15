import { Clock, Users, Euro } from 'lucide-react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

const DIFF_LABEL = ['', 'Facile', 'Moyen', 'Avancé']
const DIFF_COLOR = ['', 'text-green-600', 'text-orange-500', 'text-red-500']

export default function RecipeCard({ recipe, compact = false, onClick }) {
  const content = (
    <div className={clsx(
      'bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer',
      compact ? 'p-3' : 'p-4'
    )}>
      <div className="flex items-start gap-3">
        <span className={clsx('flex-shrink-0', compact ? 'text-3xl' : 'text-4xl')}>{recipe.emoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className={clsx('font-semibold text-gray-900 truncate', compact ? 'text-sm' : 'text-base')}>
            {recipe.name}
          </h3>
          {!compact && (
            <div className="flex flex-wrap gap-1 mt-1">
              {recipe.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className={clsx('flex items-center gap-3 text-gray-500', compact ? 'mt-1 text-xs' : 'mt-2 text-xs')}>
            <span className="flex items-center gap-1"><Clock size={11} />{recipe.time} min</span>
            <span className="flex items-center gap-1"><Users size={11} />{recipe.servings} pers.</span>
            <span className="flex items-center gap-1"><Euro size={11} />{recipe.cost.toFixed(2)}</span>
            {!compact && (
              <span className={clsx('font-medium', DIFF_COLOR[recipe.difficulty])}>
                {DIFF_LABEL[recipe.difficulty]}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  if (onClick) {
    return <div onClick={onClick}>{content}</div>
  }

  return <Link to={`/recipes/${recipe.id}`}>{content}</Link>
}
