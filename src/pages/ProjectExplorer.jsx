import { useMemo, useState } from 'react'
import { useParams, useNavigate, useSearchParams, Link, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PROJECTS } from '../config/projects'
import { useApartments } from '../context/ApartmentContext'
import { summarizeFloor, normalizeUnitId } from '../utils/availability'
import { findFloorMap } from '../utils/buildingMaps'
import InteractiveBuilding, { floorKey } from '../components/explorer/InteractiveBuilding'
import FloorPlanViewer from '../components/explorer/FloorPlanViewer'
import ApartmentPanel from '../components/explorer/ApartmentPanel'
import AvailabilityBadge from '../components/explorer/AvailabilityBadge'
import AvailabilityLegend from '../components/explorer/AvailabilityLegend'
import LiveStatsBar from '../components/explorer/LiveStatsBar'
import GarageGrid from '../components/explorer/GarageGrid'
import SEO from '../components/common/SEO'

const DOT = { available: 'bg-emerald-500', reserved: 'bg-amber-500', sold: 'bg-red-500', unknown: 'bg-neutral-300' }

export default function ProjectExplorer({ projectId }) {
  const { block: blockId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const project = PROJECTS[projectId]
  const block = project?.blocks.find((b) => b.id === blockId)
  const { getProjectFloorData, getProjectStats, getGaragesData, getParkingData, loading } = useApartments()

  const [hoveredFloor, setHoveredFloor] = useState(null)
  const [selectedApartment, setSelectedApartment] = useState(null)
  const [selectedUnitKey, setSelectedUnitKey] = useState(null)
  const [filter, setFilter] = useState({ onlyAvailable: false })

  const floorParam = Number(searchParams.get('floor')) || null

  // Data for BOTH blocks — the facade shows the whole building, and clicking
  // a floor of the other block jumps to that block's page (spec §3.1).
  const floorDataByLetter = useMemo(() => {
    const out = {}
    for (const b of project?.blocks ?? []) {
      out[b.letter] = getProjectFloorData(projectId, b.id) || {}
    }
    return out
  }, [project, projectId, getProjectFloorData])

  const summaries = useMemo(() => {
    const out = {}
    for (const shape of project?.building.map.shapes ?? []) {
      out[floorKey(shape)] = summarizeFloor(floorDataByLetter[shape.block]?.[shape.floor] ?? [])
    }
    return out
  }, [project, floorDataByLetter])

  if (!project || !block) return <Navigate to="/projects" replace />

  const floors = project.floors[block.id]
  const activeFloor = floorParam && floors.includes(floorParam) ? floorParam : null
  const floorApartments = activeFloor ? floorDataByLetter[block.letter]?.[activeFloor] ?? [] : []
  const unitsIndex = new Map(floorApartments.map((a) => [normalizeUnitId(a.apartment), a]))
  const floorMap = activeFloor ? findFloorMap(project.floorMaps, projectId, block.letter, activeFloor) : null
  const planImage = activeFloor ? project.planImages[block.id][activeFloor] : null

  const openFloor = (floor) => setSearchParams({ floor: String(floor) })
  const closeFloor = () => {
    setSearchParams({})
    setSelectedApartment(null)
    setSelectedUnitKey(null)
  }
  const selectFacadeFloor = (shape) => {
    const target = project.blocks.find((b) => b.letter === shape.block)
    if (target && target.id !== block.id) navigate(`/projects/${projectId}/${target.id}?floor=${shape.floor}`)
    else openFloor(shape.floor)
  }
  const selectUnit = (apartment, key) => {
    setSelectedApartment(apartment ?? null)
    setSelectedUnitKey(apartment ? key : null)
  }

  return (
    <div className="min-h-screen bg-primary-50 py-8">
      <SEO
        title={`${project.name} — ${block.label}`}
        description={`Свободни апартаменти в ${project.name}, ${block.label}`}
      />
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link to={`/projects/${projectId}`} className="text-neutral-600 hover:text-neutral-900">
            ← {project.name}
          </Link>
          <h1 className="text-2xl font-bold sm:text-3xl">
            {project.name} · <span className="text-gold-600">{block.label}</span>
          </h1>
          <LiveStatsBar stats={getProjectStats(projectId)} />
        </div>

        {loading && <div className="animate-pulse rounded-xl bg-neutral-200" style={{ aspectRatio: '2 / 1' }} />}

        <AnimatePresence mode="wait">
          {!activeFloor && !loading && (
            <motion.div
              key="facade"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6 lg:flex-row"
            >
              <div className="lg:w-2/3">
                <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white p-2 shadow-luxury">
                  <InteractiveBuilding
                    image={project.building.image}
                    shapes={project.building.map.shapes}
                    summaries={summaries}
                    hoveredFloor={hoveredFloor}
                    onHoverFloor={setHoveredFloor}
                    onSelectFloor={selectFacadeFloor}
                  />
                </div>
                <div className="mt-3 flex justify-center">
                  <AvailabilityLegend />
                </div>
              </div>
              <aside className="lg:w-1/3">
                <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-luxury">
                  <h2 className="mb-3 text-lg font-bold">Етажи</h2>
                  <div className="space-y-1.5">
                    {[...floors].reverse().map((floor) => {
                      const key = `${block.letter}:${floor}`
                      const s = summaries[key] ?? { available: 0, total: 0, color: 'unknown' }
                      return (
                        <button
                          key={floor}
                          onMouseEnter={() => setHoveredFloor(key)}
                          onMouseLeave={() => setHoveredFloor(null)}
                          onClick={() => openFloor(floor)}
                          className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition ${
                            hoveredFloor === key ? 'border-gold-500 bg-gold-50' : 'border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          <span className="font-medium">Етаж {floor}</span>
                          <span className="text-sm text-neutral-500">
                            {s.available > 0 ? `${s.available} свободни` : s.color === 'sold' ? 'продаден' : `${s.total} ап.`}
                          </span>
                          <span className={`h-2.5 w-2.5 rounded-full ${DOT[s.color]}`} />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </aside>
            </motion.div>
          )}

          {activeFloor && !loading && (
            <motion.div key={`floor-${activeFloor}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <button onClick={closeFloor} className="text-neutral-600 hover:text-neutral-900">
                  ← Всички етажи
                </button>
                <h2 className="text-xl font-bold">Етаж {activeFloor}</h2>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filter.onlyAvailable}
                      onChange={(e) => setFilter({ ...filter, onlyAvailable: e.target.checked })}
                    />
                    Само свободни
                  </label>
                  <select
                    value={filter.type ?? ''}
                    onChange={(e) => setFilter({ ...filter, type: e.target.value || undefined })}
                    className="rounded border border-neutral-300 px-2 py-1 text-sm"
                    aria-label="Вид апартамент"
                  >
                    <option value="">Всички видове</option>
                    <option value="2-стаен">2-стаен</option>
                    <option value="3-стаен">3-стаен</option>
                    <option value="ателие">Ателие</option>
                  </select>
                  <label className="flex items-center gap-1 text-sm">
                    Площ от
                    <input
                      type="number"
                      min="0"
                      placeholder="м²"
                      aria-label="Минимална площ"
                      value={filter.minArea ?? ''}
                      onChange={(e) => setFilter({ ...filter, minArea: e.target.value === '' ? undefined : Number(e.target.value) })}
                      className="w-16 rounded border border-neutral-300 px-1 py-1"
                    />
                    до
                    <input
                      type="number"
                      min="0"
                      placeholder="м²"
                      aria-label="Максимална площ"
                      value={filter.maxArea ?? ''}
                      onChange={(e) => setFilter({ ...filter, maxArea: e.target.value === '' ? undefined : Number(e.target.value) })}
                      className="w-16 rounded border border-neutral-300 px-1 py-1"
                    />
                  </label>
                  <AvailabilityLegend />
                </div>
              </div>
              <div className="flex flex-col gap-6 lg:flex-row">
                <div className="lg:w-2/3">
                  {floorMap && planImage ? (
                    <FloorPlanViewer
                      image={{ src: planImage, width: floorMap.imageWidth, height: floorMap.imageHeight }}
                      mapShapes={floorMap.shapes}
                      blockLetter={block.letter}
                      unitFloorNumber={project.unitFloor(activeFloor)}
                      unitsIndex={unitsIndex}
                      filter={filter}
                      selectedUnit={selectedUnitKey}
                      onSelectUnit={selectUnit}
                    />
                  ) : (
                    <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-neutral-500">
                      Планът за този етаж не е наличен.
                    </div>
                  )}
                </div>
                <aside className="lg:w-1/3">
                  <div className="max-h-[70vh] space-y-1.5 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-3 shadow-luxury">
                    {floorApartments.map((apartment) => (
                      <button
                        key={apartment.apartment}
                        onClick={() => selectUnit(apartment, normalizeUnitId(apartment.apartment))}
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                          selectedUnitKey === normalizeUnitId(apartment.apartment)
                            ? 'border-gold-500 bg-gold-50'
                            : 'border-neutral-100 hover:border-neutral-300'
                        }`}
                      >
                        <span className="font-medium">{apartment.apartment}</span>
                        <span className="text-neutral-500">{apartment.вид}</span>
                        <AvailabilityBadge status={apartment.status} />
                      </button>
                    ))}
                    {floorApartments.length === 0 && (
                      <div className="p-4 text-center text-sm text-neutral-500">Няма данни за този етаж.</div>
                    )}
                  </div>
                </aside>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {project.hasGarages && !activeFloor && !loading && (
          <div className="mt-8 space-y-6">
            <GarageGrid title="Гаражи (приземен и подземен етаж)" items={getGaragesData()} />
            <GarageGrid title="Паркоместа" items={getParkingData()} />
          </div>
        )}
      </div>
      <ApartmentPanel apartment={selectedApartment} onClose={() => selectUnit(null, null)} />
    </div>
  )
}
