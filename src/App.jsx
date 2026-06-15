import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import Layout from './components/Layout'
import Onboarding from './components/Onboarding'
import CookingMode from './components/CookingMode'
import Dashboard from './pages/Dashboard'
import Planner from './pages/Planner'
import Recipes from './pages/Recipes'
import Shopping from './pages/Shopping'
import Profile from './pages/Profile'
import RecipeDetail from './pages/RecipeDetail'

export default function App() {
  const { onboardingDone, cookingRecipeId } = useStore()

  if (!onboardingDone) return <Onboarding />

  return (
    <>
      {cookingRecipeId && <CookingMode />}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="planner" element={<Planner />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="recipes/:id" element={<RecipeDetail />} />
          <Route path="shopping" element={<Shopping />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  )
}
