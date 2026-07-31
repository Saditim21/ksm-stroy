import { useMemo } from 'react'
import { useApartments } from '../context/ApartmentContext'
import { PROJECTS } from '../config/projects'
import { summarizeFloor } from '../utils/availability'

// Live availability across all configured residential floors of both
// projects — the number the hero leads with. Mnogo garage rows (floor
// key 0) are excluded because they are not in any project's floors config.
export default function useSiteAvailability() {
  const { getProjectFloorData, loading } = useApartments()

  return useMemo(() => {
    const byProject = {}
    let available = 0
    let total = 0
    for (const project of Object.values(PROJECTS)) {
      let pAvailable = 0
      let pTotal = 0
      for (const block of project.blocks) {
        const floorData = getProjectFloorData(project.id, block.id) || {}
        for (const floor of project.floors[block.id]) {
          const s = summarizeFloor(floorData[floor] ?? [])
          pAvailable += s.available
          pTotal += s.total
        }
      }
      byProject[project.id] = { available: pAvailable, total: pTotal, name: project.name }
      available += pAvailable
      total += pTotal
    }
    return { available, total, byProject, loading }
  }, [getProjectFloorData, loading])
}
