import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { RECIPE_MAP } from '../data/recipes'
import { X, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, CheckCircle, Timer } from 'lucide-react'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function CookingMode() {
  const { cookingRecipeId, cookingStep, stopCooking, nextStep, prevStep, addToHistory } = useStore()
  const recipe = cookingRecipeId ? RECIPE_MAP[cookingRecipeId] : null
  const [showIngredients, setShowIngredients] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [done, setDone] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [timerRunning])

  useEffect(() => {
    setTimerSeconds(0)
    setTimerRunning(false)
  }, [cookingStep])

  if (!recipe) return null

  const totalSteps = recipe.steps.length
  const isLast = cookingStep >= totalSteps - 1
  const progress = ((cookingStep + 1) / totalSteps) * 100

  const handleNext = () => {
    if (isLast) {
      setDone(true)
      addToHistory(recipe.id)
    } else {
      nextStep()
    }
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-green-400 to-emerald-600 flex flex-col items-center justify-center text-white p-8 animate-fade-in">
        <span className="text-8xl mb-6 animate-pop">{recipe.emoji}</span>
        <h1 className="text-3xl font-extrabold mb-3 text-center">Bravo, c'est prêt !</h1>
        <p className="text-white/80 text-center mb-8 text-lg">{recipe.name}</p>
        <p className="text-white/60 text-sm mb-10">Temps de cuisson : {formatTime(timerSeconds)}</p>
        <button onClick={stopCooking}
          className="bg-white text-green-600 font-bold px-10 py-4 rounded-2xl text-lg shadow-xl active:scale-95 transition-all">
          🎉 Bon appétit !
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button onClick={stopCooking} className="p-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20">
          <X size={20} />
        </button>
        <div className="text-center">
          <p className="text-white font-bold text-sm">{recipe.name}</p>
          <p className="text-white/50 text-xs">Étape {cookingStep + 1} / {totalSteps}</p>
        </div>
        <button onClick={() => setShowIngredients(v => !v)}
          className="p-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 text-xs font-bold">
          🧺
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/10 mx-5 rounded-full overflow-hidden">
        <div className="h-full bg-primary-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="bg-white/5 rounded-3xl p-6 mb-6 animate-slide-up" key={cookingStep}>
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-black text-lg mb-5">
            {cookingStep + 1}
          </div>
          <p className="text-white text-xl leading-relaxed font-medium">
            {recipe.steps[cookingStep]}
          </p>
        </div>

        {/* Next step preview */}
        {!isLast && (
          <div className="bg-white/5 rounded-2xl px-4 py-3 opacity-50">
            <p className="text-white/60 text-xs font-semibold mb-1">ENSUITE →</p>
            <p className="text-white text-sm">{recipe.steps[cookingStep + 1]}</p>
          </div>
        )}
      </div>

      {/* Timer */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2">
          <Timer size={16} className="text-white/60" />
          <span className="text-white font-mono text-lg font-bold">{formatTime(timerSeconds)}</span>
        </div>
        <button onClick={() => setTimerRunning(v => !v)}
          className="p-2.5 bg-white/10 rounded-xl text-white/70 hover:bg-white/20">
          {timerRunning ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button onClick={() => { setTimerSeconds(0); setTimerRunning(false) }}
          className="p-2.5 bg-white/10 rounded-xl text-white/70 hover:bg-white/20">
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 px-5 pb-12">
        <button onClick={prevStep} disabled={cookingStep === 0}
          className="flex-1 py-4 rounded-2xl bg-white/10 text-white font-bold disabled:opacity-20 flex items-center justify-center gap-2 hover:bg-white/20 transition-colors">
          <ChevronLeft size={20} /> Précédent
        </button>
        <button onClick={handleNext}
          className="flex-1 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95
            bg-gradient-to-r from-primary-500 to-orange-500 shadow-lg shadow-primary-900/40 hover:from-primary-400 hover:to-orange-400">
          {isLast ? <><CheckCircle size={20} /> Terminé</> : <>Suivant <ChevronRight size={20} /></>}
        </button>
      </div>

      {/* Ingredients drawer */}
      {showIngredients && (
        <div className="absolute inset-0 bg-gray-950/95 z-10 flex flex-col animate-slide-up" onClick={() => setShowIngredients(false)}>
          <div className="mt-auto bg-gray-900 rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
            <h2 className="text-white font-bold text-lg mb-4">🧺 Ingrédients ({recipe.servings} pers.)</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex justify-between text-sm py-2 border-b border-white/10">
                  <span className="text-white">{ing.name}</span>
                  <span className="text-white/50">{ing.qty} {ing.unit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
