// Calendrier saisonnier par mois (1=janvier)
export const SEASONAL_PRODUCE = {
  1:  { fruits: ['Clémentines','Oranges','Kiwis','Pamplemousse'], veggies: ['Carottes','Poireaux','Navets','Betteraves','Choux','Pommes de terre','Céleri'] },
  2:  { fruits: ['Oranges','Kiwis','Pamplemousse','Citrons'], veggies: ['Carottes','Poireaux','Navets','Betteraves','Choux','Mâche','Endives'] },
  3:  { fruits: ['Oranges','Kiwis','Citrons'], veggies: ['Asperges','Radis','Épinards','Blettes','Poireaux','Carottes','Mâche'] },
  4:  { fruits: ['Fraises','Rhubarbe'], veggies: ['Asperges','Radis','Petits pois','Épinards','Artichauds','Laitue','Navets'] },
  5:  { fruits: ['Fraises','Cerises','Rhubarbe'], veggies: ['Asperges','Petits pois','Fèves','Courgettes','Radis','Artichauds','Laitue'] },
  6:  { fruits: ['Fraises','Cerises','Abricots','Framboises'], veggies: ['Courgettes','Tomates','Poivrons','Concombre','Haricots verts','Petits pois','Basilic'] },
  7:  { fruits: ['Abricots','Pêches','Nectarines','Framboises','Myrtilles'], veggies: ['Tomates','Courgettes','Aubergines','Poivrons','Concombre','Haricots verts','Maïs'] },
  8:  { fruits: ['Pêches','Nectarines','Melons','Pastèque','Prunes','Framboises'], veggies: ['Tomates','Courgettes','Aubergines','Poivrons','Maïs','Basilic','Haricots verts'] },
  9:  { fruits: ['Raisins','Prunes','Figues','Poires','Pommes'], veggies: ['Potiron','Courges','Champignons','Poireaux','Betteraves','Haricots verts','Tomates'] },
  10: { fruits: ['Pommes','Poires','Raisins','Coings','Châtaignes'], veggies: ['Potiron','Courges','Champignons','Poireaux','Betteraves','Épinards','Carottes'] },
  11: { fruits: ['Pommes','Poires','Kiwis','Clémentines','Châtaignes'], veggies: ['Poireaux','Carottes','Navets','Betteraves','Choux','Céleri','Épinards'] },
  12: { fruits: ['Clémentines','Oranges','Kiwis','Pommes','Poires'], veggies: ['Poireaux','Carottes','Navets','Betteraves','Choux','Endives','Céleri'] },
}

export const SEASON_MONTHS = {
  winter: [12, 1, 2],
  spring: [3, 4, 5],
  summer: [6, 7, 8],
  fall:   [9, 10, 11],
}

export function getCurrentSeason() {
  const month = new Date().getMonth() + 1
  for (const [season, months] of Object.entries(SEASON_MONTHS)) {
    if (months.includes(month)) return season
  }
  return 'winter'
}

export function getCurrentProduce() {
  const month = new Date().getMonth() + 1
  return SEASONAL_PRODUCE[month] || { fruits: [], veggies: [] }
}
