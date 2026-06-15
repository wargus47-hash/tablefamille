import { getCurrentSeason } from '../data/seasonal.js'
import { RECIPES, RECIPE_MAP } from '../data/recipes.js'

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

function scoreRecipe(recipe, { members, weekBudget, maxTime, history = [] }) {
  let score = 100 + Math.random() * 40

  const season = getCurrentSeason()
  if (recipe.seasons.includes('all') || recipe.seasons.includes(season)) score += 20

  const nbPersons = members.length || 2
  const costPerPerson = recipe.cost / recipe.servings * nbPersons
  const dailyBudget = weekBudget / 7
  if (costPerPerson > dailyBudget * 0.7) score -= 30
  else if (costPerPerson < dailyBudget * 0.4) score += 15

  if (recipe.time <= 20) score += 10
  if (maxTime && recipe.time > maxTime) score -= 50

  for (const member of members) {
    const liked = member.likes || []
    const disliked = member.dislikes || []
    const allergies = member.allergies || []

    for (const tag of liked) {
      if (recipe.tags.includes(tag)) score += 15
    }
    for (const tag of disliked) {
      if (recipe.tags.includes(tag)) score -= 40
    }
    for (const allergy of allergies) {
      if (recipe.tags.includes(allergy) || recipe.name.toLowerCase().includes(allergy.toLowerCase())) {
        score -= 200
      }
    }
    if (member.age && member.age < 12 && recipe.tags.includes('enfants')) score += 20
  }

  if (history.includes(recipe.id)) score -= 80

  return Math.max(0, score)
}

export function generateWeekPlan(profile, customRecipes = []) {
  const allRecipes = [...RECIPES, ...customRecipes]
  const MEAL_CATEGORIES = ['plat', 'salade', 'soupe']
  const isMeal = r => MEAL_CATEGORIES.includes(r.category)
  const mealPool = allRecipes.filter(isMeal)

  const usedIds = new Set()
  const plan = {}

  for (const day of DAYS) {
    const history = [...usedIds]

    const lunchCandidates = mealPool
      .map(r => ({ recipe: r, score: scoreRecipe(r, { ...profile, history }) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)

    const lunch = lunchCandidates[0]?.recipe || mealPool[Math.floor(Math.random() * mealPool.length)]
    usedIds.add(lunch.id)

    const isWeekend = day === 'Samedi' || day === 'Dimanche'
    const dinnerConstraints = { ...profile, history: [...usedIds], maxTime: isWeekend ? 999 : 30 }

    const dinnerCandidates = mealPool
      .map(r => ({ recipe: r, score: scoreRecipe(r, dinnerConstraints) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)

    const dinner = dinnerCandidates[0]?.recipe || mealPool[Math.floor(Math.random() * mealPool.length)]
    usedIds.add(dinner.id)

    plan[day] = { lunch: lunch.id, dinner: dinner.id }
  }

  return plan
}

export function generateShoppingList(plan, pantry = [], customRecipes = []) {
  const customMap = Object.fromEntries(customRecipes.map(r => [r.id, r]))
  const allMap = { ...RECIPE_MAP, ...customMap }
  const ingredientMap = {}

  for (const { lunch, dinner } of Object.values(plan)) {
    for (const recipeId of [lunch, dinner]) {
      if (!recipeId) continue
      const recipe = allMap[recipeId]
      if (!recipe) continue

      for (const ing of recipe.ingredients) {
        const key = ing.name.toLowerCase()
        if (pantry.some(p => p.toLowerCase() === key)) continue

        if (ingredientMap[key]) {
          ingredientMap[key].qty += ing.qty
        } else {
          ingredientMap[key] = { ...ing, name: ing.name }
        }
      }
    }
  }

  const byAisle = {}
  for (const item of Object.values(ingredientMap)) {
    if (!byAisle[item.aisle]) byAisle[item.aisle] = []
    byAisle[item.aisle].push({ ...item, checked: false })
  }

  return byAisle
}

export function estimateBudget(plan, customRecipes = []) {
  const customMap = Object.fromEntries(customRecipes.map(r => [r.id, r]))
  const allMap = { ...RECIPE_MAP, ...customMap }
  let total = 0
  for (const { lunch, dinner } of Object.values(plan)) {
    for (const recipeId of [lunch, dinner]) {
      const recipe = allMap[recipeId]
      if (recipe) total += recipe.cost
    }
  }
  return Math.round(total * 10) / 10
}

export { DAYS }
