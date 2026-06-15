import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateWeekPlan, generateShoppingList, estimateBudget } from '../utils/matcher.js'

const DEFAULT_MEMBERS = [
  { id: 'm1', name: 'Moi', age: 35, avatar: '🧑', likes: [], dislikes: [], allergies: [], isPresent: true },
]

const DEFAULT_PROFILE = {
  members: DEFAULT_MEMBERS,
  weekBudget: 80,
  childrenPresent: true,
  aiApiKey: '',
}

export const useStore = create(
  persist(
    (set, get) => ({
      // ── Profile ──────────────────────────────────────────────────────
      profile: DEFAULT_PROFILE,

      updateProfile: (updates) =>
        set(s => ({ profile: { ...s.profile, ...updates } })),

      addMember: (member) =>
        set(s => ({
          profile: {
            ...s.profile,
            members: [...s.profile.members, { id: `m${Date.now()}`, ...member }],
          },
        })),

      updateMember: (id, updates) =>
        set(s => ({
          profile: {
            ...s.profile,
            members: s.profile.members.map(m => m.id === id ? { ...m, ...updates } : m),
          },
        })),

      removeMember: (id) =>
        set(s => ({
          profile: {
            ...s.profile,
            members: s.profile.members.filter(m => m.id !== id),
          },
        })),

      // ── Weekly Plan ──────────────────────────────────────────────────
      weekPlan: null,

      generatePlan: () => {
        const plan = generateWeekPlan(get().profile)
        set({ weekPlan: plan, shoppingList: generateShoppingList(plan), estimatedBudget: estimateBudget(plan) })
      },

      setMealForDay: (day, meal, recipeId) =>
        set(s => {
          const newPlan = { ...s.weekPlan, [day]: { ...s.weekPlan[day], [meal]: recipeId } }
          return {
            weekPlan: newPlan,
            shoppingList: generateShoppingList(newPlan),
            estimatedBudget: estimateBudget(newPlan),
          }
        }),

      // ── Shopping ─────────────────────────────────────────────────────
      shoppingList: {},
      estimatedBudget: 0,
      pantry: [],

      toggleShoppingItem: (aisle, name) =>
        set(s => ({
          shoppingList: {
            ...s.shoppingList,
            [aisle]: s.shoppingList[aisle].map(item =>
              item.name === name ? { ...item, checked: !item.checked } : item
            ),
          },
        })),

      addToPantry: (name) =>
        set(s => ({ pantry: [...new Set([...s.pantry, name.toLowerCase()])] })),

      removeFromPantry: (name) =>
        set(s => ({ pantry: s.pantry.filter(p => p !== name.toLowerCase()) })),

      // ── Ratings ──────────────────────────────────────────────────────
      ratings: {},

      rateRecipe: (recipeId, rating) =>
        set(s => ({ ratings: { ...s.ratings, [recipeId]: rating } })),

      // ── History ──────────────────────────────────────────────────────
      mealHistory: [],

      addToHistory: (recipeId, date) =>
        set(s => ({
          mealHistory: [{ recipeId, date: date || new Date().toISOString() }, ...s.mealHistory].slice(0, 100),
        })),
    }),
    {
      name: 'tablefamille-storage',
      version: 1,
    }
  )
)
