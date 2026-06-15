import { useState } from 'react'
import { useStore } from '../store/useStore'
import { ChevronRight, Check } from 'lucide-react'

const AVATARS = ['🧑', '👩', '👨', '🧒', '👦', '👧', '👴', '👵', '🧔', '👱']
const BUDGETS = [
  { label: 'Serré', value: 50, desc: '~7€/jour' },
  { label: 'Raisonnable', value: 80, desc: '~11€/jour' },
  { label: 'Confortable', value: 120, desc: '~17€/jour' },
  { label: 'Sans limite', value: 200, desc: '~28€/jour' },
]
const TAGS = ['végétarien', 'sans gluten', 'poisson', 'épicé', 'rapide', 'économique']

export default function Onboarding() {
  const { setOnboardingDone, updateProfile, addMember } = useStore()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('🧑')
  const [members, setMembers] = useState([])
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberAge, setNewMemberAge] = useState('')
  const [newMemberAvatar, setNewMemberAvatar] = useState('🧒')
  const [budget, setBudget] = useState(80)
  const [prefs, setPrefs] = useState([])

  const STEPS = [
    {
      title: 'Bienvenue ! 👋',
      subtitle: 'Dis-moi qui tu es pour personnaliser ton expérience.',
      content: (
        <div className="space-y-4 animate-slide-up">
          <div className="flex justify-center gap-2 flex-wrap">
            {AVATARS.map(a => (
              <button key={a} onClick={() => setAvatar(a)}
                className={`text-3xl p-2 rounded-2xl transition-all ${avatar === a ? 'bg-primary-100 scale-125 ring-2 ring-primary-400' : 'hover:bg-gray-100'}`}>
                {a}
              </button>
            ))}
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Ton prénom</label>
            <input
              type="text" placeholder="Alexandre…" value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border-2 border-gray-200 focus:border-primary-400 rounded-2xl px-4 py-3 text-lg font-medium outline-none transition-colors"
              autoFocus
            />
          </div>
        </div>
      ),
      canNext: name.trim().length > 0,
    },
    {
      title: 'Ta famille 👨‍👩‍👧',
      subtitle: 'Ajoute les personnes avec qui tu cuisines. (optionnel)',
      content: (
        <div className="space-y-3 animate-slide-up">
          {members.map((m, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
              <span className="text-2xl">{m.avatar}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{m.name}</p>
                <p className="text-xs text-gray-400">{m.age ? `${m.age} ans` : 'Adulte'}</p>
              </div>
              <button onClick={() => setMembers(ms => ms.filter((_, j) => j !== i))}
                className="text-red-300 hover:text-red-500 text-lg">✕</button>
            </div>
          ))}
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-4 space-y-3">
            <div className="flex gap-1 flex-wrap">
              {AVATARS.slice(0, 5).map(a => (
                <button key={a} onClick={() => setNewMemberAvatar(a)}
                  className={`text-2xl p-1 rounded-xl transition-all ${newMemberAvatar === a ? 'bg-primary-100 scale-110' : ''}`}>{a}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Prénom" value={newMemberName}
                onChange={e => setNewMemberName(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400" />
              <input type="number" placeholder="Âge" value={newMemberAge}
                onChange={e => setNewMemberAge(e.target.value)}
                className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400" />
            </div>
            <button
              onClick={() => {
                if (!newMemberName.trim()) return
                setMembers(ms => [...ms, { name: newMemberName, age: parseInt(newMemberAge) || 0, avatar: newMemberAvatar }])
                setNewMemberName(''); setNewMemberAge(''); setNewMemberAvatar('🧒')
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl text-sm font-medium transition-colors"
            >+ Ajouter</button>
          </div>
        </div>
      ),
      canNext: true,
    },
    {
      title: 'Budget & goûts 💰',
      subtitle: 'Adapte les suggestions à ta réalité.',
      content: (
        <div className="space-y-5 animate-slide-up">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Budget alimentaire / semaine</p>
            <div className="grid grid-cols-2 gap-2">
              {BUDGETS.map(b => (
                <button key={b.value} onClick={() => setBudget(b.value)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all ${budget === b.value ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <p className="font-bold text-gray-900">{b.label}</p>
                  <p className="text-xs text-gray-500">{b.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Préférences alimentaires</p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(t => (
                <button key={t} onClick={() => setPrefs(ps => ps.includes(t) ? ps.filter(p => p !== t) : [...ps, t])}
                  className={`px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all ${prefs.includes(t) ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
      canNext: true,
    },
  ]

  const current = STEPS[step]

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      // Enregistrer tout
      const mainMember = { id: 'm1', name: name || 'Moi', age: 35, avatar, likes: prefs, dislikes: [], allergies: [], isPresent: true }
      const allMembers = [mainMember, ...members.map((m, i) => ({ ...m, id: `m${i + 2}`, likes: [], dislikes: [], allergies: [], isPresent: true }))]
      updateProfile({ members: allMembers, weekBudget: budget })
      setOnboardingDone()
    }
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-50 z-50 flex flex-col">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-12 pb-6">
        {STEPS.map((_, i) => (
          <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary-500' : i < step ? 'w-2 bg-primary-300' : 'w-2 bg-gray-200'}`} />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 max-w-md mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">{current.title}</h1>
          <p className="text-gray-500 text-sm">{current.subtitle}</p>
        </div>
        {current.content}
      </div>

      {/* CTA */}
      <div className="px-6 pb-12 max-w-md mx-auto w-full">
        <button
          onClick={handleNext}
          disabled={!current.canNext}
          className="w-full bg-primary-500 disabled:opacity-40 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:bg-primary-600 active:scale-95 transition-all shadow-lg shadow-primary-200"
        >
          {step === STEPS.length - 1 ? (
            <><Check size={20} /> C'est parti !</>
          ) : (
            <>Suivant <ChevronRight size={20} /></>
          )}
        </button>
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="w-full text-gray-400 text-sm mt-3 py-2">
            ← Retour
          </button>
        )}
      </div>
    </div>
  )
}
