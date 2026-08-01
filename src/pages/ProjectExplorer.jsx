import { useEffect, useMemo, useState } from 'react'
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
import DimensionLine from '../components/ui/DimensionLine'
import DisplayHeading from '../components/ui/DisplayHeading'
import PageTransition from '../components/ui/PageTransition'

const DOT = { available: 'bg-emerald-500', reserved: 'bg-amber-500', sold: 'bg-red-500', unknown: 'bg-concrete' }

export default function ProjectExplorer({ projectId }) {
  const { block: blockId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const project = PROJECTS[projectId]
  const block = project?.blocks.find((b) => b.id === blockId)
  const { getProjectFloorData, getGaragesData, getParkingData, loading } = useApartments()

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

  // Header stats cover the CONFIGURED floors only. Summing the sheet wholesale
  // would walk every key, which for Многофамилна сграда includes key 0 (the
  // garages/parking rows) — those are not apartments and must not inflate the
  // apartment counters.
  const projectStats = useMemo(() => {
    const totals = { available: 0, reserved: 0, sold: 0, total: 0 }
    for (const b of project?.blocks ?? []) {
      for (const floor of project.floors[b.id] ?? []) {
        const s = summarizeFloor(floorDataByLetter[b.letter]?.[floor] ?? [])
        totals.available += s.available
        totals.reserved += s.reserved
        totals.sold += s.sold
        totals.total += s.total
      }
    }
    return totals
  }, [project, floorDataByLetter])

  const floors = block ? project.floors[block.id] : []
  const activeFloor = floorParam && floors.includes(floorParam) ? floorParam : null

  // Changing floor or block invalidates the current selection — otherwise the
  // detail drawer survives a floor switch or a browser Back and shows a unit
  // that is no longer on screen.
  useEffect(() => {
    setSelectedApartment(null)
    setSelectedUnitKey(null)
  }, [activeFloor, blockId])

  if (!project || !block) return <Navigate to="/projects" replace />

  const floorApartments = activeFloor ? floorDataByLetter[block.letter]?.[activeFloor] ?? [] : []
  const unitsIndex = new Map(floorApartments.map((a) => [normalizeUnitId(a.apartment), a]))
  const floorMap = activeFloor ? findFloorMap(project.floorMaps, projectId, block.letter, activeFloor) : null
  const planImage = activeFloor ? project.planImages[block.id][activeFloor] : null

  const openFloor = (floor) => setSearchParams({ floor: String(floor) })
  // The selection reset is handled by the effect above, which also covers
  // browser Back and jumping straight from one floor to another.
  const closeFloor = () => setSearchParams({})
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
    <PageTransition as="main" className="min-h-screen bg-plaster pt-24 pb-16">
      <SEO
        title={`${project.name} — ${block.label}`}
        description={`Свободни апартаменти в ${project.name}, ${block.label}`}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link to={`/projects/${projectId}`} className="text-graphite hover:text-ink text-sm">
              ← {project.name}
            </Link>
            <DimensionLine label={project.name} className="mt-3" />
            <DisplayHeading as="h1" size="sub">{block.label}</DisplayHeading>
          </div>
          <LiveStatsBar stats={projectStats} />
        </div>

        {loading && <div className="animate-pulse rounded-2xl bg-concrete" style={{ aspectRatio: '2 / 1' }} />}

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
                <div className="overflow-hidden rounded-2xl border border-concrete bg-white p-2">
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
                <div className="rounded-2xl border border-concrete bg-white p-4">
                  <h2 className="mb-3 font-display text-lg text-ink">Етажи</h2>
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
                            hoveredFloor === key ? 'border-gold-accent bg-gold-accent/5' : 'border-concrete hover:border-ink'
                          }`}
                        >
                          <span className="font-medium">Етаж {floor}</span>
                          <span className="text-sm text-graphite">
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
                <button onClick={closeFloor} className="text-graphite hover:text-ink text-sm">
                  ← Всички етажи
                </button>
                <h2 className="font-display text-xl text-ink">Етаж {activeFloor}</h2>
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
                    className="rounded border border-concrete px-2 py-1 text-sm"
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
                      className="w-16 rounded border border-concrete px-1 py-1"
                    />
                    до
                    <input
                      type="number"
                      min="0"
                      placeholder="м²"
                      aria-label="Максимална площ"
                      value={filter.maxArea ?? ''}
                      onChange={(e) => setFilter({ ...filter, maxArea: e.target.value === '' ? undefined : Number(e.target.value) })}
                      className="w-16 rounded border border-concrete px-1 py-1"
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
                    <div className="rounded-2xl border border-concrete bg-white p-8 text-center text-graphite">
                      Планът за този етаж не е наличен.
                    </div>
                  )}
                </div>
                <aside className="lg:w-1/3">
                  <div className="max-h-[70vh] space-y-1.5 overflow-y-auto rounded-2xl border border-concrete bg-white p-3">
                    {floorApartments.map((apartment) => (
                      <button
                        key={apartment.apartment}
                        onClick={() => selectUnit(apartment, normalizeUnitId(apartment.apartment))}
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                          selectedUnitKey === normalizeUnitId(apartment.apartment)
                            ? 'border-gold-accent bg-gold-accent/5'
                            : 'border-concrete hover:border-ink'
                        }`}
                      >
                        <span className="font-medium">{apartment.apartment}</span>
                        <span className="text-graphite">{apartment.вид}</span>
                        <AvailabilityBadge status={apartment.status} />
                      </button>
                    ))}
                    {floorApartments.length === 0 && (
                      <div className="p-4 text-center text-sm text-graphite">Няма данни за този етаж.</div>
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
    </PageTransition>
  )
}
