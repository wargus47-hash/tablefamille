import { getCurrentSeason } from '../data/seasonal.js'
import { RECIPES } from '../data/recipes.js'

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

// Score une recette selon le profil famille et les contraintes
function scoreRecipe(recipe, { members, weekBudget, maxTime, history = [] }) {
  // Bruit aléatoire pour que chaque génération donne un résultat différent
  let score = 100 + Math.random() * 40

  // Filtre saison (bonus si en saison)
  const season = getCurrentSeason()
  if (recipe.seasons.includes('all') || recipe.seasons.includes(season)) score += 20

  // Filtre budget (coût/personne acceptable)
  const nbPersons = members.length || 2
  const costPerPerson = recipe.cost / recipe.servings * nbPersons
  const dailyBudget = weekBudget / 7
  if (costPerPerson > dailyBudget * 0.7) score -= 30
  else if (costPerPerson < dailyBudget * 0.4) score += 15

  // Filtre temps
  if (recipe.time <= 20) score += 10
  if (maxTime && recipe.time > maxTime) score -= 50

  // Préférences membres
  for (const member of members) {
    const liked = member.likes || []
    const disliked = member.dislikes || []
    const allergies = member.allergies || []

    // Tags aimés
    for (const tag of liked) {
      if (recipe.tags.includes(tag)) score += 15
    }
    // Tags détestés
    for (const tag of disliked) {
      if (recipe.tags.includes(tag)) score -= 40
    }
    // Allergies = éliminatoire (simplifié sur tags)
    for (const allergy of allergies) {
      if (recipe.tags.includes(allergy) || recipe.name.toLowerCase().includes(allergy.toLowerCase())) {
        score -= 200
      }
    }
    // Bonus enfants
    if (member.age && member.age < 12 && recipe.tags.includes('enfants')) score += 20
  }

  // Pénalité répétition (si déjà mangé cette semaine)
  if (history.includes(recipe.id)) score -= 80

  return Math.max(0, score)
}

// Génère un planning complet de 7 jours
export function generateWeekPlan(profile) {
  const usedIds = new Set()
  const plan = {}

  for (const day of DAYS) {
    const history = [...usedIds]

    const MEAL_CATEGORIES = ['plat', 'salade', 'soupe']
    const isMeal = r => MEAL_CATEGORIES.includes(r.category)

    // Déjeuner
    const lunchCandidates = RECIPES
      .filter(isMeal)
      .map(r => ({ recipe: r, score: scoreRecipe(r, { ...profile, history }) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)

    const lunch = lunchCandidates[0]?.recipe || RECIPES.filter(isMeal)[Math.floor(Math.random() * RECIPES.filter(isMeal).length)]
    usedIds.add(lunch.id)

    // Dîner (max 30 min les soirs de semaine, sauf weekend)
    const isWeekend = day === 'Samedi' || day === 'Dimanche'
    const dinnerConstraints = { ...profile, history: [...usedIds], maxTime: isWeekend ? 999 : 30 }

    const dinnerCandidates = RECIPES
      .filter(isMeal)
      .map(r => ({ recipe: r, score: scoreRecipe(r, dinnerConstraints) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)

    const mealPool = RECIPES.filter(isMeal)
    const dinner = dinnerCandidates[0]?.recipe || mealPool[Math.floor(Math.random() * mealPool.length)]
    usedIds.add(dinner.id)

    plan[day] = { lunch: lunch.id, dinner: dinner.id }
  }

  return plan
}

// Génère la liste de courses depuis un planning
export function generateShoppingList(plan, pantry = []) {
  const ingredientMap = {}

  for (const { lunch, dinner } of Object.values(plan)) {
    for (const recipeId of [lunch, dinner]) {
      if (!recipeId) continue
      const recipe = RECIPES.find(r => r.id === recipeId)
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

  // Grouper par rayon
  const byAisle = {}
  for (const item of Object.values(ingredientMap)) {
    if (!byAisle[item.aisle]) byAisle[item.aisle] = []
    byAisle[item.aisle].push({ ...item, checked: false })
  }

  return byAisle
}

// Calcule le budget estimé d'un planning
export function estimateBudget(plan) {
  let total = 0
  for (const { lunch, dinner } of Object.values(plan)) {
    for (const recipeId of [lunch, dinner]) {
      const recipe = RECIPES.find(r => r.id === recipeId)
      if (recipe) total += recipe.cost
    }
  }
  return Math.round(total * 10) / 10
}

export { DAYS }
