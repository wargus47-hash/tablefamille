import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Plus, Minus, Trash2, ArrowLeft, Check, ChefHat } from 'lucide-react'
import clsx from 'clsx'

const FOOD_EMOJIS = ['🍝','🍛','🍲','🥘','🫕','🍜','🥗','🥙','🌮','🌯','🍕','🥪','🍔','🍗','🥩','🐟','🦐','🥚','🧆','🥞','🫔','🥣','🍱','🍣','🥟','🧇','🫙','🥧','🍲','🫓']

const AISLES = ['Fruits & Légumes', 'Boucherie', 'Poissonnerie', 'Charcuterie', 'Produits frais', 'Épicerie', 'Surgelés', 'Boulangerie']

const UNITS = ['g', 'kg', 'ml', 'cl', 'litre', 'pièce', 'c.à.s', 'c.à.c', 'dose', 'bouquet', 'tranches', 'boîte', 'sachet', 'gousse', 'tiges']

const CATEGORIES = [
  { value: 'plat', label: '🍽️ Plat principal' },
  { value: 'salade', label: '🥗 Salade' },
  { value: 'soupe', label: '🥣 Soupe' },
  { value: 'dessert', label: '🍫 Dessert' },
]

const SEASONS_OPTIONS = [
  { value: 'all', label: '🗓️ Toute l\'année' },
  { value: 'spring', label: '🌸 Printemps' },
  { value: 'summer', label: '☀️ Été' },
  { value: 'fall', label: '🍂 Automne' },
  { value: 'winter', label: '❄️ Hiver' },
]

function Field({ label, children, error }) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, type = 'text', ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border-2 border-gray-100 focus:border-primary-300 rounded-2xl px-4 py-2.5 text-sm outline-none transition-colors"
      {...props}
    />
  )
}

export default function AddRecipe() {
  const navigate = useNavigate()
  const { addCustomRecipe } = useStore()
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)

  // Basic fields
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🍳')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [category, setCategory] = useState('plat')
  const [time, setTime] = useState('30')
  const [difficulty, setDifficulty] = useState(1)
  const [servings, setServings] = useState('4')
  const [cost, setCost] = useState('')
  const [tags, setTags] = useState('')
  const [seasons, setSeasons] = useState(['all'])

  // Ingredients
  const [ingredients, setIngredients] = useState([
    { name: '', qty: '', unit: 'g', aisle: 'Épicerie' },
  ])

  // Steps
  const [steps, setSteps] = useState([''])

  const toggleSeason = (val) => {
    if (val === 'all') {
      setSeasons(['all'])
    } else {
      const without = seasons.filter(s => s !== 'all')
      setSeasons(without.includes(val) ? without.filter(s => s !== val) || ['all'] : [...without, val])
    }
  }

  const addIngredient = () => setIngredients(s => [...s, { name: '', qty: '', unit: 'g', aisle: 'Épicerie' }])
  const removeIngredient = (i) => setIngredients(s => s.filter((_, idx) => idx !== i))
  const updateIngredient = (i, field, value) => setIngredients(s => s.map((ing, idx) => idx === i ? { ...ing, [field]: value } : ing))

  const addStep = () => setSteps(s => [...s, ''])
  const removeStep = (i) => setSteps(s => s.filter((_, idx) => idx !== i))
  const updateStep = (i, value) => setSteps(s => s.map((st, idx) => idx === i ? value : st))

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = 'Donne un nom à la recette'
    if (!cost || isNaN(parseFloat(cost))) e.cost = 'Indique un coût approximatif'
    if (ingredients.some(ing => !ing.name.trim())) e.ingredients = 'Tous les ingrédients doivent avoir un nom'
    if (steps.some(s => !s.trim())) e.steps = 'Toutes les étapes doivent être renseignées'
    if (ingredients.length === 0) e.ingredients = 'Ajoute au moins un ingrédient'
    if (steps.length === 0) e.steps = 'Ajoute au moins une étape'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    const tagList = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)

    const recipe = {
      name: name.trim(),
      emoji,
      category,
      time: parseInt(time) || 30,
      difficulty,
      servings: parseInt(servings) || 4,
      cost: parseFloat(cost) || 0,
      seasons: seasons.length === 0 ? ['all'] : seasons,
      tags: tagList,
      nutrition: { calories: 400, proteins: 20, carbs: 40, fat: 15, fiber: 4 }, // defaults
      ingredients: ingredients
        .filter(ing => ing.name.trim())
        .map(ing => ({
          name: ing.name.trim(),
          qty: isNaN(parseFloat(ing.qty)) ? ing.qty : parseFloat(ing.qty),
          unit: ing.unit,
          aisle: ing.aisle,
        })),
      steps: steps.filter(s => s.trim()),
      isCustom: true,
    }

    addCustomRecipe(recipe)
    setSaved(true)
    setTimeout(() => navigate('/recipes'), 1200)
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-pop">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check size={36} className="text-green-500" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">Recette enregistrée !</h2>
        <p className="text-gray-400 text-sm">Redirection vers vos recettes…</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Ma recette</h1>
          <p className="text-xs text-gray-400">Crée ta propre recette</p>
        </div>
      </div>

      {/* Section: Infos de base */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <ChefHat size={16} className="text-primary-500" /> Informations générales
        </h2>

        {/* Emoji */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Icône</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEmojiPicker(v => !v)}
              className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl border-2 border-orange-100 hover:border-primary-300 transition-colors">
              {emoji}
            </button>
            <p className="text-xs text-gray-400">Tape un emoji ou choisis ci-dessous</p>
            <input
              value={emoji}
              onChange={e => setEmoji(e.target.value)}
              className="w-16 text-center border-2 border-gray-100 focus:border-primary-300 rounded-xl py-2 text-lg outline-none"
              maxLength={2}
            />
          </div>
          {showEmojiPicker && (
            <div className="mt-2 flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-2xl">
              {FOOD_EMOJIS.map(e => (
                <button key={e} onClick={() => { setEmoji(e); setShowEmojiPicker(false) }}
                  className={clsx('w-9 h-9 rounded-xl flex items-center justify-center text-xl transition-all', emoji === e ? 'bg-primary-100' : 'hover:bg-white')}>
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Name */}
        <Field label="Nom de la recette" error={errors.name}>
          <TextInput value={name} onChange={setName} placeholder="Ex: Gratin de courgettes maison" />
        </Field>

        {/* Category */}
        <Field label="Catégorie">
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(c => (
              <button key={c.value} onClick={() => setCategory(c.value)}
                className={clsx(
                  'py-2.5 rounded-2xl text-sm font-semibold border-2 transition-all',
                  category === c.value ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'
                )}>
                {c.label}
              </button>
            ))}
          </div>
        </Field>

        {/* Time + Difficulty + Servings */}
        <div className="grid grid-cols-3 gap-3">
          <Field label="⏱ Durée (min)">
            <TextInput type="number" value={time} onChange={setTime} placeholder="30" />
          </Field>
          <Field label="👥 Portions">
            <TextInput type="number" value={servings} onChange={setServings} placeholder="4" />
          </Field>
          <Field label="💰 Coût (€)" error={errors.cost}>
            <TextInput type="number" value={cost} onChange={setCost} placeholder="6.50" step="0.5" />
          </Field>
        </div>

        {/* Difficulty */}
        <Field label="Difficulté">
          <div className="flex gap-2">
            {[['1', '⭐ Facile'], ['2', '⭐⭐ Moyen'], ['3', '⭐⭐⭐ Avancé']].map(([val, label]) => (
              <button key={val} onClick={() => setDifficulty(parseInt(val))}
                className={clsx(
                  'flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all',
                  difficulty === parseInt(val) ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-gray-100 text-gray-500'
                )}>
                {label}
              </button>
            ))}
          </div>
        </Field>

        {/* Tags */}
        <Field label="Tags (séparés par des virgules)">
          <TextInput value={tags} onChange={setTags} placeholder="français, rapide, enfants, végétarien…" />
          <p className="text-[11px] text-gray-400 mt-1">Ces tags permettent le filtrage dans Recettes et le Frigo Magique</p>
        </Field>

        {/* Seasons */}
        <Field label="Saisons">
          <div className="flex flex-wrap gap-2">
            {SEASONS_OPTIONS.map(s => (
              <button key={s.value} onClick={() => toggleSeason(s.value)}
                className={clsx(
                  'px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all',
                  seasons.includes(s.value) ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-gray-100 text-gray-500'
                )}>
                {s.label}
              </button>
            ))}
          </div>
        </Field>
      </div>

      {/* Section: Ingrédients */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-800">🥕 Ingrédients</h2>
          <span className="text-xs text-gray-400">{ingredients.length} ingrédient{ingredients.length > 1 ? 's' : ''}</span>
        </div>
        {errors.ingredients && <p className="text-xs text-red-400">{errors.ingredients}</p>}

        <div className="space-y-3">
          {ingredients.map((ing, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 w-5 text-center">{i + 1}</span>
                <input
                  value={ing.name}
                  onChange={e => updateIngredient(i, 'name', e.target.value)}
                  placeholder="Nom de l'ingrédient"
                  className="flex-1 border-2 border-gray-100 focus:border-primary-300 rounded-xl px-3 py-2 text-sm outline-none bg-white"
                />
                {ingredients.length > 1 && (
                  <button onClick={() => removeIngredient(i)} className="p-1.5 text-red-300 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="flex gap-2 pl-7">
                <input
                  value={ing.qty}
                  onChange={e => updateIngredient(i, 'qty', e.target.value)}
                  placeholder="Qté"
                  className="w-16 border-2 border-gray-100 focus:border-primary-300 rounded-xl px-2 py-2 text-sm outline-none bg-white text-center"
                />
                <select
                  value={ing.unit}
                  onChange={e => updateIngredient(i, 'unit', e.target.value)}
                  className="w-24 border-2 border-gray-100 focus:border-primary-300 rounded-xl px-2 py-2 text-sm outline-none bg-white">
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <select
                  value={ing.aisle}
                  onChange={e => updateIngredient(i, 'aisle', e.target.value)}
                  className="flex-1 border-2 border-gray-100 focus:border-primary-300 rounded-xl px-2 py-2 text-sm outline-none bg-white">
                  {AISLES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>

        <button onClick={addIngredient}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-semibold text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-colors">
          <Plus size={16} /> Ajouter un ingrédient
        </button>
      </div>

      {/* Section: Étapes */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-800">👨‍🍳 Étapes de préparation</h2>
          <span className="text-xs text-gray-400">{steps.length} étape{steps.length > 1 ? 's' : ''}</span>
        </div>
        {errors.steps && <p className="text-xs text-red-400">{errors.steps}</p>}

        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="w-7 h-7 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-2">
                {i + 1}
              </div>
              <textarea
                value={step}
                onChange={e => updateStep(i, e.target.value)}
                placeholder={`Étape ${i + 1}…`}
                rows={2}
                className="flex-1 border-2 border-gray-100 focus:border-primary-300 rounded-2xl px-3 py-2 text-sm outline-none resize-none transition-colors"
              />
              {steps.length > 1 && (
                <button onClick={() => removeStep(i)} className="p-1.5 text-red-300 hover:text-red-500 transition-colors mt-1.5">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button onClick={addStep}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-semibold text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-colors">
          <Plus size={16} /> Ajouter une étape
        </button>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className="w-full bg-gradient-to-r from-primary-500 to-orange-400 text-white py-4 rounded-2xl font-extrabold text-base shadow-lg shadow-primary-200 hover:shadow-primary-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
        <Check size={20} />
        Enregistrer ma recette
      </button>
    </div>
  )
}
