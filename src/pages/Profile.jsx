import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Plus, Trash2, Save, Euro } from 'lucide-react'

const AVATARS = ['🧑', '👩', '👨', '🧒', '👦', '👧', '👴', '👵']
const TAG_OPTIONS = ['végétarien', 'vegan', 'poisson', 'enfants', 'épicé', 'réconfort', 'rapide', 'sans gluten']
const ALLERGY_OPTIONS = ['gluten', 'lactose', 'fruits à coque', 'oeufs', 'poisson', 'crustacés', 'soja']

export default function Profile() {
  const { profile, addMember, updateMember, removeMember, updateProfile } = useStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMember, setNewMember] = useState({ name: '', age: '', avatar: '🧒', likes: [], dislikes: [], allergies: [] })
  const [editBudget, setEditBudget] = useState(false)
  const [budgetInput, setBudgetInput] = useState(profile.weekBudget)

  const handleAddMember = () => {
    if (!newMember.name.trim()) return
    addMember({ ...newMember, age: parseInt(newMember.age) || 0, isPresent: true })
    setNewMember({ name: '', age: '', avatar: '🧒', likes: [], dislikes: [], allergies: [] })
    setShowAddForm(false)
  }

  const toggleTag = (field, tag) => {
    setNewMember(m => ({
      ...m,
      [field]: m[field].includes(tag) ? m[field].filter(t => t !== tag) : [...m[field], tag],
    }))
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Ma famille</h1>

      {/* Budget */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Euro size={16} className="text-green-500" />Budget alimentaire</h2>
          {!editBudget ? (
            <button onClick={() => setEditBudget(true)} className="text-xs text-primary-600 font-medium">Modifier</button>
          ) : (
            <button onClick={() => { updateProfile({ weekBudget: parseFloat(budgetInput) || 80 }); setEditBudget(false) }} className="text-xs text-green-600 font-medium flex items-center gap-1"><Save size={12} />Enregistrer</button>
          )}
        </div>
        {editBudget ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={budgetInput}
              onChange={e => setBudgetInput(e.target.value)}
              className="w-28 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
            <span className="text-sm text-gray-500">€ / semaine</span>
          </div>
        ) : (
          <p className="text-3xl font-bold text-gray-900">{profile.weekBudget} €<span className="text-sm font-normal text-gray-400 ml-1">/ semaine</span></p>
        )}
      </div>

      {/* Members */}
      <div className="space-y-3">
        {profile.members.map(member => (
          <div key={member.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{member.avatar}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{member.name}</p>
                <p className="text-xs text-gray-400">{member.age ? `${member.age} ans` : 'Adulte'}</p>
              </div>
              <button
                onClick={() => removeMember(member.id)}
                className="p-2 text-gray-300 hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
            {member.likes.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {member.likes.map(t => (
                  <span key={t} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">❤️ {t}</span>
                ))}
              </div>
            )}
            {member.dislikes.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {member.dislikes.map(t => (
                  <span key={t} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">✕ {t}</span>
                ))}
              </div>
            )}
            {member.allergies.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {member.allergies.map(t => (
                  <span key={t} className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">⚠️ {t}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add member */}
      {showAddForm ? (
        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-4 space-y-4">
          <h2 className="font-semibold text-gray-900">Ajouter un membre</h2>

          {/* Avatar */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Avatar</p>
            <div className="flex gap-2 flex-wrap">
              {AVATARS.map(a => (
                <button
                  key={a}
                  onClick={() => setNewMember(m => ({ ...m, avatar: a }))}
                  className={`text-2xl p-1 rounded-lg border-2 transition-colors ${newMember.avatar === a ? 'border-primary-400 bg-primary-50' : 'border-transparent'}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Prénom</label>
              <input
                type="text"
                placeholder="Emma"
                value={newMember.name}
                onChange={e => setNewMember(m => ({ ...m, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Âge</label>
              <input
                type="number"
                placeholder="8"
                value={newMember.age}
                onChange={e => setNewMember(m => ({ ...m, age: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
          </div>

          {/* Likes */}
          <div>
            <p className="text-xs text-gray-500 mb-2">❤️ Aime bien</p>
            <div className="flex flex-wrap gap-1.5">
              {TAG_OPTIONS.map(t => (
                <button
                  key={t}
                  onClick={() => toggleTag('likes', t)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    newMember.likes.includes(t) ? 'bg-green-100 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Dislikes */}
          <div>
            <p className="text-xs text-gray-500 mb-2">✕ N'aime pas</p>
            <div className="flex flex-wrap gap-1.5">
              {TAG_OPTIONS.map(t => (
                <button
                  key={t}
                  onClick={() => toggleTag('dislikes', t)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    newMember.dislikes.includes(t) ? 'bg-red-100 border-red-300 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <p className="text-xs text-gray-500 mb-2">⚠️ Allergies / intolérances</p>
            <div className="flex flex-wrap gap-1.5">
              {ALLERGY_OPTIONS.map(t => (
                <button
                  key={t}
                  onClick={() => toggleTag('allergies', t)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    newMember.allergies.includes(t) ? 'bg-orange-100 border-orange-300 text-orange-600' : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleAddMember}
              disabled={!newMember.name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold disabled:opacity-40 hover:bg-primary-600 transition-colors"
            >
              Ajouter
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-colors"
        >
          <Plus size={18} />
          <span className="text-sm font-medium">Ajouter un membre</span>
        </button>
      )}
    </div>
  )
}
