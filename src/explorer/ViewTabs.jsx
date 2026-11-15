// The explorer's two ways in (spec §7.8; extract §4.19; the concept's
// golden-residence.html:137-141, gr.js:67-104): a tablist named „Как да
// търсите“, „Визуално“ and „По критерии“, the selected one in the tab order
// alone (a roving tabindex), ← and → selecting the other one and focusing
// it. `value` is the parent's ('visual' or 'list', the address's ?view;
// ExplorerSection.jsx), and onChange(view) asks for a view.
//
// Every click and arrow asks, the selected tab's too (ruling C8.8): a switch
// may still be waiting for what it shows, with the tab it left still
// selected, and a click on that tab, or an arrow back to it, calls the switch
// off. The parent ignores a view it already shows when no switch waits.
//
// The brass-l underline lies under the selected tab by CSS alone
// (explorer.css: the tablist's data-view puts it in that tab's column), so
// the prerendered HTML shows it in place; on a switch the parent moves it
// with Flip. Tab `view` is `${idBase}-tab-${view}` and controls the panel
// `${idBase}-${view}`, which the parent renders.

const TABS = [
  ['visual', 'Визуално'],
  ['list', 'По критерии'],
]

export default function ViewTabs({ value, onChange, idBase }) {
  // There are two tabs, so ← and → both go to the other one: the next for
  // „Визуално“, the one before for „По критерии“.
  const onKeyDown = (event, view) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    const tab = event.currentTarget
    ;(view === 'visual' ? tab.nextElementSibling : tab.previousElementSibling).focus()
    onChange(view === 'visual' ? 'list' : 'visual')
  }

  return (
    <div className="toggle" role="tablist" aria-label="Как да търсите" data-view={value}>
      {TABS.map(([view, label]) => (
        <button
          key={view}
          type="button"
          role="tab"
          id={`${idBase}-tab-${view}`}
          aria-controls={`${idBase}-${view}`}
          aria-selected={view === value}
          tabIndex={view === value ? 0 : -1}
          onClick={() => onChange(view)}
          onKeyDown={(event) => onKeyDown(event, view)}
        >
          {label}
        </button>
      ))}
      <span className="toggle__bar" aria-hidden="true" />
    </div>
  )
}
