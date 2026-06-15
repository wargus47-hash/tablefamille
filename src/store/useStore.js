import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateWeekPlan, generateShoppingList, estimateBudget } from '../utils/matcher.js'

const DEFAULT_PROFILE = {
  members: [
    { id: 'm1', name: 'Moi', age: 35, avatar: '🧑', likes: [], dislikes: [], allergies: [], isPresent: true },
  ],
  weekBudget: 80,
  calorieGoal: 2000,
}

export const useStore = create(
  persist(
    (set, get) => ({
      // ── Onboarding ───────────────────────────────────────────────────
      onboardingDone: false,
      setOnboardingDone: () => set({ onboardingDone: true }),

      // ── Profile ──────────────────────────────────────────────────────
      profile: DEFAULT_PROFILE,
      updateProfile: (updates) => set(s => ({ profile: { ...s.profile, ...updates } })),
      addMember: (member) => set(s => ({
        profile: { ...s.profile, members: [...s.profile.members, { id: `m${Date.now()}`, ...member }] },
      })),
      updateMember: (id, updates) => set(s => ({
        profile: { ...s.profile, members: s.profile.members.map(m => m.id === id ? { ...m, ...updates } : m) },
      })),
      removeMember: (id) => set(s => ({
        profile: { ...s.profile, members: s.profile.members.filter(m => m.id !== id) },
      })),

      // ── Custom Recipes ────────────────────────────────────────────────
      customRecipes: [],
      addCustomRecipe: (recipe) => set(s => ({
        customRecipes: [...s.customRecipes, { id: `cr${Date.now()}`, ...recipe }],
      })),
      updateCustomRecipe: (id, updates) => set(s => ({
        customRecipes: s.customRecipes.map(r => r.id === id ? { ...r, ...updates } : r),
      })),
      deleteCustomRecipe: (id) => set(s => ({
        customRecipes: s.customRecipes.filter(r => r.id !== id),
        favorites: s.favorites.filter(f => f !== id),
      })),

      // ── Weekly Plan ──────────────────────────────────────────────────
      weekPlan: null,
      estimatedBudget: 0,
      generatePlan: () => {
        const { profile, customRecipes, totalSavedEver } = get()
        const plan = generateWeekPlan(profile, customRecipes)
        const budget = estimateBudget(plan, customRecipes)
        const nbPersons = profile.members.length || 1
        const restaurantCost = 14 * 12 * nbPersons
        const saving = Math.max(0, restaurantCost - budget)
        set({
          weekPlan: plan,
          shoppingList: generateShoppingList(plan, [], customRecipes),
          estimatedBudget: budget,
          totalSavedEver: (totalSavedEver || 0) + saving,
        })
      },
      setMealForDay: (day, meal, recipeId) => set(s => {
        const newPlan = { ...s.weekPlan, [day]: { ...s.weekPlan[day], [meal]: recipeId } }
        return {
          weekPlan: newPlan,
          shoppingList: generateShoppingList(newPlan, [], s.customRecipes),
          estimatedBudget: estimateBudget(newPlan, s.customRecipes),
        }
      }),

      // ── Shopping ─────────────────────────────────────────────────────
      shoppingList: {},
      pantry: [],
      toggleShoppingItem: (aisle, name) => set(s => ({
        shoppingList: {
          ...s.shoppingList,
          [aisle]: s.shoppingList[aisle].map(item =>
            item.name === name ? { ...item, checked: !item.checked } : item
          ),
        },
      })),
      clearShoppingList: () => set({ shoppingList: {} }),
      addToPantry: (name) => set(s => ({ pantry: [...new Set([...s.pantry, name.toLowerCase()])] })),
      removeFromPantry: (name) => set(s => ({ pantry: s.pantry.filter(p => p !== name.toLowerCase()) })),

      // ── Frigo Magique ─────────────────────────────────────────────────
      fridgeItems: [],
      setFridgeItems: (items) => set({ fridgeItems: items }),

      // ── Favorites ────────────────────────────────────────────────────
      favorites: [],
      toggleFavorite: (id) => set(s => ({
        favorites: s.favorites.includes(id) ? s.favorites.filter(f => f !== id) : [...s.favorites, id],
      })),

      // ── Ratings ──────────────────────────────────────────────────────
      ratings: {},
      rateRecipe: (recipeId, rating) => set(s => ({ ratings: { ...s.ratings, [recipeId]: rating } })),

      // ── Cooking Mode ─────────────────────────────────────────────────
      cookingRecipeId: null,
      cookingStep: 0,
      startCooking: (id) => {
        set({ cookingRecipeId: id, cookingStep: 0 })
        set(s => ({ totalMealsPrepared: (s.totalMealsPrepared || 0) + 1 }))
      },
      stopCooking: () => set({ cookingRecipeId: null, cookingStep: 0 }),
      nextStep: () => set(s => ({ cookingStep: s.cookingStep + 1 })),
      prevStep: () => set(s => ({ cookingStep: Math.max(0, s.cookingStep - 1) })),

      // ── History & Streak ─────────────────────────────────────────────
      mealHistory: [],
      streak: 0,
      totalMealsPrepared: 0,
      totalSavedEver: 0,
      addToHistory: (recipeId) => {
        const today = new Date().toDateString()
        set(s => {
          const already = s.mealHistory[0]?.date === today
          return {
            mealHistory: [{ recipeId, date: today }, ...s.mealHistory].slice(0, 100),
            streak: already ? s.streak : s.streak + 1,
          }
        })
      },
    }),
    { name: 'tablefamille-v2', version: 2 }
  )
)
