import { useRef, useState } from 'react'
import { polygonToPoints, polygonCentroid } from '../../utils/buildingMaps'
import useZoomPan from '../../components/explorer/useZoomPan'

// Dev-only tracing editor (spec §5). Draw/edit polygon shapes over any image,
// tag them as floors or apartments, import/export map JSON.
export default function TracerPage() {
  const [imgSrc, setImgSrc] = useState(null)
  const [dims, setDims] = useState(null)
  const [shapes, setShapes] = useState([])
  const [selected, setSelected] = useState(null) // shape index
  const [mode, setMode] = useState('draw') // 'draw' | 'edit' | 'band'
  const [draft, setDraft] = useState([]) // in-progress polygon points
  const [tag, setTag] = useState({ type: 'floor', block: 'А', floor: 1, unitSuffix: '01', unit: '' })
  const [band, setBand] = useState({ corners: [], count: 8, startFloor: 1 })
  const [io, setIo] = useState('')
  const svgRef = useRef(null)
  const { transform, reset, wasDrag, handlers } = useZoomPan()

  const toImage = (e) => {
    const pt = new DOMPoint(e.clientX, e.clientY)
    const m = svgRef.current.getScreenCTM().inverse()
    const p = pt.matrixTransform(m)
    return [Math.round(p.x), Math.round(p.y)]
  }

  const loadFile = (file) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { setDims({ w: img.naturalWidth, h: img.naturalHeight }); setImgSrc(url); setShapes([]); reset() }
    img.src = url
  }

  const finishDraft = () => {
    if (draft.length < 3) return setDraft([])
    const shape = tag.type === 'apartment'
      ? { type: 'apartment', ...(tag.unit ? { unit: tag.unit } : { unitSuffix: tag.unitSuffix }), polygons: [draft] }
      : { type: 'floor', block: tag.block, floor: Number(tag.floor), polygons: [draft] }
    setShapes((s) => [...s, shape])
    setDraft([])
  }

  const handleCanvasClick = (e) => {
    if (wasDrag()) return
    if (e.detail > 1) return // ignore the click(s) that precede a dblclick close
    if (mode === 'draw') setDraft((d) => [...d, toImage(e)])
    if (mode === 'band') {
      setBand((b) => {
        const corners = [...b.corners, toImage(e)]
        if (corners.length === 4) { sliceBands(corners, b.count, b.startFloor); return { ...b, corners: [] } }
        return { ...b, corners }
      })
    }
  }

  // 4 corners clicked in order LT, RT, RB, LB -> N floor quads, top to bottom,
  // interpolating the left and right facade edges (handles slight perspective).
  const sliceBands = (c, count, startFloor) => {
    const [lt, rt, rb, lb] = c
    const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t].map(Math.round)
    const bands = []
    for (let i = 0; i < count; i++) {
      const t0 = i / count, t1 = (i + 1) / count
      bands.push({
        type: 'floor', block: tag.block, floor: startFloor + (count - 1 - i),
        polygons: [[lerp(lt, lb, t0), lerp(rt, rb, t0), lerp(rt, rb, t1), lerp(lt, lb, t1)]],
      })
    }
    setShapes((s) => [...s, ...bands])
  }

  const movePoint = (si, pi, qi, e) => {
    const p = toImage(e)
    setShapes((s) => s.map((sh, i) => i !== si ? sh : {
      ...sh, polygons: sh.polygons.map((poly, j) => j !== pi ? poly : poly.map((pt, k) => (k === qi ? p : pt))),
    }))
  }

  const doExport = () => {
    const out = { image: '<fill-in>', imageWidth: dims.w, imageHeight: dims.h, shapes }
    setIo(JSON.stringify(out, null, 2))
    navigator.clipboard?.writeText(JSON.stringify(out, null, 2))
  }
  const doImport = () => {
    try {
      const parsed = JSON.parse(io)
      setShapes(parsed.shapes ?? parsed)
    } catch (e) { alert(`Invalid JSON: ${e.message}`) }
  }

  const fill = (sh) => (sh.type === 'floor' ? 'rgba(16,185,129,0.3)' : 'rgba(59,130,246,0.3)')

  return (
    <div className="flex h-screen bg-neutral-900 text-white">
      <div className="flex-1 overflow-hidden" style={{ touchAction: 'none' }} {...handlers}>
        {imgSrc && dims && (
          <div style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0' }}>
            <div className="relative">
              <img src={imgSrc} alt="" className="block max-w-full h-auto" draggable={false} />
              <svg ref={svgRef} viewBox={`0 0 ${dims.w} ${dims.h}`} className="absolute inset-0 w-full h-full"
                onClick={handleCanvasClick} onDoubleClick={finishDraft}>
                {shapes.map((sh, si) => sh.polygons.map((poly, pi) => (
                  <g key={`${si}-${pi}`}>
                    <polygon points={polygonToPoints(poly)} fill={fill(sh)}
                      stroke={selected === si ? '#fbbf24' : '#fff'} strokeWidth={dims.w / 800}
                      onClick={(e) => { e.stopPropagation(); setSelected(si) }} />
                    <text x={polygonCentroid(poly).x} y={polygonCentroid(poly).y} fill="#fff"
                      fontSize={dims.w / 70} textAnchor="middle">
                      {sh.type === 'floor' ? `${sh.block}${sh.floor}` : (sh.unit ?? sh.unitSuffix)}
                    </text>
                    {mode === 'edit' && selected === si && poly.map((pt, qi) => (
                      <circle key={qi} cx={pt[0]} cy={pt[1]} r={dims.w / 250} fill="#fbbf24"
                        onPointerDown={(e) => { e.stopPropagation(); e.currentTarget.setPointerCapture?.(e.pointerId) }}
                        onPointerMove={(e) => e.buttons === 1 && movePoint(si, pi, qi, e)} />
                    ))}
                  </g>
                )))}
                {draft.length > 0 && <polyline points={polygonToPoints(draft)} fill="none" stroke="#fbbf24" strokeWidth={dims.w / 600} />}
                {band.corners.map((pt, i) => <circle key={i} cx={pt[0]} cy={pt[1]} r={dims.w / 200} fill="#f87171" />)}
              </svg>
            </div>
          </div>
        )}
        {!imgSrc && <div className="p-10 text-neutral-400">Изберете изображение от панела →</div>}
      </div>

      <div className="w-80 shrink-0 space-y-3 overflow-y-auto border-l border-neutral-700 p-4 text-sm">
        <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && loadFile(e.target.files[0])} />
        <div className="flex gap-1">
          {['draw', 'edit', 'band'].map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`rounded px-2 py-1 ${mode === m ? 'bg-amber-500 text-black' : 'bg-neutral-700'}`}>{m}</button>
          ))}
          <button onClick={reset} className="rounded bg-neutral-700 px-2 py-1">reset view</button>
        </div>
        <p className="text-neutral-400">
          draw: клик за точка, двоен клик затваря · edit: избери форма, влачи точките ·
          band: 4 ъгъла (ЛГ, ДГ, ДД, ЛД) → {band.count} етажа · колело = zoom, влачене = pan
        </p>
        <label className="block">Тип
          <select value={tag.type} onChange={(e) => setTag({ ...tag, type: e.target.value })} className="w-full bg-neutral-800 p-1">
            <option value="floor">floor</option><option value="apartment">apartment</option>
          </select>
        </label>
        {tag.type === 'floor' ? (
          <div className="flex gap-2">
            <label>Блок <input value={tag.block} onChange={(e) => setTag({ ...tag, block: e.target.value })} className="w-12 bg-neutral-800 p-1" /></label>
            <label>Етаж <input type="number" value={tag.floor} onChange={(e) => setTag({ ...tag, floor: e.target.value })} className="w-16 bg-neutral-800 p-1" /></label>
          </div>
        ) : (
          <div className="flex gap-2">
            <label>Suffix <input value={tag.unitSuffix} onChange={(e) => setTag({ ...tag, unitSuffix: e.target.value })} className="w-14 bg-neutral-800 p-1" /></label>
            <label>Unit (опц.) <input value={tag.unit} onChange={(e) => setTag({ ...tag, unit: e.target.value })} placeholder="А 112" className="w-20 bg-neutral-800 p-1" /></label>
          </div>
        )}
        {mode === 'band' && (
          <div className="flex gap-2">
            <label>Етажи <input type="number" value={band.count} onChange={(e) => setBand({ ...band, count: Number(e.target.value) })} className="w-14 bg-neutral-800 p-1" /></label>
            <label>Първи <input type="number" value={band.startFloor} onChange={(e) => setBand({ ...band, startFloor: Number(e.target.value) })} className="w-14 bg-neutral-800 p-1" /></label>
          </div>
        )}
        <div className="max-h-48 space-y-1 overflow-y-auto">
          {shapes.map((sh, i) => (
            <div key={i} className={`flex justify-between rounded px-2 py-1 ${selected === i ? 'bg-amber-500/20' : 'bg-neutral-800'}`}>
              <button onClick={() => setSelected(i)}>
                {sh.type === 'floor' ? `етаж ${sh.block}${sh.floor}` : `ап. ${sh.unit ?? sh.unitSuffix}`} ({sh.polygons.length} poly)
              </button>
              <button onClick={() => setShapes((s) => s.filter((_, j) => j !== i))} className="text-red-400">✕</button>
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          <button onClick={doExport} className="rounded bg-emerald-600 px-2 py-1">Export → clipboard</button>
          <button onClick={doImport} className="rounded bg-blue-600 px-2 py-1">Import</button>
        </div>
        <textarea value={io} onChange={(e) => setIo(e.target.value)} rows={8} className="w-full bg-neutral-800 p-2 font-mono text-xs" placeholder="map JSON" />
      </div>
    </div>
  )
}
