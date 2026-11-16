# Platform map for M3/M4 (the remaining pages)

Read at redesign-v2 01eac18 in C:/ksm-stroy/ksm-stroy-v2 by six read-only readers on 2026-11-16. Paths are relative to the repo unless absolute. "concept/" is C:/ksm-stroy/design/2026-11-16-m3m4-concepts. Line numbers drift as M3/M4 change the code: use them to find a place, then read the current file.

Sections: 1. The explorer and Многофамилна. 2. How M2 pages are built, and what is reusable. 3. Inquiries and Контакти. 4. Legacy removal and content sources. 5. Budgets, checks and Home's LCP. 6. Rulings and parked work.


## 1. The explorer and Многофамилна


Paths: repo = C:/ksm-stroy/ksm-stroy-v2 (redesign-v2 @01eac18, read only); concept/ = C:/ksm-stroy/design/2026-11-16-m3m4-concepts.

### 1. src/explorer component map
How the data arrives
- Store: useAvailability() returns {status,data,origin,updatedAt} (src/data/availability/useAvailability.js:9-29). On the server and during hydration it is IDLE with no data (store.js:54,284). load() tries /api/availability, then the browser's sheet fetchers, then the built-in rows as 'fallback' (store.js:220-230). A GR slot the live read missed gets the built-in rows, marked origin 'built-in' (store.js:203-218). An MN slot has rows only from live MNOGO sheets or in 'fallback'. After any live read it is null, origin null (store.js:18-20; pinned by store.test.js:227-229,252).
- ExplorerProvider({routeBlock=null,children}) (ExplorerContext.jsx:47):
  - model = buildModel(snapshot.data) (:48-49);
  - on a deep link, jumpToId('explorer') and holds the EU row (:64-83);
  - loads the surfaces chunk when the address asks for a dialog (:89-106);
  - wraps openFloor/openUnit/closeStage/setFloor/setBlock; after a morph the unit opens 820 ms later (:115-147);
  - renders surfaces.ExplorerDialogs (:165-178). The context value is described at useExplorer.js:3-16.
- useExplorerState({routeBlock}): reads ?floor/?unit/?view after hydration (useExplorerState.js:34-40). Each change is one replace navigation (:44-51). A block route writes the floor bare (:53).
- model.js:
  - floorKey (:15);
  - buildModel returns {units, floors Map 'А-5'→{block,floor,units by suffix,counts,colour,minFree,maxFree}, blocks{А,Б}, totals}. It is null while any GR slot is null (:47-79);
  - findUnit goes through normalizeUnitId (:87-91);
  - units come from select.js apartmentUnits(data,project) (:44-49): toApartment, plus the label's last 2 digits as suffix (:12-15), plus price; unit.floor is the row's Етаж (units.js:36).

Files
- ExplorerSection({headingLevel,initialBlock}) (ExplorerSection.jsx:60): section#explorer (:160) with
  - the hinge „Изберете апартамент“, ViewTabs and the live lead „…: N от 192.“ (:164-181);
  - the legend (:182-190) and StaleNotice (:191);
  - two tab panels, Facade(full) and a lazy UnitList (:192-207);
  - the Flip switch between them (:102-155).
- ViewTabs({value,onChange,idBase}) (ViewTabs.jsx:24).
- Facade({model, mode full|compact, initialBlock, active, focusRail, onOpenFloor, onRailFocused}) (Facade.jsx:88). How it is drawn:
  - .fx-wrap is the container, .fx[data-block] the root (:347-348);
  - the phone block switch (:321-328, :349-358);
  - .fx__clip>.fx__frame holds a ResponsivePicture of 'facade-cut' (sky cut out) (:63, :374-376);
  - one SVG over it on the building map's grid (viewBox 0 0 1200 599, preserveAspectRatio none) holds the dim mask with the lens hole, the tint, the outline, the seam (x 605, y 120–520), and transparent floor paths from golden-residence.building.json (:377-393);
  - the rails (:396); the caption, two lazy FloorPanels and the FloorSheet (:414-449);
  - hot state from useHotFloor (useHotFloor.js:23-66), keys at :289-311;
  - the intro runs through useMotion only when the facade is below the fold (:199-210).
- FacadeRails({model,hotKey,railRefs}) (FacadeRails.jsx:26): a button per floor, placed at --cy = the floor's bbox centre (:44), named „Блок А, етаж 5: …“ (:21-24), with an sr-only „етаж N“ (:52). The CSS puts the rails at grid x 71/1129 (explorer.css:241-255).
- geometry.js:
  - FACADE (:10-20): documentation only; the CSS holds the real values;
  - floorShapes (:35-39), planFor (:43-45), planBox (:51-54), labelPoint (:78-97), planShapes, cached (:103-110), cropFor (:115-122).
- plans.js: PLANS {А,Б} from golden-residence.floors.json (:5-8).
- planModes.js: PLAN_MODES and sizePlan (:4-21).
- PlanSvg({plan,units,mode mini|stage|crop,viewBox,hot,focus,label,fit,onUnit,onHot}) (PlanSvg.jsx:70):
  - fills by status (:62-68);
  - the drawing is grImages plan-a/plan-b, chosen by plan.appliesTo.blocks[0] (:53-59, :154-166);
  - the unit label is `${unit.floor}${suffix}` (:186);
  - stage units are role=button (:172);
  - fit() runs on a ResizeObserver (:84-95).
- FloorPanel({side,floor,plan,onOpenFloor,onUnit,onPointer*}) (FloorPanel.jsx:78). It exports FloorTitle, FloorCounts, FloorRange and FloorMeta (:26-76).
- FloorSheet({floor,plan,onClose,onStep,onOpen,onUnit,anchor}) (FloorSheet.jsx:53), a portal on body.
- The lazy surfaces chunk (surfaces.js:25-44): FloorPanel, FloorSheet, ExplorerDialogs, PLANS, loadFlip and loadList, preloaded when idle. Helpers:
  - loadSurfaces.js (:8-23), loadUnitList.js (:18-35), listChunk.js (:3-4);
  - surfaceModel.js: rangeLine and stepUnit (:21-37);
  - planMotion.js (:25-62), viewMotion.js (:11-15).
- ExplorerDialogs({model,state,opening,setOpening,unitOpener,openUnit,closeStage,setFloor,setBlock,focusRail}) (ExplorerDialogs.jsx:105):
  - shows PlanStage while ?floor is set, and UnitPanel while ?unit names a known unit;
  - gives focus back through `#explorer .fx__cnt` and `.lv` rows (:51-54, :115-142);
  - the inquiry action presets 'golden-residence' (:144-148).
- PlanStage({model,block,floor,fromRect,covered,onClose,onFloor,onBlock,onUnit}) (PlanStage.jsx:156): the bar (:291-322), the plan and inspector (:324-335), the counts, legend and table (:336-383), the morph (:95-129), the keys (:255-270).
- UnitPanel({model,unitId,onClose,onStep,onInquire}) (UnitPanel.jsx:106-111):
  - the crop plan and its caption (:236-241);
  - the title split on whitespace (:73-76);
  - the areas, including Идеални части (:250-258);
  - the action by status (:49-58), and previous/next (:267-278).
- UnitList({model,block,onUnit}) (UnitList.jsx:81), with filterUnits.js (:8-55).
- BlockGrid({model,block,onUnit}) (BlockGrid.jsx:40): 12×8 squares with a roving tabindex. CSS in gr.css:343-383; used by BlocksSection.jsx:113.
- BlockPage({block}) (BlockPage.jsx:38-61): GR only. A hinge, then ExplorerSection, then the GR inquiry.
- StaleNotice (StaleNotice.jsx:12-25).
- floorParam.js: parse and format (:20-35).
- testing.js: GR fixtures, with the MN slots null (:17-42).
- explorer.css (1393 lines; imported by Facade.jsx:15 and PlanSvg.jsx:8):
  - facade geometry as CSS variables (:128-175, :235-255, :1121-1157);
  - drawing opacity (:480-486);
  - the block page head .bp (:1061-1080);
  - pinned by explorer.css.test.js:37-68.

Routes
- routes.js: one route per block, the path as its id (:22-25). GR blocks go to routes/golden-residence-block.jsx (:32). The MN main page is still the legacy MnogofamilnaBlockSelection.jsx (:33). MN blocks go to routes/mnogofamilna-block.jsx (:34). All are prerendered (react-router.config.js:24-27).
- blocks.js:
  - PROJECT_BLOCKS lists А and Б for both projects (:6-15);
  - blockPaths (:22);
  - matchedBlock finds the block by route id (:31-34).
- BlockRoute({project,render}) renders the block's page, or NotFound (BlockRoute.jsx:12-15).
- golden-residence-block.jsx: handle {solid, project, inquiry} (:17); renders BlockPage (:31-33).
- mnogofamilna-block.jsx: handle with legacy:true (:14); its meta says „72 апартамента на 9 етажа“ (:17-26); renders MnogofamilnaSingleBlock(block.id) (:28-30).

### 2. Golden Residence assumptions, and what Многофамилна needs
- **Project id** — model.js:62-63; select.js:44 (default); StaleNotice.jsx:14; ExplorerDialogs.jsx:147; BlockPage.jsx:44-58. MN needs 'mnogofamilna-sgrada', and the inquiry option 'mnogofamilna' (inquiryStore.js:31).
- **Floors 1–8** — floorParam.js:27; Facade.jsx:304-305, :444; FloorSheet.jsx:108, :114; PlanStage.jsx:178, :307, :313; UnitList.jsx:29; BlockGrid.jsx:33. MN needs 2–10 in both blocks (projects.js:48).
- **12 a floor, 96 a block, 192 in all** — BlockGrid.jsx:34, :66-72 and gr.css:362; FloorPanel.jsx:67; BlockPage.jsx:28-29; ExplorerSection.jsx:177; UnitList.jsx:105. MN needs 8, 72 and 144.
- **Unit number = floor + suffix** — PlanSvg.jsx:186 draws „501“; BlockGrid.jsx:46, :100 builds labels like „А 501“.
  - MN numbers are floor−1 (projects.js:84-85): А-101 is on floor 2.
  - MN labels use a dash („А-101“). UnitPanel.jsx:73-76 needs whitespace to split the title, so it would set the whole label in <em>. The concept shows „А-<em>101</em>“ (concept/js/mnogofamilna.js:855).
- **„тавански етаж“ on floor 10** — exists nowhere: FloorMeta (FloorPanel.jsx:66-76), the stage meta (PlanStage.jsx:296), the sheet, the unit sub line (UnitPanel.jsx:212). The concept has it at mnogofamilna.js:82 and :856.
- **Garages and parking** — GR slots only (store.js:97-102; select.js:76-83). MN floor key 0 is already dropped on every path (googleSheets.js:104-108; sheetsCore.js:140), so MN shows nothing.
- **Live wording** — the lead (ExplorerSection.jsx:172-178) and StaleNotice (:17-23). MN needs „по данни към 01.12.2025“ (facts.js:9) while its origin is not 'live'.
- **Идеални части** — always a row (UnitPanel.jsx:252). MN data has none, so the row must hide (concept :860).
- **Own apartment plan** — none (UnitPanel.jsx:236-241).
- **„Разпродаден етаж“** — already supported (FloorPanel.jsx:57; surfaceModel.js:28). MN sold-out floors today: А3–А6, А10, Б6, Б10.
- **GR images** — facade-cut (Facade.jsx:6, :63, :66) and plan-a/b (PlanSvg.jsx:3, :55; pinned by PlanStage.test.jsx:145).
- **GR copy** — Facade.jsx:86, :363 („Фасада на Golden Residence“), :415-419; UnitList.jsx:27 (Ателие), :151 („Изложение има само за блок Б“); BlockPage.jsx:44-50.
- **Facade geometry**
  - Where GR's numbers live: geometry.js:10-20; Facade.jsx:57-60, :208, :377, :387; FacadeRails.jsx:3, :16; explorer.css:130-136 (2.6087, 2.6432, 454, 33.5), :147, :163-164 (1200×599), :235-236, :247-248, :1121-1129, :1150.
  - What MN needs (concept/js/mnogofamilna.js:257-266, :403-409):
    - grid 1200×848, with the render at y 56.2, 1200×732.5;
    - seam at x 609.5; rails at x 72/1142;
    - light bands А 70–516, Б 700–1146;
    - crops: desktop 0/150/1200×480; phone А −36/208/652×412 and Б 600/208; block page 0 or 610 /196/600×436;
    - stage width factors 1200/531.5 and 2.5.
  - What stays: А on the left and Б on the right holds for MN too (А x 78–501, Б 718–1136), so ←/→ (Facade.jsx:306) and the panel sides need no change.
- **Plans** — plans.js:5-8 has one GR entry per block. MN has one entry for both blocks: planFor still works, but the drawing lookup by blocks[0] (PlanSvg.jsx:57) would pick GR's plan-a.

### 3. Многофамилна inputs today
- **projects.js MN entry** (:79-97):
  - floors 2–10 in each block; unitFloor = f−1;
  - the building image is MNOGO_RENDER (public/images/mnogofamilna/sgrada1.webp, 1200×848; buildingRenders.js:21-23) with its map;
  - every floor's plan is building-all-floors-architecture.webp (:34-35, :57); hasGarages is false;
  - only projects.test.js:1 reads it (it pins unitFloor at :40-43). The engine never reads it.
- **Maps**
  - Both projects store flat lists of polygons in absolute pixels (geometry.js:35-45). There is no template or transform anywhere; the v2 spec planned one (2026-11-13 spec:613-617).
  - mnogofamilna.building.json: 1200×848, 18 rectangular floors, in sgrada1.webp's pixel space. That is the 3308×2339 master ÷2.757, white margins included. Key 2 sits at y 527–558, key 10 at 254–288.
  - The margin-free crop (top 155, 3308×2020) lands at y 56.2, height 732.8 in that grid.
  - mnogofamilna.floors.json: one entry on building-all-floors-architecture.webp (1200×618), for blocks [А,Б] and floors 2–10, with 8 shapes 01–08.
- **Images manifest**
  - src/data/images/mnogofamilna.json has only 'mnogofamilna-sgrada1' (that crop, widths 768–2560; scripts/images/sources.json:67-73). Nothing in src uses it.
  - home.json has 'mn-dusk' (2400×1465, used at SplitHero.jsx:195). Its source file is byte-identical to the concept's mn-on-2400.webp.
- **Data: mnogofamilnaFallbackData.js** (generated; exports :1559-1560)
  - Keys: 0 (7 garages) and 2–10, 8 apartments a floor, „А-101“ to „Б-908“.
  - 16 free, 6 reserved, 122 sold. Идеални and Цена are empty. Both blocks have exposures. 72 two-room and 72 three-room.
  - The store exposes it only through builtInMnogofamilna, in 'fallback' (store.js:185-201), with origin 'built-in'.
  - apartmentUnits(data,'mnogofamilna-sgrada') already works: А-101 comes out on floor 2, suffix '01', id 'А101'.
  - A live MN read would need VITE_GOOGLE_SHEET_MNOGO_A/B, which are unpublished (api/availability.js:22-24, :42-43).
  - MNOGO_DATED is {16, 144, '01.12.2025'} (facts.js:9; checked by facts.test.js:19).
- **Own plans**
  - apartmentImages.js:21-42 maps 20 dash ids to webps of about 1040–1112 px, in src/assets/продажби/project 1/apartment-A and apartment-B-floor 1.
  - А-858 and А-864 do not exist (:38-39). Б-202 and Б-206 reuse Б-102's and Б-106's plans (:23, :25). getApartmentImage falls back to a photo (:45-47).
  - Only Projects.jsx:11 imports it. MnogofamilnaSingleBlock.jsx:157-199 has a different mapping.
  - The concept uses 900 px copies of these 18 plans (concept/img/mnogofamilna/apt; mnogofamilna.js:72).
- **Image sources** (src/assets/продажби/project 1/)
  - sgrada1.jpg 3308×2339 (the master); sgrada1.webp 1200×848; optimized/sgrada1.webp 3308×2339.
  - photos/photo-1…4.webp: 1200×736, 1200×731, 709×829, 643×829.
  - building-all-floors-architecture.webp 1200×618 (.png 1748×900); building-garages.webp 1200×848.
  - per-floor hover renders 1200×848; block-A/B at 696×793 and 668×804 (low resolution, not to be used).
  - In public/: images/mnogofamilna/sgrada1{,-640,-1024}, img/mnogofamilna-sgrada1-*, img/mn-dusk-*.
  - Only in the concept: mn-off-1400/2400 (the lights-off render), plan-mn.webp (2400×1236, ivory line art at 2× the plan grid), and the apartment plans.
- **Legacy components and their importers**
  - MnogofamilnaBlockSelection.jsx is itself the route module (routes.js:33). Its handle and meta are at :461-466. Imported by the tests legacy.prerender.test.jsx:9 and legacy.focus.test.jsx:6.
  - MnogofamilnaSingleBlock.jsx: imported only by routes/mnogofamilna-block.jsx:1.
  - FourTowersFloorMap.jsx (FLOOR_DATA :27): imported by MnogofamilnaSingleBlock.jsx:3, Projects.jsx:5 and extract-mnogofamilna-data.mjs:11.
  - buildingImages.js: imported by Projects.jsx:9. apartmentImages.js: imported by Projects.jsx:11.
  - None of the legacy MN pages read the store.

### 4. Concept behaviours, and what the engine can do
- **Lights-off facade** (concept js :283-303, :636-665) — needs new code. Facade.jsx:374-394 draws one picture. MN needs:
  - a dark twin, with the lit render showing through mask bands for floors with ≥1 free (today А2, А9 and Б2–5, Б7–9);
  - lit in the prerendered HTML;
  - switching on once, bottom to top: 0.55 s each, 0.11 s apart, both blocks of a floor together; lit at once under reduced motion;
  - the picture offset inside the frame; edge fades (:438-452);
  - new assets.
  - Where: Facade's frame and SVG, explorer.css:159-175, and a per-project facade config.
- **Phone block switch with a crop per block** — the switch exists (Facade.jsx:321-358; explorer.css:1121-1157). Needs config: crop variables per project (including a negative x), rail x, the sizes string (Facade.jsx:66), and the fades. The concept swaps between the 1400 and 2400 renders in JS (:412-418).
- **Dark line-art plan in the stage** — the mechanism exists (planModes.js:6-7). Needs config: the plan-mn asset, a drawing map per project (PlanSvg.jsx:55-59), and opacity .42/.55 (concept css/mnogofamilna.css:152-153; explorer.css:485-486 has .6/.78).
- **„План на етажа / План на апартамента“** — needs new code in UnitPanel's left half (:236-241), CSS (concept css :180-185, :223-225), the mapping and its images. Hidden when the apartment has no plan of its own; the caption swaps (concept js :828-836).
- **Date line** — a prop or config, shown while MN's origin is not 'live', in:
  - the stage meta (PlanStage.jsx:296; concept :717);
  - the unit panel (UnitPanel.jsx:259; concept :866);
  - the facade caption (Facade.jsx:415; concept :313);
  - the list and the block page's head.
- **Block page as a ledger of floors** (concept/mnogofamilna-block-a.html:70-92, js and css) — needs new code: a new page in place of BlockPage.
  - Rows from 10 down to 2. Each reuses FloorMeta, FloorCounts and FloorRange (FloorPanel.jsx:26-76) and a mini PlanSvg.
  - „Отворете плана“ calls openFloor with the rect of the row's plan (ExplorerContext.jsx:115).
  - Facade needs a 'block' mode (one crop, one rail, no panels, sheet, seam or block names), and a hot floor it can be handed from outside: hot state is internal (Facade.jsx:99).
  - Hover or focus on a row lights its floor (block-a.js:79-95).
  - On desktop, the row in the middle of the screen activates (ScrollTrigger; :125-136).
  - The facade is pinned; Б is mirrored by swapping the order (css :20-25, :30, :35).
  - Bare ?floor already works (useExplorerState.js:53).
- **The page itself** — the hero is the explorer (#explorer) and the list is its own section, #spisak (concept html:70-109). ExplorerSection's tabs-and-views layout does not fit. ?view=list should scroll to the list (concept js :1189).

### 5. Tests
- tests/contracts/availability.test.jsx:63-121 — GR block-a, floor 3: „етаж 3“, А 301…, legend, counts, no inquiry for a blocked unit. An MN variant would need MNOGO sheet stubs; today the file says MN stays built-in (:14-15).
- tests/contracts/site.jsx:96-98 with routes.test.jsx:24-31 — the MN pages' <main> must show „Многофамилна“ and „блок А/Б“. Keep.
- src/routes.test.jsx — MN titles (:74-75): keep. The dev-server case 'БЛОК B' (:93-99): change. MN 404 (:118): keep.
- legacy.prerender.test.jsx:39 and legacy.focus.test.jsx:75-117 — retire with the legacy pages.
- Explorer tests (GR fixtures, testing.js:17-42) that need MN variants:
  - floorParam.test.js:12 (1–8; '9' opens nothing);
  - geometry.test.js:22-30, :63-78;
  - model.test.js:14-29, :54-62;
  - PlanSvg.test.jsx:81 („501“);
  - PlanStage.test.jsx:64-66 (bounds), :145 (plan-a);
  - UnitPanel.test.jsx:114, :124;
  - Facade.test.jsx:44 (16 rails);
  - BlockGrid.test.jsx:20-26;
  - UnitList.test.jsx:43, :85-115;
  - ExplorerSection.test.jsx:96, :121, :276, :286;
  - useExplorerState.test.jsx:43-196 (:83-90 '?floor=9');
  - StaleNotice.test.jsx:27-56;
  - BlockPage.test.jsx:28-66;
  - BlockPage.prerender.test.jsx:27-97 (12 rows, the А 301 dialog);
  - explorer.css.test.js:37-68.
- What the MN variants should check: '10' opens and '1'/'11' do not; 8 units a floor; „101“ on floor 2; тавански meta; the date line; no Идеални row; the own-plan switch only for mapped ids; 9 lit bands of 18; real numbers in the prerendered HTML.
- Data tests: store.test.js:227-252, :395-401 (MN null after live reads; 72/72 built-in); projects.test.js:40-43; facts.test.js:19.

### Gaps

- Per-project explorer config (id, floors, perFloor, totals, unitFloor, label format, grid/crops, images, dated): the engine reads GR_FACTS/FACADE (src/config/facts.js:15-25, src/explorer/geometry.js:10-20); src/config/projects.js:79-97 is unused by it
- buildModel(data, project): src/explorer/model.js:61-64 reads only data['golden-residence']
- Static prerendered MN model from mnogofamilnaFallbackData unless MN origin is 'live': store has MN rows only in 'fallback' and IDLE on the server (src/data/availability/store.js:18-20,195-201,284)
- Per-project floor bounds 2–10 in ?floor parsing: src/explorer/floorParam.js:27
- Per-project stepper/keyboard bounds: Facade.jsx:304-305,444; FloorSheet.jsx:108,114; PlanStage.jsx:178,307,313
- Unit number = floor−1 in plan labels: src/explorer/PlanSvg.jsx:186
- Title split on the dash („А-<em>101</em>“): src/explorer/UnitPanel.jsx:73-76
- „тавански етаж“ for floor 10: FloorPanel.jsx:66-76 (FloorMeta), PlanStage.jsx:294-296, UnitPanel.jsx:212, FloorSheet.jsx:91-102 (no meta line; concept/js/mnogofamilna.js:370,540)
- Hide Идеални части when null: src/explorer/UnitPanel.jsx:252
- Dated line „по данни към 01.12.2025“ (facts.js:9) in stage meta, unit panel, facade caption, list: PlanStage.jsx:296, UnitPanel.jsx:259, Facade.jsx:415-419, UnitList.jsx:104-106
- MN list options/copy: Вид without Ателие (UnitList.jsx:27), floors 2–10 (:29), „от 144“ (:105), exposure footnote (:151)
- Project-aware PLANS: src/explorer/plans.js:5-8, used at PlanStage.jsx:15, UnitPanel.jsx:15, Facade.jsx:425,438
- Per-project plan drawing (plan-mn) and its opacity: PlanSvg.jsx:53-59; explorer.css:485-486
- Register mn-off ladder, plan-mn and the 18 apartment plans: scripts/images/sources.json:67-73 has only the sgrada1 crop; src/data/images/mnogofamilna.json:1-14
- Lights-off layer (dark twin + lit render masked to free floors' bands, lit in prerender): src/explorer/Facade.jsx:374-394
- Picture offset inside the 1200×848 grid (render at y 56.2): explorer.css:159-175 assumes picture = grid; Facade.jsx:57-63,377,387 bind GR map/FACADE at module level
- Per-project facade CSS (sw/sh/pitch factors, stage centre .504167, names, rails 71/1129, phone crop): explorer.css:128-139,147,235-236,247-248,1121-1150
- Edge fades for MN crops: no equivalent (concept/js/mnogofamilna.js:438-452)
- First-screen lights entrance (CSS, bottom→top once, RM lit): Facade.jsx:199-210 animates only below-the-fold facades
- Facade 'block' mode and externally controlled hot floor with onHot: Facade.jsx:88-99 (modes full|compact; hot internal via useHotFloor)
- Single-block rails: src/explorer/FacadeRails.jsx:15-17,27 render both blocks from GR's map
- MN block-page ledger component: src/explorer/BlockPage.jsx:38-61 is GR-only; src/routes/mnogofamilna-block.jsx:1,14,29 still renders legacy
- MN main-page route module: src/routes.js:33 points at legacy components/MnogofamilnaBlockSelection.jsx
- MN hero composition (explorer as hero, list as own #spisak section, ?view=list scrolls): ExplorerSection.jsx:160-207, useExplorerState.js:40
- Own-plan switch „План на етажа / План на апартамента“: UnitPanel.jsx:236-241; mapping from src/constants/apartmentImages.js:21-42 minus А-858/А-864
- MN inquiry: dialog preset option (ExplorerDialogs.jsx:147), picks under 'mnogofamilna' (InquiryForm.jsx:95), MN option set and copy (inquiryStore.js:36-49; InquirySection.jsx:24-50)
- MN data-age notice instead of GR-only StaleNotice: src/explorer/StaleNotice.jsx:14
- BlockGrid for 8×9 with dash labels and floor−1 numbers: BlockGrid.jsx:33-34,46,67-72,100; src/pages/golden-residence/gr.css:362
- Lens box per project (tower-wide band): Facade.jsx:70-73 vs concept/js/mnogofamilna.js:455-458
- MN routes in check-dist's MUST_BE_V2: scripts/check-dist.mjs:87
- MN test fixture (snapshot with MN rows/origins): src/explorer/testing.js:25,38
- Shell handles for the rebuilt MN pages (drop legacy, add inquiry: true): mnogofamilna-block.jsx:14; MnogofamilnaBlockSelection.jsx:461

### Risks

- parseFloorParam caps at GR_FACTS.floors (floorParam.js:27): MN floors 9 and 10 can never open, and ?floor=1 or ▼ from floor 2 (PlanStage.jsx:178,313) opens an empty floor
- Plan labels read floor+suffix (PlanSvg.jsx:186): А-101 would show „201“; BlockGrid's fallback label „А 201“ (BlockGrid.jsx:100,112) normalises to А201, a real MN unit one floor up
- The drawing is picked by plan.appliesTo.blocks[0] (PlanSvg.jsx:57): MN's shared plan lists ['А','Б'], so GR's plan-a would draw silently under MN units
- MN slots are null after every successful live read (store.js:18-20; pinned store.test.js:227-229,252): a store-driven MN model stays null and every count reads `—`; the spec wants dated numbers prerendered
- Hydration: anything decided by matchMedia (phone crop, 1400/2400 render) must wait for hydration; SVG <image> has no srcset, the concept swaps href in JS (concept/js/mnogofamilna.js:412-418)
- Facade intro returns when the facade is on screen at mount (Facade.jsx:201), so as the MN hero the lights would never play; first-screen entrances are CSS on --arrive (gr.css:768-803) and GSAP may not enter first-load JS (scripts/check-dist.mjs:21-22)
- Lit and dark renders must be pixel-aligned and graded alike: the concept's mn-on is byte-identical to the c2 mn-dusk source (home.json 'mn-dusk'), and the off twin was made from it; mnogofamilna.json's sgrada1 crop is a separate derivative, its grade not verified to match
- The concept's off twin keeps lamp glow and the courtyard gap (design note Limits; QUESTIONS.md 'My calls'): rebuild it from the 3308 master and check by eye
- MN's building map includes the render's white margins: putting the cropped render at the grid origin, as .fx__frame/.fx__pic do (explorer.css:159-175), shifts every band about 56 grid px
- GR-tuned facade CSS (explorer.css:130-136,147,247-248) is pinned by explorer.css.test.js:37-68; MN's smallest floor-centre gap is 31 grid units (Б9→Б10), not 33.5/34, so rows sized by --pitch can touch
- UnitPanel's title split needs whitespace (UnitPanel.jsx:73-76; pinned UnitPanel.test.jsx:114): „А-101“ would render whole in italics
- An MN unit's inquiry would preset 'golden-residence' (ExplorerDialogs.jsx:147); switching to 'mnogofamilna' drops the apartment pick under ruling FR4 (InquiryForm.jsx:95)
- StaleNotice keys on GR origins (StaleNotice.jsx:14): on an MN page it would say „Наличността не се зареди“ when GR's sheets fail, and nothing about MN's dated data
- Module-level GR bindings (Facade.jsx:57-60,79-83; FacadeRails.jsx:16-17; plans.js:8): per-project versions must be memoised, and useHotFloor's setHot changes with isFloor's identity (useHotFloor.js:30-36)
- Focus return and the deep-link jump assume #explorer holds the rails and the list (ExplorerDialogs.jsx:51,54; ExplorerContext.jsx:69): MN's separate #spisak list and the block page's pinned facade must be wired, or the focus falls to <body>
- M2's binding ruling keeps the phone sheet open while scrolling (docs/superpowers/notes/2026-11-16-m1-m2-rulings.md:148), but the MN concept closes it when the facade leaves the screen (concept/js/mnogofamilna.js:626-631): decide which
- The own-plan mapping is doubtful (QUESTIONS.md #11): phantom А-858/А-864 and Б-202/Б-206 reusing Б-102/Б-106 (apartmentImages.js:23,25,38-39), and getApartmentImage falls back to a photo (:45-47); never use the fallback
- Legacy files are still imported by Продажби until M4 (Projects.jsx:5,9,11) and by scripts/extract-mnogofamilna-data.mjs:11: deleting FourTowersFloorMap or apartmentImages with the MN pages breaks them
- Tests that break by design: src/routes.test.jsx:93-99 ('БЛОК B'), legacy.prerender.test.jsx:39 and legacy.focus.test.jsx:75-117; tests/contracts/site.jsx:96-98 must still pass on the new pages
- The block page's mini plans are prerendered before fit() runs: their labels use --fs's 11-unit fallback (explorer.css:453) until hydration (PlanSvg.jsx:84-95)
- FloorMeta falls back to GR_FACTS.perFloor when a floor has no units (FloorPanel.jsx:67): an MN placeholder floor would read „12 апартамента“
- Lit windows mean ≥1 free as of 01.12.2025: the caption must carry the date (concept/js/mnogofamilna.js:313); whether MN is still on sale and whether it has 9 or 10 floors are open (QUESTIONS.md #1, #2), so keep floors in one config
- Masked SVG images and animated mask rects were checked only in headless Chrome (QUESTIONS.md, last bullet): test Safari and real phones

## 2. How M2 pages are built, and what is reusable


1. ROUTE MODULE CONTRACT
- Files. Home's route module is src/pages/Home.jsx (routes.js:28), with its sections in src/pages/home/*. Golden Residence's is src/routes/golden-residence.jsx (routes.js:31), with its sections in src/pages/golden-residence/*. The M4 URLs still point at legacy files (routes.js:29-30, 39-40). /eu-proekt and /404 use src/routes/eu-proekt.jsx and not-found.jsx (routes.js:42, 50). Every route goes through page(), which makes it case-sensitive (routes.js:20). A route module must be a .jsx file under src/ (tests/contracts/site.jsx:12-19).
- Exports: default, handle and meta. There is no `links` export (Home.jsx:24, 34, 40; golden-residence.jsx:28, 37, 43; ruling C5.4, rulings.md:70). `meta` returns the full pageMeta set (title, robots, description, og:*, twitter, canonical), because React Router renders only the deepest route's meta (src/seo/meta.js:20-40). The 404 page is noindex, with no canonical link and no og:url (not-found.jsx:4-15).
- handle (src/shell/handle.js:3-24):
  - header: 'overlay' starts the page at the top with no padding (root.jsx:238); 'solid' starts it below the header.
  - project: the header's „Запитване“ goes to /contact?project=… (handle.js:35-37).
  - inquiry: the header's „Запитване“ goes to #zapitvane (handle.js:41-43).
  - legacy: light ground and no grain (root.jsx:238, 243).
  - Current values: Home {overlay, inquiry}; GR {overlay, project, inquiry}; eu-proekt and 404 {solid} (eu-proekt.jsx:19; not-found.jsx:17); the legacy pages {solid, legacy} (About.jsx:888; Blog.jsx:781; Contact.jsx:536; Projects.jsx:1478).
- Composition:
  - Home: SeamIntro, SplitHero, CompanySection, ServicesSection, WorksSection, TeaserSection, InquirySection page="home", EuPosterSection (Home.jsx:43-52).
  - GR: ExplorerProvider{GrHero, StorySection, ExplorerSection, BlocksSection, GallerySection, ParkingSection, InquirySection page="golden-residence"} (golden-residence.jsx:46-54).
  - Section idiom: `<section ref className="sec …" id aria-labelledby>` plus useReveals(ref) (CompanySection.jsx:15-19; ServicesSection.jsx:51-53, 70).
- CSS:
  - Global: root.jsx:16 imports src/index.css, which @imports fonts, diptych, shell and motion (index.css:1-4) and holds the tokens (index.css:17-57).
  - Page CSS is imported by the route module (Home.jsx:14; golden-residence.jsx:13). It is plain CSS in no Tailwind layer, loaded after the site's (home.css:17-18; gr.css:17-20).
  - Component CSS is imported by its component (InquirySection.jsx:7; StatusSwatch.jsx:2; Facade.jsx:15; PlanSvg.jsx:8).
  - The current build emits one CSS chunk per route. build/client/index.html links root + Home + a shared StaleNotice-*.css (explorer, inquiry and status styles). about/index.html links root + About. eu-proekt and 404 link only root.
  - Critical CSS is inline: body onyx/ivory (root.jsx:41-44, 70).
  - Vitest runs with css:false (vite.config.js test block), so the CSS tests read the files through postcss (src/test/css.js:6-19, 44-108).
- Data:
  - The page calls preloadWithDocument([availabilityPreload, ...DISPLAY_FONT_PRELOADS]) while it renders (Home.jsx:30, 41; golden-residence.jsx:34, 44). It writes the head links only during prerender (documentPreloads.js:6-28).
  - useAvailability uses useSyncExternalStore and reads 'idle' on the server and while hydrating (useAvailability.js:9-29). The first subscriber starts the load (store.js:265-275), and counts show „—“ until then (SplitHero.jsx:181; GrHero.jsx:64).
  - Selectors: grFree, spotUnits, apartmentUnits (select.js:44, 54, 81). Fixed facts: GR_FACTS and MNOGO_DATED (facts.js:9-25), and SITE (site.js).
  - The menu reads availability too (SiteMenu.jsx:71).
- Tests each page has:
  - <page>.prerender.test.jsx (node environment): App as root with the page as its child, plus its handle, in createMemoryRouter, then renderToString, then parsed in JSDOM (home.prerender.test.jsx:22-25). It checks: no window; one H1; live counts „—“; section ids in order; the first state of interactive parts; the form ready to fill; no inline opacity, transform, clip, visibility or 0 size; preload links present (home.prerender.test.jsx:37-109; gr.prerender.test.jsx:36-168).
  - <page>.hydration.test.jsx: mocks motion/runtime, then renderToString, mockMatchMedia({fine:true}) and hydrateRoot. It expects zero onRecoverableError and zero console.error (home.hydration.test.jsx:19-62; gr.hydration.test.jsx:82-146, including ?view=list).
  - <page>.test.jsx: renderSiteAt plus goOffline (site.jsx:44-70). It checks copy, order, glides, nbsp binding and "adds no preload in the browser" (home.test.jsx:120-123; gr.test.jsx:339-342).
  - <page>.css.test.js: firstViewportMotionProblems(path, heroSelectors) plus rule pins (home.css.test.js:26-79; gr.css.test.js:22-40; css.js:108).
  - Motion paths: recordingMotion, stubIdle and mockMatchMedia (gr.motion.test.jsx:1-40; src/test/gsap.js:28, 85).
  - The handle of every route is pinned in shell.test.jsx:216-247.

2. CSS AND MOTION
- Tokens (index.css:17-57):
  - colours: onyx, umber, ivory, stone, hair, hair-ctl, brass, brass-l, status;
  - --gut;
  - eases: --e-out, --e-soft, --e-io, --e-in;
  - --serif and --sans;
  - sizes: --fs-slogan, --fs-title, --fs-h2, --fs-h3, --fs-motto, --fs-lead;
  - header heights --eu-h, --bar-h, --header-h (index.css:287-299);
  - .site-wrap (index.css:216-218).
- diptych.css, in Tailwind's components layer, global:
  - .serif, .h2, .h3, .num, .lead, .small, .tab (16-29);
  - em is the brass italic (35-40);
  - .btn, .btn--solid, .btn--sm, .link, .arr, with hover only on a fine pointer (44-96);
  - .on-light (102-105) and .legacy-ground (132-148);
  - .seam (154-165);
  - .sec padding: clamp(96 px, .16 of the screen, 180 px), 88 px on a phone (170-173, 205);
  - .split (176-181);
  - .hinge: the title right-aligned to the seam, the lead after it, the seam overshooting by 18 px, the lead with text-wrap: pretty (183-199). At 900 px and under it stacks, the seam hides and the lead sits under a brass rule (204-213);
  - .line-mask and .split-line-mask (218-231).
- <Seam draw?/> renders span.seam[data-draw], aria-hidden (Seam.jsx:8-16). The hinge idiom is `<div class="hinge"><h2 class="h2" data-split>…<em/></h2><p class="lead" data-fade/><Seam draw/></div>` (ServicesSection.jsx:71-79).
- Reveals (useReveals.js:22-63):
  - data-split: SplitText with words,lines and masked lines; lines rise 112 % over 0.9 s expo.out, 0.1 s apart, at top 88 %, and the split is reverted when they land.
  - data-fade: from opacity 0 and 16 px below, over 1 s, at top 92 %.
  - data-draw: scaleY over 1.3 s when the parent reaches top 82 %.
  - Only elements below the fold when the setup runs (:26-27).
  - There is no data-wipe and no horizontal draw; the concept has both (core.js:206-217).
- useMotion(ref, setup, deps) (useMotion.js:26-67):
  - gated by useMotionAllowed;
  - the engine is imported after the window's load (runtime.js:82-101);
  - one setup per idle period, in a gsap.context scoped to ref, with one ScrollTrigger.refresh when the queue drains (runtime.js:118-142);
  - reverted on unmount.
  - The engine (GSAP, ScrollTrigger, SplitText, Lenis) is imported only by engine.js (engine.js:1-20).
  - useMotionNow() is for motion that follows an action (useMotionNow.js:13-16).
- Section setups:
  - services rise (ServicesSection.jsx:59-67);
  - story wipes through ScrollTrigger onToggle, with a CSS sticky half and no pin (StorySection.jsx:237-274);
  - the gallery stage opens once (GallerySection.jsx:168-182), and its spreads open through useMotionNow (:119-158);
  - works covers (WorksSection.jsx:85-162);
  - block squares (BlockGrid.jsx:47-58);
  - the menu (SiteMenu.jsx:77-120).
- The first viewport is CSS only. Its masks are authored by hand in markup (GrHero.jsx:31-37; SplitHero.jsx:95-101; HeroTitle.jsx:174-190). The page's CSS animates them under `:root.js`, inside prefers-reduced-motion: no-preference, with delay var(--arrive) and the starting states only in the keyframes (gr.css:768-819; home.css:1075+).
- Flip ships inside gsap (package.json:27). Its lazy loader loadFlip (flip.js:17-30) is imported only by explorer/surfaces.js (:1, 29, 36). check:dist allows one Flip chunk of at most 10 KiB, never in first-load JS (check-dist.mjs:120-122, 365-380).
- Doors:
  - <ViewTransition key={page} enter="page-in" exit="page-out" default="none"> (root.jsx:135-160);
  - door-close 400 ms, door-open 600 ms at 520 ms, the seam glint (motion.css:53-95); a 200 ms crossfade without motion (:49-51);
  - vt-cut makes the hero move and Back/Forward instant (:66-84; viewTransition.js:19, 87);
  - header, menu and grain are groups of their own (:97-125).
  - PageFrame keeps data-arrive, which sets --arrive: 0 s for the first page, .52 s behind the doors, 0 s for hero and pop, .95 s under the intro (motion.css:41-44). It focuses the hash target, else #main (root.jsx:180-195).
- Legacy ground: handle.legacy gives <main class="on-light legacy-ground"> and no grain (root.jsx:238, 243). The frame paints #fafafa (diptych.css:132-148), and focus rings are onyx (index.css:105-111).
- Gate: MOTION_GATE_SCRIPT adds `js` (and `intro` on Home's first load in a session) (motionGate.js:74; root.jsx:67-68).
  - CSS reads `:root.js` and Tailwind's `js:` variant (tailwind.config.js:231).
  - JS mirrors it in useMotionAllowed (:36-41).
  - The reduced-motion clamp is index.css:145-150. The no-motion fades are `:root:not(.js)` rules with !important, after the clamp (index.css:156-158; home.css:593-606).

3. REUSABLE PIECES (props; generic or page-specific)
- Hinge: CSS markup only, generic (diptych.css:183-213). There is no component.
- GR gallery spreads: GallerySection takes no props. SPREADS, the heading and the ids are hard-coded (GallerySection.jsx:28-44, 213-227) and its CSS is gr.css:437-527. GR-only.
- Closing pair of ways: `nav.ways` markup inline in the teaser (TeaserSection.jsx:54-65), CSS home.css:796-842. Home-only.
- Works list (Обекти on Home): WorksSection takes no props.
  - Six works hard-coded (WorksSection.jsx:28-56).
  - Covers are home.json's work-*, production photos from src/assets/projects (sources.json:258-311).
  - Wipe stack (WorksSection.jsx:85-170); CSS home.css:667-795.
  - Legacy /blog has 7 works with year, type, description, features and photos (Blog.jsx:125-201).
- Нашите услуги: ServicesSection takes no props. SERVICES and the home.json svc-* images are hard-coded (ServicesSection.jsx:22-46); CSS home.css:421-666. Home-only.
- Story/founding: CompanySection #za-nas takes no props. Motto, story, triad and facts-row are inline (CompanySection.jsx:14-61); CSS home.css:326-420.
- EU poster: EuPosterSection #es-proekt takes no props. The poster is a Vite asset (EuPosterSection.jsx:1, 115-176); CSS home.css:844-906.
- Inquiry:
  - InquirySection({page}): COPY has only home and golden-residence, falling back to home (InquirySection.jsx:24-54). The ids #kontakti, #zapitvane and #contact-h are fixed (:58-61). It clears the option on unmount (:53) and imports inquiry.css (:7).
  - InquiryForm({page}): its options come from INQUIRY_OPTIONS[page] (InquiryForm.jsx:91-94; inquiryStore.js:36-49). Button „Изпратете запитване“ (:258), thank-you „Благодарим ви.“ (:269).
  - presetInquiry glides to #zapitvane and focuses #f-name (inquiryStore.js:21-28, 85-112).
  - buildLead sends budget '' (services/inquiry.js:43-62).
- Facts pairs:
  - GR hero facts across a seam (GrHero.jsx:55-67; gr.css:109-140, 665-684, 793-807). GR-only.
  - Home's facts-row (CompanySection.jsx:44-57; home.css:398-418).
  - GR's .kv (StorySection.jsx:133-159; gr.css:264-285).
  - The poster facts (home.css:885-899).
- Footer quick links: SiteFooter maps NAV (SiteFooter.jsx:93-104; nav.js:3-9). Generic; CSS shell.css:436-525.
- Menu: SiteMenu is a portal. PAGES = Начало, Golden Residence (live count), then the rest of NAV (SiteMenu.jsx:45, 145-206). currentFor marks the current page (nav.js:16-20). CSS shell.css:294-435.
- Other generic pieces:
  - Button (Button.jsx:51-79);
  - ResponsivePicture and RollingNumber;
  - the Status* components with status.css;
  - StaleNotice (its styles are in explorer.css:102-115);
  - useScrollLock, trapTab, useSwipe;
  - format.plural, formatArea, bindAddress; mapsUrl.
  - BlockGrid is built for GR's 12×8 blocks (BlockGrid.jsx:32-33, 66-75).

4. IMAGES
- Manifests: src/data/images/{golden-residence(19), home(10), mnogofamilna(1), shell(2)}.json. Each entry is {path:'/img/<id>', w, h, widths, color}, and the JSON is imported into route JS.
- Pipeline: scripts/images/build-images.mjs (`npm run images`, package.json:16) reads sources.json (:122-131).
  - Encoded entries: optional crop, widths no wider than the source, AVIF q50 and WebP q74 (:13-14, 43-66).
  - 'copy' entries copy pre-encoded ladders (:68-101).
  - `git:<ref>:<path>` sources are read with git show (:32-37).
  - Output: public/img/<id>-<w>.{avif,webp} (:58, 103-112). Each group's manifest is rewritten (:113-118).
  - Existing outputs are skipped unless --force (:54-55).
  - The dominant colour is computed over #F1F2EF (:21-29).
- Machine-specific sources:
  - absolute C:/ksm-stroy/golden-residence/... paths (sources.json:6, 13, 20, 33, 46, 58);
  - absolute C:/ksm-stroy/design/2026-11-14-concepts/c2-diptych/img/... paths (:107-256);
  - git:origin/vidimost-es refs (:87, 97);
  - repo paths only for MN and the six works (:69, 261-306).
  - Every encoded source is read on every run (:44), and a missing 'copy' file throws (:72).
- Grading: none in the pipeline.
  - CSS grades instead: services brightness(.66) (home.css:478). Home's works covers have no grade.
  - The M4 concepts use --grade saturate(.5) sepia(.2) brightness(.74) contrast(1.08) (concept obekti.css:97; za-nas.css:14). The notes say it "would become graded image derivatives" (m3m4-concepts.md:1081).
- ResponsivePicture({image, alt, sizes, priority, eager, className, imgClassName, art}) (ResponsivePicture.jsx:112-154):
  - AVIF then WebP sources, the largest WebP as the <img> with its w and h;
  - lazy unless priority (fetchpriority high) or eager;
  - colour placeholder until it loads; art direction through `art`.
- public/img is committed (158 files).
- Steps to add a page's images:
  1. Add {id, group, src (a repo path), widths, crop?, quality?, kind?} to sources.json.
  2. Run `npm run images` on this machine.
  3. Commit public/img/<id>-* and src/data/images/<group>.json.
  4. Render `<ResponsivePicture image={m[id]} sizes=…/>`.
  - Ids must differ even ignoring case (ruling F7, rulings.md:63).

5. A NEW PRERENDERED ROUTE NEEDS
- A src/routes.js page() entry (routes.js:20, 27-51).
- react-router.config.js prerender (:18-32). /about, /projects, /contact, /blog, /eu-proekt and /404 are already listed.
- check:dist: MUST_BE_V2 holds /, GR, both GR block routes, /eu-proekt and /404 (check-dist.mjs:81-87). Other routes are classed by fingerprint (framerAppearId, swiper-slide; :89-95). Any route without legacy code fails over 160 KiB, listed or not (:204-229).
- Contracts:
  - ROUTES (site.jsx:89-100): /about must show „основана през месец септември 2008“; /projects GR and Многофамилна; /blog „Айвазовски Парк“.
  - routes.test.jsx:24-39: /contact needs a textbox /съобщение/ and a button /изпрати/.
  - eu-visibility PAGES (eu-visibility.test.jsx:42-50).
  - contact-form.test.jsx imports src/pages/Contact (:5).
- Smoke:
  - VISITS are every config.prerender path plus deep links (smoke.mjs:142-158).
  - Each visit checks one H1 with JS off (:41-42), unused preloads (:92-94) and the stale-data notice (:19-22).
  - /about runs the scroll lock (:170), and /contact has an onyx focus-ring stop (:178-192).
- Sitemap and robots come from config.prerender minus /404, in production only; 404.html is copied from /404 (postbuild.mjs:17-39).
- vercel.json has nothing per route (trailingSlash :5; redirects :29-36).
- Tests to update: the shell.test.jsx HANDLES rows (:216-232) and the legacy test rows.

### Gaps

- The data-wipe reveal (photo opens from the seam; used 5× on За нас, 2× on Продажби, 1× on Контакти) is missing: src/motion/useReveals.js:29-61 (concept core.js:210-217).
- There is no Ways component, and the .ways CSS is Home-only: src/pages/home/home.css:796-842, src/pages/home/TeaserSection.jsx:54-65.
- The concepts' desktop hinge gutter rule (@media min-width 901px padding-left/right var(--gut)) is missing from src/styles/diptych.css:185-194.
- The gallery spreads need props and shared CSS before another page can reuse them: src/pages/golden-residence/GallerySection.jsx:28-44,213-227; gr.css:437-527.
- No shared works data source for 7 works with description, features and photo lists: src/pages/home/WorksSection.jsx:28-56 vs src/pages/Blog.jsx:125-201.
- No image entries or manifests yet for Обекти's photos or За нас's (slider01-03, traditions, hotel card): scripts/images/sources.json:258-311; src/pages/About.jsx:11-15.
- The photo grade (a graded derivative or a CSS --grade) is not in the pipeline: scripts/images/build-images.mjs:43-66.
- Контакти needs a form variant (subjects as a radio group, the build group with Тип проект and Бюджет, 'contact' options): src/components/inquiry/inquiryStore.js:36-49; InquiryForm.jsx:91-94.
- projectType and budget must pass through for the build subject: src/services/inquiry.js:43-62 (budget '' at :52, 'Не е посочен' at :59).
- /contact needs ?project and ?apartment prefill after hydration, with a preset that does not glide: inquiryStore.js:106-117; src/hooks/useHydrated.js:17-19.
- Project slugs must map to option values: handle 'mnogofamilna-sgrada' (src/shell/handle.js:7,35-37) vs option 'mnogofamilna' (inquiryStore.js:31).
- inquiryHref has no #zapitvane, though the concepts land the header's „Запитване“ on the form: src/shell/handle.js:35-37.
- Продажби needs a generic sales board (GR 2×12×8, MN 2×8×9); BlockGrid is built for 12×8: src/explorer/BlockGrid.jsx:32-33,66-75.
- StaleNotice's styles live in explorer.css, so a page without the explorer needs them moved: src/explorer/explorer.css:102-115.
- The down-arrow action („Изтегли плаката (PDF)“ ↓) does not exist; Button only draws →: src/components/ui/Button.jsx:43-49.
- Add /about, /projects, /blog and /contact to MUST_BE_V2: scripts/check-dist.mjs:87.
- Update the HANDLES rows and the light-ground case that uses /about: src/shell/shell.test.jsx:216-232,253-260.
- Retire the legacy test rows: src/pages/legacy.prerender.test.jsx:37-55; src/pages/legacy.focus.test.jsx:37-117.
- The spec must say how the Contact contract test changes: tests/contracts/contact-form.test.jsx:5,20,44-60,77-97; src/routes.test.jsx:33-39.
- Re-point the smoke checks that assume legacy /about and /contact: scripts/smoke/smoke.mjs:170,178-192.
- Fix the og:image of the rebuilt pages: /about and /contact point at missing /assets/images/001.jpg and 003.jpg (src/utils/seo.js:17,33); /blog and /projects use legacy asset imports (Blog.jsx:785-790; Projects.jsx:1482-1487).
- End-of-M4 legacy removal: handle.legacy and .legacy-ground (src/root.jsx:228-243; src/styles/diptych.css:107-148); framer-motion and swiper deps (package.json:26,34); vite optimizeDeps; LEGACY_LIBRARIES (check-dist.mjs:89-95).
- Each of the six pages needs prerender, hydration, css and motion tests on the M2 pattern: src/pages/home/home.prerender.test.jsx:22-25; home.hydration.test.jsx:19-62.
- If the Контакти open/closed hours line is kept, it needs a helper that renders only after hydration: src/hooks/useHydrated.js:17-19; src/config/site.js hours.

### Risks

- GR's first-load JS is 159.9 KiB, 90 B under the 160 KiB budget (m2-results.md:105). Any byte added to a shared first-load module (useReveals, Button, Seam, inquiryStore or InquiryForm, root, shell) fails check:dist on GR (check-dist.mjs:222-224).
- A Home or GR section reused on another route renders unstyled: its CSS ships only in that route's chunk (home.css, gr.css). The current build links Home-*.css on / only and About-*.css on /about.
- InquiryForm on its own loads no styles: only InquirySection imports inquiry.css (src/components/inquiry/InquirySection.jsx:7).
- InquirySection's ids are fixed (#kontakti, #zapitvane, #f-name), so a page can have only one. presetInquiry targets them (inquiryStore.js:25-26).
- .hinge child order matters: heading, then lead, then Seam. The :first-child and :nth-child(2) rules position them (diptych.css:192-193).
- Never use data-split or useMotion in the first viewport: useReveals skips anything already on screen (useReveals.js:26-27). Author the masks by hand and animate them in page CSS under :root.js, inside no-preference, with var(--arrive) and the starting states only in keyframes (src/test/css.js:108).
- The concepts gate their openings on `html.in` after fonts load. Do not port that: use --arrive and data-arrive (motion.css:41-44).
- Port the shell from built src/shell, never from the concept HTML (m3m4-concepts.md:432-447).
- Preload only what the page uses at load. The EU H1 has no italic word, so do not preload ksm-display-italic; preload availability only on pages that read it at load. An unused preload is a Chrome warning and fails smoke (fontLinks.js:38-40; smoke.mjs:92-94).
- Query params, the open/closed hours line and dates must render only after useHydrated. The hydration tests fail on any console.error (home.hydration.test.jsx:58-59).
- Contracts change only where the plan says (plan :49-55; rulings.md:13). The built form's „Изпратете запитване“ and „Благодарим ви.“ fail /изпрати/ and /изпратено успешно/ (InquiryForm.jsx:258,269; contact-form.test.jsx:20,59), and the [ТЕСТ] prefix changes projectType (services/inquiry.js:44-45).
- The /about contract needs „основана през месец септември 2008“ in <main> text; it must survive the lineage figure's spans (tests/contracts/site.jsx:91).
- 404: keep the H1 „Тази страница я няма в чертежа.“ and keep 'Golden Residence', 'Многофамилна' and 'КСМ Строй ООД' out of <main> (routes.test.jsx:16,54-55; smoke.mjs:120).
- NotFound is also rendered inside the block routes, so any 404 CSS or JS lands in the GR block chunks (155.2 KiB) (BlockRoute.jsx:45-48; golden-residence-block.jsx:4-5).
- EU contract: the H1's accessible name must be exactly „Дигитализация на предприятията“, each budget line one run of text, and exactly one „Изтегли плаката (PDF)“ link (eu-visibility.test.jsx:52-68).
- build-images runs only on this machine (absolute C:/ksm-stroy paths, the origin/vidimost-es ref). Deleting the legacy src/assets/projects photos breaks it (sources.json:258-311; build-images.mjs:44,72).
- Image ids that differ only by case collide in public/img and serve 404s on Vercel (rulings.md:63).
- Manifests are bundled into route JS: a 93-photo Обекти manifest adds first-load bytes (all manifests are 5.2 KB today).
- The placeholder colour comes from ungraded pixels, so a CSS grade never reaches it (build-images.mjs:21-29; ResponsivePicture.jsx:133-136).
- Tailwind purges components-layer classes it does not find in src/**/*.js(x); a class added only at runtime must be safelisted (tailwind.config.js:9-15).
- Overlays such as Обекти's book must portal to <body> and use useScrollLock, data-lenis-prevent and trapTab, as the menu does (SiteMenu.jsx:72,130,145-153).
- Reach Flip only through loadFlip; gsap/* may be imported only inside src/motion (plan :65; check-dist.mjs:369-372).
- At 1440 px the concepts' titles use seven sizes, while the system has two (--fs-slogan, --fs-title). Snap them to those (index.css:49-50; m3m4-concepts.md:1141).
- Bind word pairs with U+00A0, not the concepts' .nb spans, so SplitText keeps them together (diptych.css:195-199; commit 8b09bcd pins the escape).
- Each component writes its own phone stacking rule for its .split halves; diptych.css has none (diptych.css:201-203).
- Removing the legacy ground breaks the smoke's /contact onyx-ring stop and shell.test's /about case (smoke.mjs:178-192; shell.test.jsx:253-260).

## 3. Inquiries and Контакти


Paths: repo files are relative to C:/ksm-stroy/ksm-stroy-v2. kontakti.html, kontakti.js (js/), kontakti.css (css/), mnogofamilna.html, mnogofamilna.js (js/), za-nas.html, prodazhbi.html, obekti.html and QUESTIONS.md are under C:/ksm-stroy/design/2026-11-16-m3m4-concepts. Nothing was modified and no test suite was run. One node check of the contract-test regexes was run.

1. THE V2 INQUIRY FORM
- Props. The form takes one prop, page (default 'home') (src/components/inquiry/InquiryForm.jsx:91). Its options are INQUIRY_OPTIONS[page], falling back to home (:92).
- InquirySection takes the same page prop (InquirySection.jsx:50). It renders section#kontakti, with #zapitvane as its left half (:58-60).
  - Copy exists only for 'home' and 'golden-residence' (:24-48); any other page falls back to home (:54).
  - Phones come from SITE (:55, :67-72). The email shows only on GR (:46, :73-77).
  - Hours are SITE.hours.join(', ') (:78-80).
  - It imports inquiry.css (:7) and clears the store's option on unmount (ruling C5.1, :53).
  - Used at Home.jsx:50, routes/golden-residence.jsx:53 and explorer/BlockPage.jsx:58.
- Subject. A single <select id="f-project"> labelled „Интересувам се от“ (InquiryForm.jsx:218-227).
  - Options are {value, label, subject} (inquiryStore.js:30-49).
  - home: golden-residence („Golden Residence, жк Левски Г“, subject „Golden Residence“), mnogofamilna („Многофамилна сграда, ж.к. Връбница-1“), build („Строителство или ремонт“), other („Друго“).
  - golden-residence: golden-residence („Апартамент в Golden Residence“), garage (subject „Golden Residence, гараж или паркомясто“), mnogofamilna, other.
  - If the store's option is not offered, the first option is used (InquiryForm.jsx:94).
- Store. Module-scope, read with useSyncExternalStore. Its server snapshot is EMPTY, so the prerender and hydration show no picks (inquiryStore.js:51-72).
  - presetInquiry({option, pick}) merges into the state and always glides to #zapitvane (reveal f-name). It waits up to 500 ms for scroll locks and focuses f-name 1.5 s later (:85-112).
  - chooseInquiryOption (:115-117), removePick (:119-121), resetInquiry (:124-127). clearInquiryOption keeps the picks (:135-138).
  - Callers: SplitHero.jsx:64 (mnogofamilna), ParkingSection.jsx:49 (garage), ExplorerDialogs.jsx:147 (golden-residence plus the unit label).
- Picks (ruling FR4). Picks show and are sent only while the chosen option is golden-residence or garage (InquiryForm.jsx:95; docs/superpowers/notes/2026-11-16-m1-m2-rulings.md:151). Under any other subject they are hidden but stay in the store (InquiryForm.jsx:21-26).
  - Chips: ul.chips[role=list][aria-labelledby=f-picks], each „Апартамент {id}“ with a × labelled „Махнете {id}“ (:228-244).
  - After ×, focus goes to the next chip, else the previous one, else #f-project (:148-154).
- Validation. The form is noValidate. Errors show after the first submit and then follow typing.
  - Name: at least 2 characters after trimming. Phone: at least 6 digits.
  - Email: the proxy's pattern (services/inquiry.js:18). A Cyrillic or xn-- domain gets the Latin-letters message.
  - Consent is required; the message is optional (InquiryForm.jsx:35-41, :55-67).
  - Each error is p.field__err#{id}-err, with aria-invalid and aria-describedby on the field. Focus goes to the first invalid field in the order name, phone, email, consent (:52-53, :69-77, :159-165).
- Consent. #f-consent: „Съгласен съм КСМ Строй да използва данните ми, за да отговори на запитването.“ (:42, :249-255). It is client-side only and never sent (:168-175).
- States: idle, sending, sent, failed (:100-101).
  - Sending: the form gets aria-busy, the button aria-disabled and the label „Изпращане...“. A second submit is ignored (:158, :187-198, :257-259).
  - Sent: resetInquiry runs and the message clears; the other values stay (:177-181). The form is hidden and #f-thanks (role=status, tabIndex -1) takes the focus. The page glides to it if it is off screen, and it rises in (:120-139, :196, :267-274). A new preset brings the form back (:111).
  - Failed: role=alert „Запитването не беше изпратено. Опитайте отново или се обадете на +359 887 886 166.“ The values stay (:182-184, :261-265).
- Sending (services/inquiry.js, buildLead :43-64).
  - projectType is the subject, or „subject – picks“ (:44). It is prefixed „[ТЕСТ] “ unless IS_PRODUCTION_BUILD is set (:45; vite.config.js:111; src/seo/stage.js:16-21).
  - budget is '' for Odoo (:52) and „Не е посочен“ for EmailJS (:59).
  - The message is trimmed; under 10 characters it gains „Запитване за: {projectType}“ (:46-49). Name, email and phone are trimmed (:50).
  - EmailJS params: from_name, from_email, reply_to, phone, project_type, budget, message, to_email (:53-62). It uses Contact's service, template and key constants (:22-27) and loads the EmailJS chunk lazily (:67-70).
  - The lead goes to POST /api/odoo-lead as JSON (:74-82).
  - Both go through allSettled. Only EmailJS decides ok; a CRM failure goes to console.error only (:89-98).
- Tests.
  - InquiryForm.test.jsx: labels :56-62, validation :64-134, payload :137-151, thank-you and failure :153-171, subjects and FR4 :173-207, busy state :212-243, below-fold glide :248-266, motion :271-293, C5.1 :300-309, presets :311-339.
  - inquiryStore.test.js: options :18-32, store :34-80, glide :86-170.
  - services/inquiry.test.js: six keys :21-25, [ТЕСТ] :27-31 and :87-92, message top-up :33-37, EmailJS :39-42 and :81-85, pattern parity with the proxy :46-49, failure paths :94-113.
  - inquiry.css.test.js:19-92.

2. THE LEGACY CONTACT PAGE
- Fields (react-hook-form, src/pages/Contact.jsx:3, :18-33).
  - „Име и фамилия *“: required, at least 2 characters (:286-306).
  - „Имейл адрес *“: required, the proxy's pattern (:311-332).
  - „Телефон“: optional, /^[+]?[0-9\s-()]{8,}$/ (:336-355).
  - „Тип проект“ (:362-374) and „Бюджет“ (:378-390).
  - „Съобщение *“: required, at least 10 characters (:395-416).
  - Submit: „Изпрати съобщение“, then „Изпращане...“ while sending (:420-444).
  - No consent and no [ТЕСТ] tag.
- Тип проект options (:171-178; empty choice „Изберете тип проект“ :370): Жилищно строителство, Комерсиални проекти, Индустриални обекти, Ремонти и реновации, Архитектурно проектиране, Консултантски услуги.
- Бюджет options (:180-186; empty choice „Изберете бюджет“ :386): „До 50,000 лв“, „50,000 - 100,000 лв“, „100,000 - 500,000 лв“, „500,000 - 1,000,000 лв“, „Над 1,000,000 лв“.
- Payload.
  - Odoo gets the six raw fields (:38-57).
  - EmailJS gets the same eight variables, with „Не е посочен“ for an empty phone, project_type or budget (:64-85).
  - Both are sent in parallel; the email decides what the visitor sees (:87-101).
  - Success: „…изпратено успешно…“, then a scroll to the top and the message hides after 5 s (:103-110, :269). Error: „Възникна грешка…“ (:113).
  - The page reads no query string (:1-6; docs/superpowers/notes/2026-11-14-m2-platform-map.md:9).
  - It has an sr-only H1 „Контакти“ (:204), handle legacy (:536) and meta from seoData.contact (:539-544).
- tests/contracts/contact-form.test.jsx: what must change.
  - The SUCCESS (/изпратено успешно/) and FAILURE (/грешка/) regexes (:21-22).
  - The submit button lookup /изпрати/i (:59, :103). It does NOT match „Изпратете запитване“ (checked with node).
  - fillAndSend (:43-61) must choose „Строителство или ремонт“ before using /тип проект/ and /бюджет/, and must tick consent. The label regexes stay unique against the v2 and concept labels.
  - The expected projectType and budget values (:88-95). Tests are not a production build, so projectType carries „[ТЕСТ] “.
  - The import path (:5) if the page module moves.
- contact-form.test.jsx: what must stay.
  - One POST to /api/odoo-lead (:81-84).
  - Exactly six keys (:87) and no company key (:96).
  - Nothing sent while the form is invalid (:99-110).
  - Success only once EmailJS resolves (:114-130), and still success when the CRM answers 502 or cannot be reached (:132-152).
  - Failure when EmailJS rejects, even if the CRM accepted (:154-164).
  - The EmailJS service, template, key and the eight variable names (:169-188).
- tests/contracts/routes.test.jsx:33-39: the textbox lookup /съобщение/i (:36) stays. The button lookup /изпрати/i (:37) must change.
- Other pins on the legacy page:
  - src/pages/legacy.prerender.test.jsx:53 (one H1, „Контакти“).
  - src/pages/legacy.focus.test.jsx:64-71.
  - src/shell/shell.test.jsx:228 (the handle).
  - The smoke focus-ring stop „Изпрати съобщение“, onyx ring (scripts/smoke/smoke.mjs:186-192).
  - The smoke visit /contact?apartment=%D0%90%20301 (:146) checks a 200, hydration and one H1. It also checks that the EU link is visible and that scrollY is 0 for a visit with no dialog (:348, :478-482).

3. API/ODOO-LEAD.JS (read only)
- It reads only name, email, phone, projectType, budget and message. Non-strings become ''. Each is trimmed and cut to 200/250/50/200/100/5000 characters (:26-33, :47-48, :222-229). Other keys are ignored (:217-220).
- It answers 400 and creates no lead when the name is under 2 characters, the email fails the pattern, or the message is under 10 characters (:50-64, :231-234).
- projectType:
  - empty becomes „Общо запитване“ (:67);
  - the lead title is „Запитване от сайта: {projectType} — {name}“ (:72);
  - the custom field „Тип проект“ gets the same value (:87).
- budget goes only to the custom field „Бюджет“, with empty becoming „Не е посочен“ (:88). It never appears in the title.
- Fixed fields:
  - description is the message (:75);
  - phone is sent only if given (:77-79);
  - the sales team id (:81-83);
  - „Източник“ is always „Форма за контакт - ksmstroy.com“ (:89);
  - „Изпратено на“ is the send time (:90).
- An Odoo failure answers 502 (:243-251).
- Pinned by tests/contracts/odoo-lead.test.js:116-150 and :177-203; its sample uses the legacy values (:17-18).
- What this allows:
  - Тип проект can ride inside projectType, which becomes both the title and the custom field, e.g. „Строителство или ремонт – Жилищно строителство“. That matches the picks' „ – “ join (services/inquiry.js:44).
  - The range can go in budget (the custom field and the EmailJS budget).
  - No proxy change is needed. This is the concepts' stated default (QUESTIONS.md:49; docs/superpowers/notes/2026-11-16-m3m4-concepts.md:524).
  - The concept itself sends nothing (kontakti.js:6-7, :300-305).

4. LINKS, PREFILL, T7A, FR2
- The handle contract (src/shell/handle.js:3-22; inquiryHref :35-37; inquiryTarget :41-43):
  - `project` sends „Запитване“ to /contact?project=…;
  - `inquiry` sends it to #zapitvane.
  - The header renders a '#…' target as a Button href, which glides in place (src/utils/scroll.js:111-126), and anything else as a Link (SiteHeader.jsx:67, :98-100; diptych spec :400).
- Where „Запитване“ goes today:
  - #zapitvane on pages with an inquiry: Home.jsx:24, routes/golden-residence.jsx:28, routes/golden-residence-block.jsx:17.
  - /contact?project=mnogofamilna-sgrada on the MN pages (MnogofamilnaBlockSelection.jsx:461, routes/mnogofamilna-block.jsx:14), pinned at shell.test.jsx:106.
  - /contact everywhere else (shell.test.jsx:48, :103, :131).
- Other links to /contact:
  - The menu has no inquiry link. Its NAV entry „Контакти“ goes to /contact (src/shell/nav.js:8; SiteMenu.jsx:45, :160-167).
  - The footer's quick links do the same (SiteFooter.jsx:73-84).
  - Plain /contact links: About.jsx:858, Blog.jsx:395 and :404, Projects.jsx:294 and :301, routes/not-found.jsx:22.
- #zapitvane today:
  - It is the left half inside section#kontakti (InquirySection.jsx:58-60) and the store's glide target (inquiryStore.js:25-26).
  - Linked from GrHero.jsx:72, ParkingSection.jsx:93 and SplitHero.jsx:193. Nothing links to #kontakti.
- #zapitvane in the concepts:
  - On Контакти it is the whole section, holding form#kontakti-form (kontakti.html:115-116), and the header CTA points to it (:75).
  - The in-page links „Изпратете запитване“ and „Получете безплатна оферта“ focus „Име“ after the 1.5 s glide (kontakti.html:109, :246; kontakti.js:323-325).
- Links from the other M4 concepts:
  - The header CTA goes to kontakti.html#zapitvane (za-nas.html:69, prodazhbi.html:71, obekti.html:70, eu-proekt.html:69, 404.html:62).
  - Project buttons go to ?project=golden-residence and ?project=mnogofamilna-sgrada (prodazhbi.html:175-176).
  - Обекти's link uses ?project=stroitelstvo (obekti.html:228).
- The MN page keeps its own #kontakti/#zapitvane split, with Многофамилна first in the select (mnogofamilna.html:157-183). Units picked in its explorer select Многофамилна (mnogofamilna.js:958-962).
- Prefill wiring: nothing reads ?project= or ?apartment= today.
  - Read the query only once useHydrated() is true (src/hooks/useHydrated.js:8-19, which names /contact?apartment= at :15).
  - Use useLocation plus URLSearchParams, as useExplorerState does (src/explorer/useExplorerState.js:11-19, :30-36; ruling C8.5).
  - After a client navigation useHydrated is true on the first render (useHydrated.js:8-11). A direct load first renders the prerender: Golden Residence chosen, no chips.
  - The concept's rules:
    - project slugs golden-residence/gr, mnogofamilna-sgrada/mnogofamilna/mn, stroitelstvo/remont/build, drugo/other;
    - an unknown slug means Golden Residence (kontakti.js:25-30, :40);
    - ?apartment= is repeatable and Latin A/B read as Cyrillic;
    - only GR shapes are accepted (floors 1–8, flats 01–12) (:31-39);
    - chips show only under Golden Residence (:170).
  - The store can't be seeded with presetInquiry, which always glides (inquiryStore.js:106-112).
- T7a (rulings :103; diptych spec :742-743, :949). Built only in the explorer.
  - ExplorerContext sets data-eu-hold on <html> just before jumpToId('explorer') and holds it until the landing's dialogs close (ExplorerContext.jsx:29-39, :45, :64-83).
  - CSS keeps the header unmoved and unclipped (src/styles/shell.css:97-104, :114-116) and starts the dialogs below the row (explorer.css:1054-1056).
- The Контакти concept's version of T7a:
  - It sets the hold before first paint for ?project=, ?apartment= or #zapitvane (kontakti.html:38-39).
  - It jumps at once to the section top or to 28 px above the heading's line under the full header, whichever is higher (kontakti.js:51-56).
  - It releases the hold on the visitor's first wheel, touchmove or keydown after 400 ms (:57-62).
  - Its CSS covers the header (kontakti.css:38, :41), „Затвори“ (:61) and the sticky frame (:162).
- FR2 (rulings :149; diptych spec :948).
  - PageFrame keeps the hash the page arrived with. Only on a client route change does it focus that element (tabindex -1, preventScroll), else #main (src/root.jsx:162-170, :180-189; scroll.js:128-135).
  - A direct load moves no focus (root.jsx:150-154). A hash or query change keeps the frame mounted (:169-170).
  - ScrollRestoration (root.jsx:78) brings a hash target into view with scrollIntoView (node_modules/react-router/dist/development/lib/dom/lib.js:1122-1126). It honours scroll-padding-top: var(--bar-h) (src/index.css:307). LenisScrollSync then syncs Lenis to it (src/motion/LenisScrollSync.jsx:64-86).

5. SITE.JS AND THE HOURS
- SITE is deep-frozen (src/config/site.js:7-33):
  - phones, primary first: +359 887 886 166 and +359 885 762 224 (:20-25);
  - email (:26);
  - offices: the two production strings, София and Гоце Делчев (:27-30);
  - hours: ['Пн–Пт 8:00–18:00', 'Сб 9:00–14:00', 'Нд почивен ден'] (:31);
  - facebook (:32);
  - PRIMARY_PHONE (:35), used at SiteHeader.jsx:95-97 and InquiryForm.jsx:44;
  - mapsUrl: a Google Maps search, never an embed (:37-39; site.test.js:24-28).
- bindAddress adds the no-break spaces (src/utils/format.js:49-62).
- Where SITE.hours is shown:
  - the footer, one per line (SiteFooter.jsx:50-55);
  - the menu, joined with „ · “ (SiteMenu.jsx:181-184);
  - the inquiry half, joined with „, “ (InquirySection.jsx:78-80).
  - Pinned at site.test.js:11, shell.test.jsx:316 and :477, home.test.jsx:89.
- Hours not taken from SITE.hours:
  - The SEO description „…Работно време: Пн-Пт 8:00-18:00.“ (src/utils/seo.js:30; Contact.jsx:541). The concept keeps it (kontakti.html:29).
  - JSON-LD openingHoursSpecification: Mon–Fri 08:00–18:00, Sat 09:00–14:00 (src/seo/jsonLd.js:29-32). Pinned to two entries (jsonLd.test.js:16) and emitted on every page (root.jsx:71). The JSON-LD addresses are hand-written too (jsonLd.js:3-6).
  - The legacy long form „Понеделник - Петък: 8:00 - 18:00 / Събота: 9:00 - 14:00 / Неделя: Почивен ден“ (Contact.jsx:162-167).
- The legacy „Пон-Пет: 9:00 - 18:00“:
  - FourTowersFloorMap.jsx:881-882, plus „Събота: 10:00 - 14:00“ at :883. It reaches /projects through Projects.jsx:5.
  - MnogofamilnaSingleBlock.jsx:919-920, on the MN block pages.
  - main also has „Работно време: 9:00 - 18:00“ at GoldenResidenceSingleBlock.jsx:1528 (git grep main). That file is gone on this branch.
- Hours in the concepts:
  - Контакти shows a long-form <dl>: „Понеделник – петък 8:00–18:00“, „Събота 9:00–14:00“, „Неделя почивен ден“ (kontakti.html:97-102).
  - Under it, a live open/closed line driven by its own HOURS table in Europe/Sofia time (kontakti.js:65-101; kontakti.html:103).
  - The MN contact half uses the short form (mnogofamilna.html:165).
  - QUESTIONS.md:10 now defaults the live line to dropped, while the notes still say it is shown (m3m4-concepts.md:455, :522). The hours themselves are unconfirmed (QUESTIONS.md:21).

### Gaps

- The form owns its own <form> and a <select> subject (InquiryForm.jsx:191, :218-227). Контакти needs a radio-group subject in the media half, inside one form spanning both halves (kontakti.html:116, :139-145).
- There are no fields that change with the subject: no Тип проект, Бюджет or message hint, no fold (InquiryForm.jsx:200-248; compare kontakti.html:157-193, kontakti.js:169-203).
- INQUIRY_OPTIONS has only home and golden-residence (inquiryStore.js:36-49). The MN page needs Многофамилна first (mnogofamilna.html:175), and the Контакти radios need a name plus a live meta line (kontakti.html:141-144).
- InquirySection has no MN copy: heading, lead, email (InquirySection.jsx:24-48; compare mnogofamilna.html:160-165).
- buildLead hard-codes budget as '' and „Не е посочен“ and takes no Тип проект (services/inquiry.js:43-63).
- Picks carry no project, and FR4 allows only golden-residence and garage (inquiryStore.js:106-112; InquiryForm.jsx:95). MN explorer picks must select Многофамилна (mnogofamilna.js:958-962), but the explorer's inquiry hard-codes golden-residence (ExplorerDialogs.jsx:147).
- No store action seeds the option and picks without the glide (inquiryStore.js:106-112).
- Nothing reads ?project= or ?apartment=: no slug map and no unit check exist in the app (Contact.jsx:1-6; compare kontakti.js:25-40).
- The EU-row hold is a private explorer helper that only lets go when the dialogs close (ExplorerContext.jsx:45, :78-83). Контакти needs a shared hold that lets go on the visitor's first scroll (kontakti.js:57-62).
- „Затвори“ is placed only from .hdr:not([data-scrolled]) (shell.css:413-415, :592). A held row needs the concept's extra rule (kontakti.css:61).
- inquiryHref never adds #zapitvane, and handle.project has no construction slug (handle.js:7, :35-37; compare prodazhbi.html:71, obekti.html:228).
- The /contact handle must drop legacy and gain inquiry (Contact.jsx:536; shell.test.jsx:228). The MN handles need the same once rebuilt (mnogofamilna-block.jsx:14; MnogofamilnaBlockSelection.jsx:461; shell.test.jsx:106, :223-225).
- There is no structured hours source from which the short, long, JSON-LD and live forms could all derive (site.js:31; jsonLd.js:29-32; kontakti.html:97-102).
- There is no Offices component; only the footer's office plus mapsUrl pattern exists (SiteFooter.jsx:62-72; site.js:39; compare kontakti.html:211-235).
- There is no opening block with the phones, the long-form hours, the email and the link to the form (kontakti.html:84-111).
- inquiry.css is imported only by InquirySection (InquirySection.jsx:7), so a page that uses InquiryForm on its own loads no form styles.
- The thank-you hides the whole form (InquiryForm.jsx:196). Контакти hides only the fields and disables the subjects (kontakti.js:308-312).
- /contact is missing from the routes check-dist must treat as rebuilt (scripts/check-dist.mjs:86).
- The smoke script needs the /contact deep-link visit flagged as a landing, and a new label and colour for the /contact focus-ring stop (smoke.mjs:146, :186-192, :348).
- Legacy-only tests must be retired or moved (legacy.prerender.test.jsx:53; legacy.focus.test.jsx:64-71), and the contract tests rewritten (contact-form.test.jsx:21-22, :43-61, :59, :88-95, :103; routes.test.jsx:37).
- The footer's quick links carry no aria-current (SiteFooter.jsx:76-81), but the concepts mark the current page (kontakti.html:273).

### Risks

- The smoke check fails any visit with no dialog once the page has scrolled (smoke.mjs:348). /contact?apartment= (smoke.mjs:146) fails as soon as the page lands on #zapitvane.
- jumpToId and the router's hash jump leave room for --bar-h only (scroll.js:32-41, :88-97; index.css:307). With the EU row held, its 36 px cover the section top; the concept subtracts the full header height (kontakti.js:53-54).
- ExplorerContext rewrites data-eu-hold on every commit (ExplorerContext.jsx:80-82). On an MN page with both the explorer and an inquiry landing, the explorer clears the other hold.
- ScrollRestoration's layout effect runs after the page's own (root.jsx:74-79). A landing jump made in useLayoutEffect after a client navigation gets overwritten; jump in a passive effect, as ExplorerContext.jsx:64-72 does.
- A query change keeps /contact mounted (root.jsx:169-170), so the prefill must follow `search`. It must never re-seed after a send: any option or pick in the store brings the form back over the thank-you (InquiryForm.jsx:111).
- The chip × focus fallback looks up #f-project (InquiryForm.jsx:151). With radios it finds nothing and next.focus() throws.
- Radios left enabled after the thank-you call chooseInquiryOption, which brings the form back (InquiryForm.jsx:111; inquiryStore.js:115-117). The concept disables the fieldset (kontakti.js:311).
- „А 301“ is a valid shape in both buildings, and normalizeUnitId merges „А 301“ and „А-301“ (units.js:14-22). The concept's regex accepts GR only (kontakti.js:34), so MN ids like А-1001 fail. Unchecked URL text would reach the CRM lead title (api/odoo-lead.js:72).
- projectType is cut silently at 200 characters (api/odoo-lead.js:30, :226), while picks are unbounded (inquiryStore.js:109) and ?apartment= is repeatable.
- The concept re-sets the budget ranges with no-break spaces and „лв.“ (kontakti.html:180-184). That changes the CRM's „Бюджет“ values from production's (Contact.jsx:180-186; odoo-lead.test.js:18) and breaks string comparisons that use plain spaces.
- Tests are not a production build, so every lead carries „[ТЕСТ] “ (services/inquiry.js:45; inquiry.test.js:52-55). The legacy page never tagged (Contact.jsx:46), so the contract's expected values must include the tag.
- Preview builds really send: EmailJS and /api/odoo-lead run on every build and are only tagged (services/inquiry.js:12-13, :89-98). Test with mocks or expect a [ТЕСТ] lead to reach KSM.
- inquiry.css.test.js bans any outline declaration and any vh or svh unit (:32-38, :88-92). The concept's radio focus ring and 100svh media (kontakti.css:159, :197) must go in another stylesheet, using var(--screen-h).
- Dropping framer-motion and react-hook-form (Contact.jsx:2-3) moves /contact from a 188.3 KiB warning (m2-results.md:142) under the hard 160 KiB gate (check-dist.mjs:77; diptych spec :893). The GR page already sits at 159.9 KiB.
- The hours are kept by hand in site.js:31, seo.js:30, jsonLd.js:29-32 and kontakti.js:67, plus the legacy 9:00 weekday and 10:00 Saturday variants (FourTowersFloorMap.jsx:882-883). Changing one breaks site.test.js:11, shell.test.jsx:316 and :477, home.test.jsx:89 and jsonLd.test.js:16.
- A live open/closed line computed from the clock must render only after hydration (useHydrated.js:13-16), or it will not match the prerendered HTML.
- On a direct load the prefill applies only after hydration, so the construction fields open after the jump. That risks the CLS budget of 0.02 (diptych spec :899); jump only after the prefill has rendered.
- FR2 focuses the #zapitvane section, not „Име“, and a direct load focuses nothing (root.jsx:150-154, :187-189). The concept's focus on „Име“ applies to in-page links only (kontakti.js:323-325).
- v2 spec §8.9 asks for a fixed „Запитване за…“ line, a prefilled message, hidden Тип проект and Бюджет, and different consent wording (v2 spec :690-692). Diptych §10 says /contact stays as it is until M4 (:863). The new spec must override both explicitly.
- The proxy's 400 for a short message is only logged (api/odoo-lead.js:59-61; services/inquiry.js:80, :92). Every new subject path, the construction one included, must still pass through buildLead's top-up (services/inquiry.js:46-49).
- The form's ids are fixed (InquiryForm.jsx:49-52, :201-268), so only one form can be on a page.
- #zapitvane is the whole section on Контакти but a half on the other pages (kontakti.html:115; InquirySection.jsx:60). The store's glide (reveal f-name) and the thank-you's reveal land differently (inquiryStore.js:94; InquiryForm.jsx:134).
- The EmailJS ids and the company address are duplicated in Contact.jsx:9-11 and :76 and in services/inquiry.js:24-27, rather than read from SITE.email (site.js:26). Deleting Contact.jsx leaves one copy, which contact-form.test.jsx:175-177 and :186 pin.

## 4. Legacy removal and content sources


Paths are relative to C:/ksm-stroy/ksm-stroy-v2 (redesign-v2 @01eac18). Concepts are in C:/ksm-stroy/design/2026-11-16-m3m4-concepts. Route ↔ concept: /about↔za-nas, /blog↔obekti, /projects↔prodazhbi, /eu-proekt↔eu-proekt, `*` (prerendered /404)↔404.

### 1. Legacy imports, their routes, what becomes dead, and dependencies

**Legacy route modules.** Each one exports `legacy: true` in its handle:
- /about: About.jsx (routes.js:29; About.jsx:888)
- /projects: Projects.jsx (:30; Projects.jsx:1478)
- /projects/mnogofamilna-sgrada: components/MnogofamilnaBlockSelection.jsx (:33; :461)
- MN block-a and block-b: routes/mnogofamilna-block.jsx (:34; handle :14), which renders MnogofamilnaSingleBlock (mnogofamilna-block.jsx:1,29)
- /contact: Contact.jsx (:39; :536)
- /blog: Blog.jsx (:40; :781)

**Who imports what, and on which routes:**
- **framer-motion:** About.jsx:3, Blog.jsx:3, Contact.jsx:2, MnogofamilnaBlockSelection.jsx:3, ui/OptimizedImage.jsx:2. Routes: /about, /blog, /contact, /projects (through OptimizedImage) and /projects/mnogofamilna-sgrada. The MN block pages have none (MnogofamilnaSingleBlock.jsx:1-80, FourTowersFloorMap.jsx:1-24).
- **swiper** (with its CSS): About.jsx:5-8 only, so /about only.
- **utils/animations.js** (plain variant objects with no imports, :4-176): About.jsx:16, Blog.jsx:6, Contact.jsx:6.
- **OptimizedImage:** Projects.jsx:3, PropertyCard.jsx:2, Blog.jsx:4 (used at :652). About.jsx:4 imports it but never uses it.
- **PropertyCard:** Projects.jsx:4 (used at :253), on /projects.
- **GoldenResidenceFloorMap (legacy GR):** imported at Projects.jsx:10 and rendered only at :433-434, inside the modal (:316). That modal never opens: openModal navigates away (:106-117), and both properties have a projectType (properties.js:28,:94).
- **FourTowersFloorMap:** Projects.jsx:5 (:441, in the same dead modal). MnogofamilnaSingleBlock.jsx:3 uses its FLOOR_DATA, which is live on the MN block pages. scripts/extract-mnogofamilna-data.mjs:11 reads its source as text.
- **ApartmentDetailsModal:** Projects.jsx:6, mounted closed (:1038).
- **Constants only Projects uses:** properties.js, buildingImages.js, apartmentImages.js (Projects.jsx:8-11).
- **HeroCarousel and useSiteAvailability:** already deleted in M2 (commit 73ac5b3; M2 plan :692). No file and no importer remain.

**What becomes dead after the rebuild.** An import scan of src, tests, scripts and api finds no other importer for any of these:
- **Modules:**
  - the four pages;
  - the five MN and GR legacy components;
  - ui/PropertyCard and ui/OptimizedImage;
  - utils/animations.js;
  - context/ApartmentContext.jsx and its test;
  - constants properties.js, buildingImages.js and apartmentImages.js.
- **Tests:** pages/legacy.prerender.test.jsx and legacy.focus.test.jsx. tests/contracts/contact-form.test.jsx:5 imports Contact.jsx.
- **Legacy plumbing:** shell/handle.js:9,20-21; root.jsx:228,238,243; styles/diptych.css:98-148; the index.css rules listed in §2.
- **Exports and data:**
  - googleSheets.js:195 calculateStats and :268 calculateGarageStats, used only by ApartmentContext.jsx:2,158-176.
  - seo.js:12-34 about and contact, used only by About.jsx:892-895 and Contact.jsx:540-543.
  - The seo.js projects and blog entries (:20-43), generateStructuredData and defaultSEO are already unused. Only seoData.home stays (Home.jsx:35-36, root.jsx:25-26).
- **smoothScroll.js:38-43,:54:** the body-overflow hold. Only Blog.jsx:221 and Projects.jsx:123 set body overflow.
- **check-dist.mjs:92-95:** LEGACY_LIBRARIES then has nothing to catch, which is harmless.
- **Already dead today:**
  - buildingRenders.js:30-39 (HOME_SLIDE_1/2 and the *_SIZES).
  - hooks/useSwipe.js, hooks/useUnitPanel.js and utils/viewer.js are imported only by tests. They fit the Обекти viewer.
- **Assets:**
  - src/assets has 469 files (335.8 MB). Live code and the image pipeline use 27 of them (3.0 MB); only the legacy pages use 175 (16.4 MB); 267 are unused (316.5 MB, of which 291.6 MB is under продажби).
  - public/images/golden-residence/building-2-blog-* (117 MB), building-2.png and golden-residence.jpg are used only by GoldenResidenceFloorMap.jsx:31-48 and buildingImages.js:27-.
  - public/ is copied into the build whole: build/client/images is 128 MB of 163 MB.

**Dependencies:**
- **Remove:** framer-motion (package.json:26), swiper (:34) and react-hook-form (:32, used only at Contact.jsx:3). The lockfile shows no other package depending on them. Also drop them from vite.config.js:124 (optimizeDeps.include).
- **Keep:**
  - @emailjs/browser (:22), used by services/inquiry.js:68.
  - isbot (:28) and @react-router/node (:23). No file in src imports them, but they are dependencies of @react-router/dev.

### 2. Legacy Tailwind theme and CSS

**What tailwind.config.js defines:**
- Palettes:
  - primary :42-53, gold :56-67, royal :70-81;
  - platinum :84-95, copper :98-109, silver :112-123;
  - ivory 50/100/200 :127-132. Its DEFAULT is Diptych's ivory (:4-5, :128).
- Fonts: sans Inter :139 and serif Playfair :140. Neither is loaded; fonts.css declares only the KSM faces.
- Sizes hero and display-1/2/3 :155-158; shadows luxury* and gold-glow* :161-167; spacing 18/88/128 :169-173; radii luxury* :177-178.
- Animations fade-in-up, slide-in-*, scale-in and float :187-191, :199-218. hero-rise belongs to HeroTitle.
- container :32-35. The content glob './index.html' at :10 names a file that does not exist.

**Who uses them** (class scan of src). Nothing from M2 uses any of them:
- **Palette classes:** only About (110), Blog (73), Contact (65), Projects (57), MnogofamilnaSingleBlock (34), PropertyCard (30), MnogofamilnaBlockSelection (9) and GoldenResidenceFloorMap (3).
- **Font sizes and fonts:**
  - ivory-50/100/200: only the four pages.
  - text-display-1: Blog.jsx:388, Contact.jsx:215,457,505 and Projects.jsx:287.
  - text-hero, font-serif, the legacy animations and the legacy spacing: no users.
  - font-sans: GoldenResidenceFloorMap.jsx:558 and diptych.css:138.
- **Shadows and radii:** PropertyCard and the four pages.
- **.container:** MnogofamilnaBlockSelection.jsx:48,292 and MnogofamilnaSingleBlock.jsx:313,490.

**The old #root rule.**
- No `#root` rule is left. Main's `#root{background-color:#fafafa}` (main:src/index.css:126-137) was removed in d84fc44.
- Its successor is .legacy-ground (diptych.css:132-148: #fafafa, #1a1a1a, theme(fontFamily.sans)) together with .on-light (:102-105). Only root.jsx:238 sets either.

**index.css rules used only by legacy pages:**
- .on-light and .on-dusk focus colours, :105-119. Only legacy files set .on-dusk.
- `:focus-visible:not(.legacy-ground *)` at :124-126 and `:where(h1,h2,h3):not(.legacy-ground *)` at :139-143.
- .line-clamp-2/3 at :252-265, used by PropertyCard and Blog.
- .focus-visible-ring at :267-271. Nothing uses it, but it calls theme('colors.gold.500').
- .safe-x and .safe-b at :317-324, and @keyframes smoothZoom at :339-347. Both are About-only (About.jsx:164).
- .scrollbar-hide, .scroll-smooth-touch, .touch-target and .text-balance at :227-250. No users.

**Production holdovers that M2 relies on:** :165-170 (html at 14 px up to 360 px) and :172-176.

**Tests that pin these:** tokens.test.js:47 (ivory[50]), diptych.test.js:52-95, focus-ring.test.js:26-48, shell.test.js:150-155. shell.test.js:26-33 pins the z-index scale, which exists so the legacy z-50 modals sit above the header.

### 3. Content and asset sources

### За нас (/about): all of it is in About.jsx

**Copy:**
- H1 at :208-240 („Добре дошли в“ :221, „КСМ Строй ООД“ :230); introduction :259-261.
- Stats :67-72, counted by AnimatedCounter :21-60.
- Story :409 and :415-416; founding sentence :422-423; principles :427; motto :432; the three qualities :436-442.
- Values: data :74-105, heading :577-582.
- „Кои сме ние?“ :636-642; services :658-719; „Защо да изберете…“ :726-756; mission and vision :107-115, :779-780.
- Call to action :847-873, linking to /contact and /blog.

**Meta:** :891-896, from seo.js:12-18. Its og image, /assets/images/001.jpg (seo.js:17), does not exist: public/ has no assets folder.

**src/assets/for-us/** holds only content.txt: 24 lines of the client's text, never published on the site. There are no photos there. home/content.txt repeats its lines 1-13.

**Photos:**
- slider01-03.webp (About.jsx:11-13) are 1200×800, 1200×900 and 1024×683.
- Larger masters exist: src/assets/images/optimized/slider01.webp is 2048×1365 and slider02 is 2000×1500, and there are .jpg twins.
- traditions.webp (:14, 960×720) has the same md5 as projects/Хотел Парадайс/45222690…(1).webp. That file is the source of Home's work-hotel-paradise cover (scripts/images/sources.json:295-297).
- The Hotel Paradise card (:498-534) uses 45263613….webp (:15, 960×640), which is also Blog's hotelParadise3 (Blog.jsx:40).
- None of these photos is in the image pipeline. The only src/assets sources in the pipeline are sources.json:69 and the six work-* entries at :259-310.

Home already reuses this copy (CompanySection.jsx:8, :23-32, id="za-nas" at :19) but drops „месец“ (:31).

### Обекти (/blog): Blog.jsx, whose component is named `Projects` (:118)

**Data:**
- The seven works are an inline array (:125-203): title, location, status, type, year, description, features and images.
- Its 93 photos are static imports (:9-116) from src/assets/projects/<work>/.
- The display order is each work's `images` array (:134, 145, 156, 167, 178, 189, 200), not the import order.
- The photos are 540–1200 px wide: 35 are 960×720 and 27 are portrait 720×960. Twelve .jpg twins are wider than their webp.
- The folders hold photos the page does not use: Panorama has 34 but uses 23, and Green Life has zanas.webp.

**Copy:**
- Screen-reader H1 „Обекти“ :277.
- Filter :211-215 (phone labels :302); empty state :374-375; call to action :386-414.
- Viewer: „За проекта“ :562, „N снимки“ :582, „Особености“ :592; keys :246-262.
- Card button „Разгледай проекта“ :759.
- Meta :785-790, with greenLife1 as the image.

**Home's works list does not share this source.**
- WorksSection.jsx:28-56 has its own six works. It leaves out Саниране 2017 and shows only Green Life's year (:32).
- Its covers come from data/images/home.json (the work-* entries, sources.json:259-310).
- The names are spelled differently: WorksSection.jsx:30 uses an en dash and :51 uses „“, where Blog.jsx:128 and :192 do not.

### Продажби (/projects): Projects.jsx and constants/properties.js

There is no equivalent in src/data.

**Page copy:**
- Screen-reader H1 „Продажби“ :213.
- Filter chips at :221, from properties.js:303-306.
- PropertyCard grid :253; the card button „Разгледай апартаментите“ is PropertyCard.jsx:141.
- Empty state :271-272; call to action „Търсите нов дом?“ :287-305.
- The modal and floor maps (:316-1043) are dead code.
- Meta :1482-1486.

**properties.js:**
- Многофамилна, :21-72:
  - location :24, year :27, description :29;
  - features :37, totalFloors :40;
  - stale buildingData :41-71.
- Golden Residence, :73-299:
  - location :76 and year :79;
  - description :80, which ends with the stale „Очаквайте скоро отваряне за продажба.“;
  - apartments „1-стайни до 4-стайни“ :92;
  - a placeholder apartmentList from :95.

**Data sources:**
- Fixed facts: config/facts.js:9 (MNOGO_DATED) and :15-25 (GR_FACTS).
- Live data: useAvailability.js:27; select.js:44 apartmentUnits(data, project) and :54 grFree.
- MN rows: mnogofamilnaFallbackData.js:1559-1560. The store carries MN only as fallback data (store.js:18-20, :185-191).

**Images:** the concept's renders are already in the pipeline. gr-corner is in data/images/golden-residence.json (GallerySection.jsx:30), and mn-dusk is in data/images/home.json (SplitHero.jsx:195).

### ЕС проект (/eu-proekt): routes/eu-proekt.jsx

Already v2 (handle at :19).
- Meta :12-17.
- Logos :35-46, from data/images/shell.json (public/img/eu-*; sources.json:85-103 reads them from git:origin/vidimost-es).
- H1 :49; paragraphs :51-61; BUDGET :23-28, with non-breaking spaces.
- Download :69-73, pointing to public/eu/plakat-ksm-stroy-a3.pdf (:21); disclaimer :75-78.

Home's EuPosterSection.jsx is separate (poster import :1; facts as dt/dd :15-20, :52-58).

### 404: routes/not-found.jsx

- Meta :11-15; handle :17; WAYS_BACK :19-23.
- H1 :30-32: two spans joined by a space. Sentence :33-35.
- The drawing's inputs already exist:
  - plan-a, in data/images/golden-residence.json (PlanSvg.jsx:53-58);
  - data/maps/golden-residence.floors.json (29 KB). The explorer keeps it out of the first load on purpose (explorer/plans.js:1-8).

### Tests that pin the text

**tests/contracts/site.jsx:89-100 ROUTES.** They read mainText, which is the first `<main>` (:80):
- / shows the project number (:90).
- /about matches /основана през месец септември 2008/i (:91).
- /projects shows Golden Residence and Многофамилна (:92).
- The MN pages are pinned at :96-98, and /blog shows Айвазовски Парк (:99).

routes.test.jsx:24-31 runs them. routes.test.jsx also pins:
- :33-39: /contact has a textbox „съобщение“ and a button „изпрати“.
- :43-53: /projects/1 redirects to a page showing both names.

**eu-visibility.test.jsx:**
- :33-38: Home links the poster.
- :42-50: every page carries the EU line.
- :55: the /eu-proekt H1 name; :56-66: seven strings.
- :67: exactly one „Изтегли плаката (PDF)“ link.
- :70-75: the poster file exists.

**404:**
- not-found.test.jsx:13-23: title, noindex, and no canonical or og:url.
- routes.test.jsx:16,45-54: main must not match /Golden Residence|Многофамилна|КСМ Строй ООД/.
- shell.test.jsx:516-527, dev-routes.test.jsx:40 and smoke.mjs:120.

**/about via findByText:** root.test.jsx:484 and shell.test.jsx:256 look up /основана през месец септември 2008/.

### 4. ApartmentContext

- **Nothing mounts it.** ApartmentProvider appears only in its own test (ApartmentContext.test.jsx:15,36). root.jsx:223-226 says so, and the legacy tests stopped wrapping pages in it (legacy.prerender.test.jsx:18, legacy.focus.test.jsx:19-20).
- **One reader.** Only GoldenResidenceFloorMap.jsx:2,:65 reads it, and only through Projects.jsx's dead modal. If it ever rendered, it would throw (ApartmentContext.jsx:241-245).
- **Live availability is the store.** The store (store.js, useAvailability.js) needs no provider and imports googleSheets.js (:30) and both fallback modules (:176, :186) itself.
- **Yes, it can go entirely** with Projects.jsx. Delete it in the same change as GoldenResidenceFloorMap: the M2 plan (:1222) notes that deleting either one alone breaks the build.
- **Leftovers:**
  - calculateStats and calculateGarageStats (googleSheets.js:195, :268);
  - comments in store.js:16,27, googleSheets.js:100, googleSheets.test.js:56, test/setup.js:8,27 and README.md:12.
- **Keep:**
  - googleSheets.js;
  - apartmentFallbackData.js (store.js:176, facts.test.js:7, scripts/validate-maps.mjs:23);
  - mnogofamilnaFallbackData.js (store.js:186).

### 5. Tests that break or become moot

**Delete or replace** (they import legacy modules):
- **pages/legacy.prerender.test.jsx** (:5-9). It checks final-state HTML (:37-44), one H1 (:50-58) and noscript fallbacks (:62-70).
- **pages/legacy.focus.test.jsx** (:6-9). It checks .on-dusk focus rings (:37-126), including the MN block page through renderSiteAt (:97-110).
- **ApartmentContext.test.jsx.**
- **contact-form.test.jsx** (:5). It fills the legacy fields Тип проект and Бюджет (:50-56), which the new InquiryForm does not have.

**Break when handles or the page ground change:**
- shell.test.jsx:216-232 HANDLES, which must match exactly per route (:241-247).
- shell.test.jsx:101-114: „Запитване“ targets (/about goes to /contact; the MN block goes to /contact?project=…).
- shell.test.jsx:196-204: /about and the MN page are solid from the top.
- shell.test.jsx:254-260 and root.test.jsx:480-490: the legacy ground, checked on /about.

**Break when the legacy CSS and theme go:** diptych.test.js:52-95, focus-ring.test.js:26-48, shell.test.js:150-155 and tokens.test.js:47. smoothScroll.test.js:37-49 also breaks if the body-overflow clause goes.

**Break with M3's MN rebuild:** routes.test.jsx:96-104 expects the legacy 'Многофамилна сграда' and 'БЛОК B', with a Latin B (MnogofamilnaSingleBlock.jsx:102,326).

**Scripts:**
- smoke.mjs:170: the scroll-lock check scrolls /about to y=1500.
- smoke.mjs:186-191: the focus-ring check expects an onyx ring on /contact.
- check-dist.mjs:87: MUST_BE_V2.

**Pass as long as the copy is kept:** the site.jsx ROUTES, eu-visibility, not-found.test, the 404 cases, and works.test.jsx:25-32 for Home.

**Successors needed:** the legacy tests' checks need per-page successors, like home.prerender.test.jsx and gr.prerender.test.jsx (docs/superpowers/notes/2026-11-14-m2-platform-map.md:207).

### Gaps

- New route modules for /about, /blog, /projects replacing src/pages/About.jsx, Blog.jsx, Projects.jsx at src/routes.js:29,30,40, keeping the URLs (src/shell/nav.js:5-7, react-router.config.js:20-23) and non-legacy handles
- За нас photos are not in the image pipeline: add slider01-03 (larger masters at src/assets/images/optimized/slider01.webp 2048w, slider02 2000w) and Hotel Paradise 45263613 to scripts/images/sources.json (only work-* at :259-310 come from src/assets)
- The 93 Обекти photos (src/pages/Blog.jsx:9-116, display order :134-200) have no pipeline entries or manifest; only six 700/960 covers exist (scripts/images/sources.json:259-310); 12 .jpg twins are wider masters
- No shared works data: seven works in src/pages/Blog.jsx:125-203, Home's six in src/pages/home/WorksSection.jsx:28-56; Обекти needs one source (descriptions, features, ordered photos) that does not bloat Home's first load
- Многофамилна facts for Продажби's rows (types, area range, floors) do not exist: src/config/facts.js:9 has only MNOGO_DATED
- No helper for the GR type breakdown (112/64/16) or per-floor board cells: src/data/availability/select.js:44-59 gives units and grFree only
- No static, prerenderable source for MN's dated rows on Продажби: the store carries MN only as fallback (src/data/availability/store.js:18-20,185-191); needs a static import of src/constants/mnogofamilnaFallbackData.js:1559-1560 or a snapshot
- The Продажби sales board (both buildings, status squares, keyboard, deep links) is new; nothing similar exists (status tokens in src/components/ui/status.js, src/components/ui/StatusLegend.jsx)
- The Обекти book viewer is new; unused parts already exist: src/motion/flip.js:16 loadFlip, src/hooks/useSwipe.js:9, src/utils/viewer.js, src/hooks/useScrollLock.js, src/utils/trapTab.js
- The 404 drawing (plan-a plus block А polygons, one unit masked) is new; src/routes/not-found.jsx:25-47 is text only
- The EU budget band (seam at 70 %) is new; src/routes/eu-proekt.jsx:63-67 is a plain list
- The За нас lineage figure (the founding drawn on the seam) is new; there is no counterpart in src/pages/home or src/components/ui
- Per-page prerender and hydration tests for the rebuilt pages, replacing src/pages/legacy.prerender.test.jsx:37-70 (model: src/pages/home/home.prerender.test.jsx)
- Add each rebuilt route to MUST_BE_V2 in scripts/check-dist.mjs:87
- Update src/shell/shell.test.jsx:216-232 HANDLES and the /about cases (:103, :196-204, :254-260) plus src/root.test.jsx:480-490
- Retarget tests/contracts/contact-form.test.jsx:5,50-56 and scripts/smoke/smoke.mjs:186-191 when Контакти is rebuilt
- Remove the legacy plumbing once no legacy page remains: src/shell/handle.js:20-21, src/root.jsx:238,243, src/styles/diptych.css:98-148, src/index.css:105-143
- Remove the legacy theme and CSS: tailwind.config.js:41-132,139-140,155-158,161-179,186-218 and src/index.css:227-271,317-324,339-347; update src/styles/tokens.test.js:47
- Drop framer-motion, swiper, react-hook-form (package.json:26,32,34 and package-lock) and their optimizeDeps entries (vite.config.js:124)
- Delete the dead modules and tests of map §1 (e.g. src/components/GoldenResidenceFloorMap.jsx, src/context/ApartmentContext.jsx, src/utils/animations.js, src/constants/properties.js, src/pages/legacy.focus.test.jsx)
- Remove now-unused exports src/services/googleSheets.js:195,268 and the seoData about/projects/contact/blog entries in src/utils/seo.js:12-43
- Decide src/utils/smoothScroll.js:38-43,54 (body-overflow hold) and src/utils/smoothScroll.test.js:37-49 once no page sets body overflow (the new viewer should use useScrollLock)
- Delete legacy-only public images (public/images/golden-residence/building-2-blog-*, building-2.png, golden-residence.jpg; only users src/components/GoldenResidenceFloorMap.jsx:31-48 and src/constants/buildingImages.js:27): about 127 MB shipped in every build
- Give /about a real share image: src/utils/seo.js:17 (and :33 for /contact) point at /assets/images/*.jpg, which public/ lacks; the site default is src/seo/meta.js:18
- Docs: README.md:12 names ApartmentContext; BRAND_GUIDE_LUXURY.md and LUXURY_IMPLEMENTATION_GUIDE.md describe the gold/Playfair/framer system
- Content decisions for the spec: src/constants/properties.js:80 stale GR sentence, :92 „1-стайни до 4-стайни“ vs the sheets, :29,37,40 MN „10 етажа“ vs nine residential floors (src/config/projects.js:46-48)
- Sweep already-dead leftovers: src/constants/buildingRenders.js:30-39 and public/images/home/* (scripts/generate-srcset.mjs:39-47)

### Risks

- Deleting GoldenResidenceFloorMap or ApartmentContext before Projects.jsx breaks the build (src/pages/Projects.jsx:10 → GoldenResidenceFloorMap.jsx:2; docs/superpowers/plans/2026-11-14-ksmstroy-v2-m2-diptych.md:1222)
- Removing the gold palette while src/index.css:269 keeps theme('colors.gold.500') (.focus-visible-ring, unused) fails the Tailwind build
- src/styles/tokens.test.js:47 pins ivory[50], and tailwind.config.js:4-5 splits ivory out of PALETTE: change both together with the ivory shades
- vite.config.js:124 optimizeDeps.include still naming removed packages breaks the dev server's dependency pre-bundling
- First-load headroom is tiny: the GR page has 90 B, the GR blocks 4.8 KiB, Home 3.1 KiB (docs/superpowers/notes/2026-11-14-m2-results.md:105,138-147); a shared works module, or growth in the shell or a primitive, can tip them over
- not-found.jsx is statically imported by src/routes/BlockRoute.jsx:3 and both block routes (golden-residence-block.jsx:5, mnogofamilna-block.jsx:5): a static 404 drawing (floors.json, plan) would join the GR block routes' first load; lazy-load it (src/explorer/plans.js:1-4 keeps plans out on purpose)
- Обекти must load Flip through loadFlip (src/motion/flip.js:16-30): a direct gsap/Flip import fails check-dist (scripts/check-dist.mjs:209, :364-366)
- The 404's main text must not contain Golden Residence, Многофамилна or КСМ Строй ООД (src/routes.test.jsx:53); an aria-hidden SVG's <title> or <text> still counts in textContent
- The 404 needs exactly one link each named Начало, Продажби and Контакти inside the single <main>, and its sentence in one element (src/shell/shell.test.jsx:521-525)
- The /eu-proekt H1 needs a space between its two line spans for the name „Дигитализация на предприятията“ (tests/contracts/eu-visibility.test.jsx:55; same pattern as src/routes/not-found.jsx:31)
- Each EU budget line must stay one text run of label and value (eu-visibility.test.jsx:59-62); a dt/dd split like src/pages/home/EuPosterSection.jsx:52-58 fails; keep exactly one „Изтегли плаката (PDF)“ link (:67)
- /about must keep „основана през месец септември 2008“ (tests/contracts/site.jsx:91; findByText in src/root.test.jsx:484, src/shell/shell.test.jsx:256 needs it in one element's own text); Home's sentence drops „месец“ (src/pages/home/CompanySection.jsx:31), so do not reuse it
- No nested <main>: mainText reads the first <main> (tests/contracts/site.jsx:80), smoke fails on two main#main (scripts/smoke/smoke.mjs:368-370), and shell.test.jsx:521 needs exactly one; the legacy pages nest one (About.jsx:129, Blog.jsx:274, Projects.jsx:210, Contact.jsx:194)
- /projects must show both building names as static main text (tests/contracts/site.jsx:92; tests/contracts/routes.test.jsx:47-51), not only after availability loads
- MN slots are null after a live read, and grFree is null until the store is ready (src/data/availability/store.js:18-20; select.js:51-59): Продажби's prerendered figures must come from static facts, never zeros
- Keep /about with a solid header and no inquiry of its own, or update src/shell/shell.test.jsx:103 and :196-204; HANDLES must match exactly (:241-247)
- Removing the legacy ground while the MN pages are still legacy (M3) restyles them; src/root.test.jsx:480-490 and src/shell/shell.test.jsx:254-260 use /about as the legacy example, so retarget them if /about is rebuilt first
- Keep the URLs /about, /blog, /projects (src/shell/nav.js:5-7, react-router.config.js:20-23, tests/contracts/site.jsx ROUTES); the concept file names za-nas, obekti, prodazhbi are not routes
- scripts/extract-mnogofamilna-data.mjs:11 cannot run once FourTowersFloorMap.jsx is deleted, but its output src/constants/mnogofamilnaFallbackData.js stays live (store.js:186): keep it as is
- The image pipeline reads every source before it skips existing outputs (scripts/images/build-images.mjs:45 vs :61), including absolute C:/ksm-stroy/golden-residence and C:/ksm-stroy/design paths and git:origin/vidimost-es (sources.json:6-58, 87-97, 107-255)
- traditions.webp is the same file as Hotel Paradise 45222690…(1).webp, already Home's cover (sources.json:295-297), and 45263613 is Blog's hotelParadise3 (Blog.jsx:40): avoid duplicate pipeline entries
- Обекти photo numbering follows Blog's images arrays (src/pages/Blog.jsx:134-200), not the import order (:9-116)
- Home's works names and lines are pinned by src/pages/home/works.test.jsx:25-32 (en dash, „“, only Green Life's year); a shared works source must keep Home's text
- src/index.css:165-170 (html at 14 px up to 360 px) is a production holdover M2's 320 px layouts depend on; it is not legacy-only
- .on-light is also the light-plate class (src/styles/diptych.css:98-105); check the new pages before deleting it with the legacy ground
- public/ is copied into the build whole, so legacy images keep shipping (build/client/images 128 MB) until deleted; keep building-2.webp, -640 and -1024 (src/constants/buildingRenders.js:19 → src/config/projects.js:69)
- The Продажби board's links to MN units need M3's MN explorer to read ?unit= (src/explorer/useExplorerState.js:35 serves GR through ExplorerProvider)
- Deleting legacy.prerender.test.jsx drops its final-state, one-H1 and noscript checks; without per-page successors only smoke's H1 count is left (scripts/smoke/smoke.mjs:42)

## 5. Budgets, checks and Home's LCP


Sources and abbreviations. CD = scripts/check-dist.mjs, SM = scripts/smoke/smoke.mjs, SS = scripts/smoke/static-server.mjs, LH = scripts/perf/lighthouse.mjs, R = docs/superpowers/notes/2026-11-14-m2-results.md, L = .superpowers/sdd/2026-11-14-ksmstroy-v2-m2-diptych/progress.md, DS = docs/superpowers/specs/2026-11-14-ksmstroy-diptych-design.md.
- T9 is M2 Task 9's saved Lighthouse JSON, under C:/Users/sadit/AppData/Local/Temp/claude/291c0396d44d16ab/1ec3d689-af15-4411-9f5a-a1f4960d9cf0/scratchpad/m2/task-9/. It holds lh-h2/home-simulate.json (the base build behind HTTP/2), lh-devtools/home.json and lh-exp/home-1.json (the no-intro run).
- LAN is Lighthouse 13.6.0's lantern, at C:/Users/sadit/AppData/Local/npm-cache/_npx/1fc4933a57a44b8f/node_modules/@paulirish/trace_engine/models/trace/lantern/.
- FV is …/scratchpad/m2/controller/final-verify.txt, the verify run at 8b09bcd.
- "Computed" means figures I took read-only from the existing build/client (built 2026-11-16 01:50, after 8b09bcd; 01eac18 changes only docs), using CD's parser. The helper script that did it was written to …/scratchpad/m3m4-map/firstload.cjs. That breaks the no-create rule. It only reads files.

### 1. check:dist

**How routes are classed**
- A route is legacy when its first-load JS carries the framer-motion fingerprint (`framerAppearId`) or the swiper one (`swiper-slide`) (CD:92-95).
  - A legacy route over budget gets a WARN.
  - Any other route over budget FAILS (CD:219-224).
- MUST_BE_V2 lists /, /projects/golden-residence, both GR blocks, /eu-proekt and /404 (CD:87).
  - A listed route FAILS if it carries a legacy fingerprint at all (CD:215-218).
  - A listed route that is not prerendered gets a note (CD:343-345).
- The JS class is not the shell's `handle.legacy`. The MN block routes have the light ground (src/routes/mnogofamilna-block.jsx:14) but no fingerprint, so the budget already applies to them (150.8 KiB, OK).
- The script also fails on the agency's branding and on dev-only routes (CD:44-58, 280-287). Before it reads the build, it checks itself against planted files (CD:121-138, 231-266).

**Budgets and rules**
- FIRST_LOAD_BUDGET is 160 KiB = 163,840 B gzip (CD:76-77).
  - First-load means every modulepreload, every module script `src` and every inline module import (CD:165-185).
  - Sizes are Node gzip (CD:191-200).
- No first-load script may carry GSAP, ScrollTrigger, SplitText, Lenis or Flip (CD:107-119, 206-210).
- **Motion chunk:** exactly one `assets/engine-*.js`, at most 60 KiB, holding all four fingerprints (CD:99, 347-358). It is 52.5 KiB now (R:106).
- **Flip:** in exactly one chunk, at most 10 KiB (CD:360-371). It is 9.2 KiB now and lazy (R:107).
  - Only src/motion/flip.js:18 reaches it, and only src/explorer/surfaces.js:13-16,27 imports that loader.
  - The note at CD:363 is stale.

**First-load JS now** (computed; matches R:136-150), as bytes and room left under 163,840 B:

| Route | Scripts | Bytes | Room left |
|---|---|---|---|
| `/` | 21 | 160,685 | 3,155 |
| `/projects/golden-residence` | 22 | 163,750 | **90** |
| GR block-a and block-b | 24 | 158,897 | 4,943 |
| `/eu-proekt` | 20 | 142,014 | 21,826 |
| `/404` | 20 | 141,026 | 22,814 |
| MN block-a and block-b | 24 | 154,449 | 9,391 |

- Legacy routes, which only WARN: /about 213,387 B, /projects 203,269, /contact 192,809, /blog 190,389, /projects/mnogofamilna-sgrada 183,524.
- Each legacy route loads framer-motion's `proxy-*.js` chunk, 37,891 B.

**What every route shares** (computed): 19 scripts, 140,295 B (137.0 KiB).
- entry.client 69,516 B (React DOM).
- components 34,174 B (React Router).
- root 9,029 B: root.jsx plus the shell (menu, footer, EU line; their strings are in that chunk).
- utils 8,588 B.
- useMotionNow 4,875 B, which also holds the motion loader and the availability store.
- lib 3,994 B, and 13 more chunks of at most 1,503 B each.
- So a v2 route has 23,545 B for its own code.
  - Home spends 20,390 B: Home 7,181 + StaleNotice 13,209 (facade, RollingNumber, inquiry, stale notice).
  - GR spends 23,455 B: golden-residence 6,940 + StaleNotice 13,209 + ExplorerSection 3,306.

**GR's headroom: 90 B** after the final fix wave (R:116-130).
- Changes that hit every route moved it: +87 B for the shared Tab trap, +28 B for focus on a hash target.
- Renamed chunk hashes alone moved it by −5 B (R:117-128).
- Rulings C8.13 and FR5 require a cut before any addition (docs/superpowers/notes/2026-11-16-m1-m2-rulings.md:125,152).

**The lazy-chunk patterns that kept GR under budget**
- **Surfaces chunk:** loadSurfaces.js:11-23 imports surfaces.js once and retries after a failure. The chunk holds the edge panels, the sheet, the dialogs (stage and unit panel), the plans and the Flip loader (surfaces.js:1-28).
  - It loads as the facade nears the screen or on first touch. Home's compact facade never loads it (surfaces.js:6-10).
- **List chunk:** `loadList` lives inside surfaces.js:32, so neither the loader nor Vite's preload list for it lands in first-load (surfaces.js:13-19; ruling C8.5 at rulings.md:114).
  - Once the surfaces are in, the list and Flip preload when the browser is idle (surfaces.js:34-43).
  - Sizes: surfaces 11.6 KB gzip, list 2.6 KB gzip (computed).
- **F11:** helpers moved into src/explorer/surfaceModel.js, which only the surfaces chunk imports: −139 B (R:121).
- **Other lazy loads:**
  - the motion engine after `load` (src/motion/runtime.js:24-33);
  - the built-in data (src/data/availability/store.js:176,186);
  - EmailJS (src/services/inquiry.js:68);
  - analytics (src/root.jsx:86-87).
- **The spec's fallback** if GR goes over: move the stage, unit panel and list into a lazy chunk, preloaded on the first hover or focus (DS:907).

### 2. Smoke

**Setup**
- SS serves build/client on 127.0.0.1:4190. It emulates vercel.json over HTTP/1.1 and compresses text over 1 KiB with br or gzip (SS:1-30, 113-118, 327).
- /api/availability runs over saved GR sheets. MNOGO_A and MNOGO_B are blank (SS:60-77).
- System Chrome runs through puppeteer-core (SM:240-245, 1141-1145).
- Before any visit, the API must report GR's four sources as ok (SM:237-238, 1138-1139).

**URLs: 23 in all** (FV:779)
- The 13 paths in react-router.config.js:18-32.
- Ten more (SM:142-158):
  - GR block-a?floor=3 and block-b?floor=2&unit=Б 201, each expecting its dialog;
  - /contact?apartment=А 301;
  - /about/ (308) and /index.html (308 to /);
  - /projects/1 (redirects to /projects);
  - /nope, GR block-c, /projects/mnogofamilna-sgrada/x and /About, each a 404.

**Each URL** is loaded at 1440×900 (DPR 1) and at 390×844 (DPR 2, touch, phone user agent), each in a fresh profile (SM:129-136, 398-402). The run waits for hydration (at most 20 s), then until 4.5 s after `load` (SM:126-127, 459-467). A visit fails on:
- any console error, warning or assert, a page error, or hydration text matching /hydrat|#418|#423|#425/ (SM:125, 406-414). This includes Chrome's "preloaded but not used" warning (SM:92-95);
- a same-origin request that fails or answers 400 or more (SM:415-429). An ERR_ABORTED passes only as Chrome's revalidation or a document preload the page did not take (SM:272-277, 505-510);
- a wrong status, redirect or final URL (SM:442-455, 470-472);
- more than one `main#main`, or a tree at the top of `<body>` with no React fiber (SM:365-381);
- „За проекта“ not visible on landing (SM:314-352, 478-482). It must sit wholly in the first viewport, with opacity 1 up its ancestors, visible, uncovered, and the page unscrolled;
- a deep link that shows no dialog with its name, or does not jump to the explorer (SM:483-487);
- `.stale` on the page while the local API answers (SM:500-503);
- on / only: a poster PDF link not visible when scrolled to (SM:491-497).

**Per path, with JS off:** exactly one non-empty H1 (SM:522-548).

**Extra checks in a full run**
- Scroll lock: /about at 390×844, reduced motion, menu opened at y=1500 (SM:170, 554-597).
- Focus ring on /, and on /contact's legacy button with an onyx ring (SM:178-193, 626-666).
- Phone opening on / (SM:199-207, 777-811).
- Seven explorer steps, all on GR (SM:223-233, 1081-1089).

**`npm test` also pins:**
- the legacy Contact form's contract (tests/contracts/contact-form.test.jsx:5);
- the EU content on / and /eu-proekt (tests/contracts/eu-visibility.test.jsx:33-70);
- every route's handle (src/shell/shell.test.jsx:216-247).

### 3. Perf and Home's LCP

**Tooling:** `npm run perf -- <urls>` runs npx `lighthouse@13` (13.6.0 measured), headless, with the default mobile settings and simulated throttling (LH:130-136).
- The settings: a 412×823 screen at DPR 1.75, 150 ms RTT, 1,638.4 Kbps and a 4× CPU slowdown (R:13).
- It does 3 runs per URL and reports medians (LH:33, 105-114), and asserts the mobile form factor (LH:74-76).
- "Bytes before LCP" is the transfer size of every request started before the observed LCP (LH:91-98).
- It needs SS already serving (LH:179-184). It is not part of verify, and nothing gates LCP automatically.

**Home now:** LCP 4.63 s (R:23, 30), with 864.1 KiB before LCP (R:48-52):

| Type | KiB before LCP |
|---|---|
| Document | 12.2 |
| CSS | 26.2 |
| Scripts | 209.8 (the motion chunk is 51.5 of it) |
| Fonts | 80.2 |
| Images | 528.1 |
| Other | 7.7 |

- **The LCP element on the phone** is the GR half's `<img>` in a 412×412 box: gr-dusk-800.avif, 24.4 kB, with fetchpriority=high, eager loading and decoding=async.
  - Sources: T9 lh-h2 `lcp-breakdown-insight`; src/pages/home/SplitHero.jsx:175; src/components/ui/ResponsivePicture.jsx:58-60.
  - Lighthouse's discovery checks all pass (`lcp-discovery-insight`).
  - The image is never faded; it only settles in scale (src/pages/home/home.css:1082-1085).
- **The other first-screen images:** the MN half, mn-dusk-800.avif, 33.4 kB, eager (SplitHero.jsx:195), and the two EU logos, 6.5 kB and 8.0 kB, eager. All are within the LCP-image budget (R:109).
- **Render-blocking CSS** (computed): root.css 17.3 KB gzip (96.6 KB raw), Home.css 4.8 KB, StaleNotice.css 6.3 KB.
  - StaleNotice.css is the explorer's `.fx__*` CSS, for the teaser below the fold.
  - The only inline critical CSS is body's background and colour (src/root.jsx:41-44).
  - Lighthouse's render-blocking estimate: 80 ms in the HTTP/2 simulation, 870 ms under applied throttling on HTTP/1.1 (T9).
- **Timeline in the unthrottled trace** (T9 lh-h2):
  - fonts, CSS, scripts and the hero images load at 34–88 ms;
  - DOMContentLoaded at 134 ms;
  - nine below-the-fold pictures (454 KiB, Low priority) load at 132–140 ms;
  - `load` at 146 ms;
  - the motion chunk (High, 51.2 KiB) loads at 173–180 ms;
  - the LCP paints at 348 ms. On HTTP/1.1 it was FCP 173 ms and LCP 401 ms (R:72). The element's render delay after its image loaded is 259 ms.
- **Why the GR page and block-a get 0.92 s and Home doesn't.**
  - In Lighthouse 13.6, a text LCP that equals FCP is simulated on the FCP graph, which holds only the render-blocking requests (LAN metrics/LargestContentfulPaint.js:32-34, 45-47).
  - GR's LCP is its H1 (T9 lh-h2/projects-golden-residence-simulate.json). Chrome does not count GR's full-bleed hero image (docs/superpowers/notes/2026-11-13-rr8-spike.md:356-360).
  - Home's LCP is an image, so it is simulated on graphs of every request that ended before the paint. The optimistic graph drops Low-priority images, and the estimate is half optimistic, half pessimistic (LargestContentfulPaint.js:8-14, 19-26, 48-62).
- **On HTTP/2 the arithmetic adds up.** Simulated FCP 943 ms, plus about 357 KiB of non-blocking bytes that are not Low-priority images at 4.88 ms per KiB (lantern/simulation/Simulator.js:65), gives about 2.69 s against the measured 2.74 s.
- **On HTTP/1.1,** six connections per host queue about 30 requests (R:83-84), which adds about 1.9 s (R:82).
- **Under applied throttling even GR misses:** 3.66 s on HTTP/2, 4.61 s on HTTP/1.1 (R:85-94).

**Ranked hypotheses for getting / under 2.5 s, by expected gain**
1. **Measure on HTTP/2, as Vercel serves the site:** −1.89 s (4.63 s to 2.74 s in one diagnostic run, R:82).
   - This needs a ruling and an HTTP/2 mode in the repo. SS is HTTP/1.1 (SS:327); the TLS wrapper used for the diagnostic exists only in the scratchpad (T9/h2/serve-h2.mjs).
2. **Load the motion engine after the LCP paint, not at `load`** (src/motion/runtime.js:15-18, 24-33).
   - It takes a 51.2 KiB High-priority script out of both graphs: at least −0.25 s on HTTP/2.
   - Likely more, since it ends a serial chain (scripts, then evaluation at 4× CPU, then `load`, then the import). It also saves a request on HTTP/1.1.
   - The loader lives in the shared useMotionNow chunk, so any added byte counts against GR's 90 B.
3. **Keep the services and works pictures out of the window before the paint.**
   - Ways: mount them after hydration through an IntersectionObserver, keeping the dominant-colour placeholder (ResponsivePicture.jsx:45-48), or try `content-visibility`.
   - Measured on HTTP/1.1: −0.61 s, from 4.63 s to 4.02 s (R:77).
   - Small on HTTP/2: lantern leaves Low-priority images out of the estimate and starts them 1 s late (LargestContentfulPaint.js:55-62; Simulator.js:24-30, 453).
4. **`fetchpriority="low"` on the MN half picture:** about −0.16 s for its 32.7 KiB, if Chrome keeps it Low.
   - It was Medium in one run and High in another (T9).
   - ResponsivePicture has no option for it yet (ResponsivePicture.jsx:58-59).
5. **Move StaleNotice.css out of Home's render-blocking set:** about −0.03 s, and an earlier FCP.
6. **Fonts:** all three faces load before the paint, and the H1 needs the italic (SplitHero.jsx:161).
   - Dropping preloads gains nothing in the lab, because the fonts are fetched at first layout anyway.
   - Subsetting to the copy's characters (DS:138; docs/superpowers/plans/2026-11-14-ksmstroy-v2-m2-diptych.md:340) might save about −0.04 to −0.08 s.
7. **HTTP/1.1 only:** fewer first-load requests. / loads 21 scripts, and vite.config.js:128 has no manualChunks. This gains nothing on HTTP/2.
8. **Paint timing alone gains nothing.** Changing decoding, preloading the hero or removing the intro all gave 4.61–4.69 s (R:70-77).

- **Not available:** a text LCP on Home's phone layout. The 412×412 half image is larger than the two-line H1.
- **Estimate:** hypotheses 1, 2 and 4 (plus 5) reach about 2.3 s on HTTP/2. On HTTP/1.1, hypotheses 2, 3 and 4 together still leave about 3.5 s.
- **The bytes-before-LCP budget** is still reported, not gated (DS:905). M2's figures: / 864.1 KiB, GR 494.5 KiB, block-a 447.0 KiB (R:23-25).

### 4. Fonts

- **What ships** (scripts/fonts/REPORT.md:7-14; public/fonts), against a budget of 92,160 B (90 KiB):

  | File | Face | Bytes |
  |---|---|---|
  | ksm-display.woff2 | Cormorant Garamond, variable 500–600 | 35,304 |
  | ksm-display-italic.woff2 | Cormorant Garamond Italic, static 500 | 22,896 |
  | ksm-text.woff2 | Manrope, variable 400–600 | 22,880 |
  | **Total** | | **81,080 (79.2 KiB)** |

  That leaves 11,080 B.
- **Enforced** by src/styles/fonts.test.js:26-32 and scripts/fonts/build-fonts.py:233,950. The spec says never raise the budget (DS:138).
- All three faces use `font-display: swap` (src/styles/fonts.css:8,16,24), with metric-matched fallbacks (fonts.css:27 on; fonts.test.js:40-48).
- **Preloads**
  - The root preloads ksm-text on every page (src/root.jsx:30-35).
  - Home, GR and the block pages add both display files and the API, but only into the prerendered HTML, through `preloadWithDocument`.
    - Sources: src/pages/Home.jsx:30,41; src/routes/golden-residence.jsx:34,44; src/explorer/BlockPage.jsx:27,39; src/utils/fontLinks.js:14-19; src/utils/documentPreloads.js:25-28.
    - Head order on /: display, italic, /api/availability, then text (build/client/index.html).
  - /404 and /eu-proekt preload the text face only (computed).
  - A preload left unused for a few seconds warns in the console, which fails the smoke (fontLinks.js:10-13).
- On / all 80.2 KiB of fonts load before the LCP (R:50).
- **Coverage:** all of Cyrillic including Ґ and Ұ, Basic Latin and some Latin-1. No subset to the copy's characters was needed (REPORT.md:15-23).

### 5. Verify chain

- `verify` = `npm test && npm run build && npm run check:dist && npm run smoke` (package.json:19).

| Step | What it runs | Time |
|---|---|---|
| `npm test` | vitest over src/**, tests/** and scripts/**/*.test.mjs (vite.config.js:140-146): 1,433 tests in 139 files | 34.7 s (FV:13-16) |
| `npm run build` | react-router build, then postbuild (package.json:11): prerender of 13 paths, 404.html and robots (scripts/postbuild.mjs:22-47) | Vite client 4.31 s + SSR 1.25 s (FV:284,696); about 10–20 s in all (not timed) |
| `npm run check:dist` | the checks in section 1 | about 1–2 s (not printed) |
| `npm run smoke` | the checks in section 2 | 176 s (FV:779) |

- The whole chain takes about 4 minutes, three quarters of it the smoke run.
- **Not in verify:**
  - eslint (package.json:12; the controller ran it by hand, L:154,184);
  - perf (9 Lighthouse runs for 3 URLs, untimed);
  - the image and font pipelines.
- Vercel builds with `npm run build` only (vercel.json:4), so it runs no tests.

### Gaps

- scripts/check-dist.mjs:87 — MUST_BE_V2 must list each rebuilt route: /projects/mnogofamilna-sgrada and both MN blocks (M3), and /projects, /about, /contact and /blog (M4). After M4, the WARN branch (:219-221) should fail instead.
- scripts/check-dist.mjs:363 — the Flip note is stale ("before Task 8"), and check:dist has no budget for render-blocking CSS or HTML size.
- scripts/smoke/smoke.mjs:187-192 — the /contact focus-ring stop pins the legacy form's onyx ring on the light ground. Re-pin it for the rebuilt Контакти on the dark ground.
- scripts/smoke/smoke.mjs:170 — the scroll lock runs on legacy /about. The rebuilt За нас must stay at least 1,500 + 844 px tall at 390×844, or the check moves.
- scripts/smoke/smoke.mjs:223-233,1081-1089 — the explorer steps cover Golden Residence only. M3 needs steps for MN's facade, keyboard, phone and deep links.
- scripts/smoke/smoke.mjs:142-158 — VISITS has no MN deep links (?floor or &unit with an expected `dialog`).
- scripts/smoke/static-server.mjs:70-77 — MNOGO_A/B are blank and only gr-*.csv fixtures exist; smoke.mjs:237-238 checks GR's sources only. MN's data state against the `.stale` check (smoke.mjs:500-503) needs fixtures or a ruling.
- src/components/ui/ResponsivePicture.jsx:58-59 — there is no fetchPriority="low" option. LCP hypothesis 4 needs it, and so does a second hero image such as the MN concept's twin.
- src/motion/runtime.js:15-18,24-33 — the engine import is tied to `load`; there is no trigger after the LCP or first paint (LCP hypothesis 2).
- scripts/smoke/static-server.mjs:327 — the server is HTTP/1.1 only. The repo has no HTTP/2 (TLS) mode for `npm run perf`; the diagnostic wrapper lives only in the M2 scratchpad.
- scripts/perf/lighthouse.mjs:132 — `lighthouse@13` floats within 13.x. Pin 13.6.0 so figures stay comparable.
- docs/superpowers/specs/2026-11-14-ksmstroy-diptych-design.md:898,905 — the LCP gate names only /, the GR page and block-a, and bytes before LCP is still "reported" pending a re-base. The M3/M4 spec must set both for the new pages.
- scripts/images/build-images.mjs (no budget code) — the LCP-image limits (DS:897, 60 kB mobile and 200 kB desktop) are checked by hand only.
- scripts/fonts/build-fonts.py — `--subset-from` is described in the plan (docs/superpowers/plans/2026-11-14-ksmstroy-v2-m2-diptych.md:340) but not built. Any cut in font bytes needs it.
- vite.config.js:122-126 and package.json:26,34 — framer-motion and swiper are still in optimizeDeps and the dependencies. M4 removes them with the legacy pages.
- tests/contracts/contact-form.test.jsx:5 — the inquiry contract imports the legacy src/pages/Contact. Port it to the new Контакти form.
- src/shell/shell.test.jsx:216-232 — HANDLES pins `legacy: true` per route, so each rebuild flips its row. src/pages/legacy.prerender.test.jsx and legacy.focus.test.jsx retire with the legacy pages.
- package.json:19 — eslint is not part of verify.

### Risks

- The Golden Residence page has 90 B of first-load room (163,750 B). Any byte added to the shared root (shell), useMotionNow (store and motion loader) or StaleNotice (explorer and inquiry) chunks fails check:dist on that page (R:116-130).
- A v2 route has 23,545 B over the 140,295 B every route shares. Reusing GR's StaleNotice and ExplorerSection chunks leaves about 7,030 B, so MN's facade and data must load lazily (the concept's js/mnogofamilna.js is 70.6 KB raw and mnogofamilna-data.js 32.8 KB raw).
- Importing a lazy chunk's loader from first-load code pulls Vite's preload list for that chunk into first-load. Keep loaders inside lazy chunks, as src/explorer/surfaces.js:13-19 does (ruling C8.5).
- Importing gsap, lenis or Flip outside src/motion either fails first-load (CD:208) or splits a vendor chunk, so engine-*.js loses its fingerprints or Flip lands in two chunks (CD:355-357,365). Обекти's filter uses Flip (concept js/obekti.js:48-51).
- Preloads in a route's `links` re-insert on client-side visits and warn "preloaded but not used" about 3 s later. Use preloadWithDocument (src/utils/documentPreloads.js:3-28; L:106).
- Any preload not used within about 3 s fails the smoke through Chrome's warning (SM:92-95). An example is the MN concept's second hero preload, mn-on-2400.webp (design/2026-11-16-m3m4-concepts/mnogofamilna.html:27).
- Pages that open on an image inherit Home's LCP mechanics, while pages that open on text simulate at about FCP (lantern LargestContentfulPaint.js:32-34). The MN concept opens on a fetchpriority=high image (mnogofamilna.html:26).
- `loading="lazy"` does not keep pictures within 2,500 px of the fold out of Lighthouse's window: Chrome fetches them at DOMContentLoaded (R:62-65).
- GR's 0.92 s comes from Lighthouse's simulation of text LCPs; applied throttling gives it 3.66–4.61 s (R:85-94). Don't read that 0.92 s as headroom.
- Measuring on the HTTP/1.1 server adds about 1.9 s to / (R:82-84). Cutting request counts can look like a win there and change nothing on Vercel's HTTP/2.
- Lighthouse floats within 13.x (LH:132). The cached 12.8.2 lantern lacks the text-LCP rule that the GR page's figure depends on.
- check:dist's "legacy" (a JS fingerprint) is not the shell's handle.legacy (the light ground). The MN block routes already have to fit 160 KiB (150.8 KiB) even though they keep the legacy look (src/routes/mnogofamilna-block.jsx:14).
- The prerendered HTML must have exactly one H1 with JS off (SM:522-548), and the first viewport's motion must be CSS-only (DS:262-266). SplitText on a heading above the fold flashes (rr8-spike.md:365).
- Lazy/Suspense sections in a prerendered route render as fallbacks with the default entry.server (rr8-spike.md:368). That matters for any plan to hydrate Home's lower sections lazily.
- A new route must be added, case-sensitive, to both src/routes.js and react-router.config.js. Otherwise the host serves 404 HTML and React renders a second copy of the site beside it (src/routes.js:9-20; SM:365-381).
- Each added smoke URL costs about 5–8 s, because every visit waits 4.5 s after load (SM:126,466-467). The run already takes 176 s.
- The smoke binds port 4190 itself (SM:1122-1131), and perf needs a server on that same port. Don't run them at the same time.
- Font headroom is 11,080 B (REPORT.md:14). Any added weight or style fails src/styles/fonts.test.js:26-32.
- Vercel runs no tests (vercel.json:4), so verify must pass locally before every push.

## 6. Rulings and parked work


REFS. Repo C:/ksm-stroy/ksm-stroy-v2; code paths below are relative to it.
- N = C:/ksm-stroy/ksm-stroy-v2/docs/superpowers/notes/2026-11-16-m1-m2-rulings.md
- L = C:/ksm-stroy/ksm-stroy-v2/.superpowers/sdd/2026-11-14-ksmstroy-v2-m2-diptych/progress.md, the ledger. rulings.md in the same folder is N:7-152 verbatim.
- FF = final-fix-findings.md in that folder.
- RES = C:/ksm-stroy/ksm-stroy-v2/docs/superpowers/notes/2026-11-14-m2-results.md
- S = C:/ksm-stroy/ksm-stroy-v2/docs/superpowers/specs/2026-11-14-ksmstroy-diptych-design.md
- RJ = C:/Users/sadit/AppData/Local/Temp/claude/291c0396d44d16ab/1ec3d689-af15-4411-9f5a-a1f4960d9cf0/scratchpad/m2/controller/final-review.json: the area reviewers' minors and deferredTriage. It is JSON, so there are no line numbers.

**1. OPEN PARKED AND DEFERRED ITEMS**

How the leftovers came about:
- The final review triaged the earlier deferred items: 77 already fixed, 23 can wait, 1 to fix before merge (L:267).
- The fix wave fixed 19 of 22, did F6 and F13 in part, and left F22 (L:274).
- The re-review added FR8 to FR11 (L:277-280).

**(a) Explorer (M3 reuses it)**
- **FR7** (N:203): the list's table still scrolls 21 px inside its box at 320 px. The rule at explorer.css:1353-1362 only makes it fit from 360 px. Cheap: CSS.
- **FR8** (N:204; RES:193):
  - With text spacing on, at 360×640 and smaller, the stage's side column (counts, key, table) gets no height.
  - A candidate rule is FF:50 item (4), on the .ps__body rows (explorer.css:1283-1286).
  - The CSS is cheap, but it changes the phone design, so it was named to the user.
- **FR9** (N:205): after a failed surfaces load, opening the same floor again never retries. The effect's deps are [wanted, surfaces, stage, unitId] (ExplorerContext.jsx:91-106). The fix (a retry counter) is cheap, but its bytes land in the Golden Residence page's first load.
- **F22** (FF:244-246; L:253): BlockGrid's roving tab stop (BlockGrid.jsx:43,111) is not clamped if a grid shrinks. That can't happen while the grid is fixed at 8×12 (BlockGrid.jsx:33-34). Fix is one line.
- **Closed, no action:**
  - the deep-link hold shrinks the stage by 36 px (L:205): accepted by T7a;
  - Facade's setPhoneBlock on desktop: pinned as harmless by C9.14 (RJ shell and explorerB triage).
- **Refuted, and the binding design:** the phone sheet stays open while the page scrolls (N:148). Don't "fix" it.

**(b) Shell and global**
- **FR10** (N:206): on landscape phones under about 600 px tall, the onyx strip of the fixed „Затвори“ (shell.css:581-592) covers the top 12–14 px of „Начало“. A tap there closes the menu. Cheap: CSS.
- **FR11** (N:207): with a classic Windows scrollbar, an open unit panel shows a lighter 15 px gutter. The lock is umber (UnitPanel.jsx:117) against a darker backdrop. Cheap: one colour.
- **The doors, parked unless the user notices** (N:183; L:55,61,101-105,110-111; RJ shell triage):
  - the seam is the new page's background, so the opening page covers it from 520 ms (motion.css:62-65);
  - the shownPage ref lags behind a pending transition;
  - Back pressed during the doors flashes the link's destination for about 2 frames;
  - Back from a legacy page to Home shows onyx and the seam for about 35 ms before the hero images (RJ home triage: try decoding="sync" first);
  - with a classic scrollbar, the root's doors and the page's doors run half a gutter apart (dark on dark);
  - a rare one-frame flash, worth one look on a real display.

  The legacy-path items end when M4 removes the legacy pages. None is cheap to verify: each needs screencasts.
- **T3** (L:79): below 314 px the slogan takes three lines. That is under the 320 px floor, so it is accepted.
- **gr minor 3** (parked by FR1, N:148; RJ gr): StorySection.jsx:34 is a copy of formatDecimal (format.js:16). Cheap, and it saves bytes.
- **Missing no-break spaces** on pages M2 didn't touch (L:281; RES:250):
  - eu-proekt.jsx:57, „е да повиши“;
  - not-found.jsx:14 and :31, „я няма в чертежа“.

  Cheap, and M4 rebuilds both pages anyway.
- **infra minor 3** (FR1): optimizeDeps in vite.config.js:122-127 doesn't list gsap/Flip. Affects the dev server only. Cheap.
- **/api/availability caching** (api/availability.js:32; L:179,192; RES:243): the Cache-Control has no browser max-age. Changing it needs a contract change, so it goes to (d).
- **LCP on /** is 4.63 s against the 2.5 s budget, inherited from M1 (RES:56-99; L:262). Goes to (d).

**(c) Tests and docs** (FR1 parks these as "polish, tests or docs that no visitor meets", N:148)
- **shell minor 6:** the HIDING list in src/test/css.js:80-87 doesn't count starting states such as a clip-path inset or translate(). Cheap.
- **shell minor 7:** shell.test.jsx:98-112 checks only the header link's href. No test checks that #zapitvane exists on routes with `inquiry: true`. Cheap.
- **gr minor 4:** two branches have no test. Cheap.
  - toInquiry's early return on a modifier-key click (ParkingSection.jsx:46-47);
  - the gallery's paths that cut an opening short (GallerySection.jsx:114 and after).
- **infra minor 1:** the smoke run never lands on the teaser's own URLs (?floor=А-5 and ?view=list#explorer). See VISITS at smoke.mjs:142-146 and EXPLORER.deepLink at :228. Cheap.
- **infra minor 4:** §7 of scripts/fonts/REPORT.md:277-282 is stale. It says routes add DISPLAY_FONT_PRELOADS to their `links` and that no route uses it yet. Cheap.
- **Task 9 can-wait items** (L:245-248), all cheap:
  - the smoke reads .stale at load + 4.5 s, before the store's 10 s timeout (smoke.mjs:501);
  - dialogOpens repeats openDialogs (smoke.mjs:868 against :356);
  - settled() returns after a single 150 ms still sample (smoke.mjs:845);
  - stubIdle's flusher is duplicated (src/test/gsap.js:85 against BlockGrid.motion.test.jsx:62 and DimensionLine.test).
- **Done, not open:** F20 (the shots) and F21 (the M1 rows and the CLS for /) (RES:30-37, 221-223).

**(d) Waiting on the client or the user**
- **FR6** (N:202; RES:249): the label „Гараж или паркомясто в Golden Residence“ (inquiryStore.js:45) gets an ellipsis below about 377 px. A shorter label is the client's copy call.
- **FR8 and FR11** were named to the user (N:204,207).
- **The LCP fix** needs a choice (RES:96-99): fewer bytes before the first paint, or the below-the-fold pictures kept back. Either way it also needs a measurement on the HTTP/2 preview, which sits behind Vercel's SSO.
- **A browser max-age for /api/availability** (L:192).
- **Device checks, all unchecked** (RES:231-239):
  - touch laptop: no sticky hover after a tap (C9.6);
  - iPhone: the first tap on a rail previews the floor (C9.11);
  - iPhone: the doors, @property and :has(), the first-screen heights, the menu;
  - Android: the font fallbacks;
  - desktop Firefox and Safari: the doors.
- **The test inquiry** from the preview waits for the user's go-ahead (L:265).
- **The Многофамилна sheets:** the API reports MNOGO_A and MNOGO_B missing (L:265). The counts stay labelled „по данни към 01.12.2025“ until the sheets are published (S:49, S:938).
- **Client flags:**
  - from S:937-942: the contact address is free mail; „над 15 години опит“ against 2008; block А has no Изложение column; one typical plan serves every floor;
  - кота only on А1 (S:928);
  - the works' years (S:929).
- **Real og images** per page (N:230); Home uses the default for now (T3b, N:182).
- **The X-Robots-Tag** for the review host (S:918).

**2. BINDING RULINGS FOR M3/M4**

**Process and tests**
- **Precedence:** a ruling beats a brief (N:9). The spec beats the concept, and the concept's CSS applies where the spec is silent (S:14-16).
- **G1** (N:13): if a change turns an unlisted test red, update it to the new behaviour and list it in the report. Never drop coverage. Touch tests/contracts/ only where the plan says.
- **F2** (N:39,160): HANDLES (shell.test.jsx:216-232) pins every route's handle. Update the row of each rebuilt route.
- **R2** (N:212): check:dist enforces only the routes in MUST_BE_V2 (check-dist.mjs:87; the note calls it V2_ROUTES). Add each route as it is rebuilt.
- **F14** (N:26,41,172): CSS tests use the one helper, src/test/css.js (a postcss walk plus the first-viewport motion check).
- **R3, P1, H1** (N:213,157,174):
  - at most 3 fix rounds, each with a fresh implementer;
  - reports come back in the structured result;
  - a file the harness refuses comes back as a handoff.
- **FR5 and C8.13** (N:152,125):
  - free first-load bytes first, then do the CSS-only items, then the JS ones;
  - check:dist must pass on every route, and an item that can't fit is reported, not forced;
  - the Golden Residence page is at 163,750 of 163,840 B (RES:105,120-130).
- **C7.7 and C8.5** (N:101,114; S:907): code only a dialog needs goes into lazy chunks (surfaces, list, Flip).

**Motion and doors**
- html.js is the single motion gate. Never gate motion with Tailwind's motion-safe: (N:232; S:216-226).
- **F13** (N:22,35,46): keep the 1 ms reduced-motion clamp (index.css:145-148). A fade that must survive it is written for :root:not(.js), with its own !important duration, after the clamp.
- **C0.2** (N:29; diptych.css:85): hand-written :hover rules go inside @media (hover: hover) and (pointer: fine).
- **C4.2** (N:49): a page's keyframes never reuse a Tailwind keyframe name.
- **C4.5** (N:52): an intro renders nothing after its animationend.
- **T1a and T1b** (N:177-178; S:334): Back and Forward are instant through vt-cut. The header's group stays on top (z-index 1), and cutOnPop takes a predicate.
- **T1c** (N:184; S:321): the root snapshot holds the footer and the dark ground. A legacy page's light ground is painted by the page frame, and by <main> without motion.
- **T2a and T2b** (N:179-180): leaving from the open menu, the seam shows at the glint, and the doors uncover the header plus onyx.
- **T5a** (N:72; S:324): .grain has view-transition-name grain, its group is at z-index 3, and it keeps the default crossfade.
- **F8** (N:64): an LCP image never gets a view-transition-name.
- **F12** (N:65): the hero move runs only with a fine pointer, innerWidth ≥ 901, html.js set and scrollY ≤ 8.
- **S:358:** GSAP only animates; React renders the final state.

**Focus, keyboard, a11y**
- **The ring** (S:867-871): 2 px at a 3 px offset. Ivory on the dark grounds, onyx inside .on-light, Highlight under forced colours, and an inset −4 px overlay on media links. No overflow: hidden that clips it.
- **F9** (N:14): never port outline: none or a custom outline. Form fields keep the global ring, and the brass underline may stay as an extra cue. Unit-table rows take the ring at −2 px.
- **C0.1** (N:28; index.css:124): the ring-radius rule is scoped with :not(.legacy-ground *).
- **C8.12** (N:124): keep at least 5 px between a focusable element and the edge of a scroll box.
- **F12, from the wave** (FF:170-175): a focusable element that GSAP hides gets a :focus-within opacity override.
- **C0.3** (N:30; diptych.css:77; S:881): 44×44 px targets through pseudo-element hit boxes (.link::before).
- **FR2** (N:149; S:338): after a route change, focus the hash target (tabindex −1, preventScroll), otherwise #main. Not on the first load, and not on a change of hash or query alone.
- **T6a** (N:86; S:869): while an edge panel covers its rail, the dashed lens is the focus indicator.
- **T7a** (N:103; S:743): a deep-link landing keeps the 36 px EU row in view, with the dialogs below it, until they close (holdEuRow, ExplorerContext.jsx:80-83).
- **T8a** (N:116; S:875): each block grid is one tab stop with a roving tabindex: ←→ along a floor, ↑↓ between floors, Home and End, Enter and Space.
- **T8b** (N:117): a row that gets focus back is scrolled into view, Lenis-aware, with no glide. Other focus returns use preventScroll.
- **C7.2 and C8.1** (N:96,110): the element focus returns to must still be focusable; otherwise fall back to the floor's rail.
- **Dialogs** (S:872): role="dialog", aria-modal, a name, a Tab trap (src/utils/trapTab.js, ruling C9.12 at N:141), Escape, focus moved in and returned, and a dialog underneath made inert.
- **Text spacing** must hold at 320–360 px (S:882). Use minmax(0, 1fr) grid tracks, and check for clipped text, not only page width (FF:26,68; RES:172).

**Copy**
- **S:176-178:**
  - quotes „…“ and a spaced en dash for ranges;
  - a no-break space after one-letter words and after „№“, between a number and its unit, and inside „блок А“ and „жк Левски Г“.
- **C4.7** (N:54): addresses go through bindAddress (format.js:49), one-letter words through bindOneLetterWords (format.js:36).
- **Counts and areas:** plural() (format.js:27, C4.8, N:55); formatArea and formatDecimal (format.js:16-24, C7.4, N:98).
- **F8 and F9 from the wave** (FF:133-151; diptych.css:199): leads get text-wrap: pretty, plus bound last words and a bound „КСМ Строй“. No-break-space pins are written as U+00A0 escapes (commit 8b09bcd).
- **C6.2** (N:84): captions with a widow get text-wrap: balance.
- Copy comes from production (S:45).
- **R1** (N:211): an unknown status shows the unit's own text, otherwise „Няма информация“.

**Buttons**
- **S:383-394:**
  - variants outline (the default), solid and link;
  - sm is 40 px tall;
  - the arrow is hidden from assistive tech;
  - labels stay on one line on desktop and may wrap on phones.
- **V3** (N:40; diptych.css:94-95): at 900 px and under, .btn labels wrap, centred, at 1.25 leading. Captures at 390 px must show it working.
- **S:400:** the header's „Запитване“ goes to #zapitvane only when the handle has `inquiry: true`, and to /contact?project=… otherwise.
- D1–D7, A2, A3 and A5 are superseded (S:10; v2 spec:900), although N:219-227 and N:236 still list them.

**Data, forms, URLs, assets**
- **C5.1** (N:67; InquirySection.jsx:53): the form's option clears when the section unmounts; the picks persist.
- **FR4** (N:151): picks are shown and sent only with the golden-residence or garage subject.
- **C5.2 and C5.3** (N:68-69): the form shows a sending state, and the thank-you is revealed by its id.
- **S:924-925:** email is required, and short messages are topped up. Non-production builds prefix the subject with „[ТЕСТ]“ in the browser; api/odoo-lead.js stays untouched.
- **F5** (N:78,92): openFloor(block, floor, unitId?, {fromRect, opener}); the meta never goes into the URL.
- **F10** (N:108): unit ids in the URL and in callbacks are labels.
- **S:740:** URL parameters are read after hydration and written with replace.
- **FR3** (N:150; S:751): a block page's list starts on its own block.
- **F15** (N:80): one StaleNotice component.
- **C6** (N:81): one unit mapping.
- **C4.10 and C5.4** (N:57,70): preloads go through preloadWithDocument (documentPreloads.js:25; Home.jsx:41), and routes export no preload `links`.
- **F7** (N:63): image ids are kebab-case. Ids that differ only in case collide on this disk and 404 on Vercel.
- **The EU line** is on every page, visible on landing (S:923). On phones it is one 36 px row (N:233). Only the header row's logos load eagerly (F19, FF:226-231).
- No stopgap styling on legacy pages (N:237; L:64).

**3. VERIFY AND LEDGER STATE**
- **Last green run:** `npm run verify` (tests, build, check:dist, smoke) passed at 8b09bcd (L:282).
  - 1,433 tests in 139 files;
  - check:dist with the Golden Residence page at 159.9 KiB;
  - the smoke run with the explorer steps, 176 s.

  The log is scratch m2/controller/final-verify.txt:13-14, 719-737 and 779, written at 01:53 on 2026-11-16. RES:160-164 reports the same for site code as of 3a0af21; 8b09bcd only changed test pins.
- **HEAD** is 01eac18, the same as origin/redesign-v2. That commit is docs only (the rulings note and both specs' amendments), so the verify still stands. The earlier green run was at 595e8a0 (L:255).
- **Loose ends in the ledger:**
  - the "Rulings I made" wrap-up is planned (L:273) but never recorded as given;
  - there is no Vercel success line for push point 8 (L:284), unlike earlier pushes (L:264);
  - the device checks are open;
  - the test inquiry is unsent and the МН sheets are missing (L:265);
  - the LCP and Cache-Control decisions (L:262,192);
  - FR6 to FR11 (L:275-280);
  - the no-break spaces on /eu-proekt and /404 (L:281);
  - the workspaces stay until the user has reviewed (L:285), though N:3 says they are deleted after M2.

### Gaps

- scripts/check-dist.mjs:87: MUST_BE_V2 lacks /projects/mnogofamilna-sgrada, its block routes, /about, /projects, /contact and /blog. Add each as it is rebuilt (R2, N:212).
- src/shell/shell.test.jsx:216-232: the HANDLES rows of the МН and M4 routes are still `legacy: true`. The solid-from-top case (:196) and the href table (:101-107, МН block to /contact?project=…) also change (F2).
- src/pages/home/SplitHero.jsx:193-208: Home's МН half still links #zapitvane with the dated count (S:911). M3 repoints it, and home.prerender.test.jsx:42 and home.test.jsx:13 move with it.
- src/routes.js:33-34 and src/routes/mnogofamilna-block.jsx:14,29: the МН page and block routes still render the legacy MnogofamilnaBlockSelection and MnogofamilnaSingleBlock.
- src/explorer/BlockGrid.jsx:33-34: the grid is hard-coded to 8 floors × 12. МН has 72 flats a block on 9 floors (mnogofamilna-block.jsx:23), and S:738 ignores floors outside 1–8. Generalise both, then clamp the tab stop (BlockGrid.jsx:43, F22).
- src/data/availability/store.js:186-200: МН data is built-in and dated only, and the API reports MNOGO_A and MNOGO_B missing (L:265). Live МН counts need the client's sheets.
- src/explorer/ExplorerContext.jsx:106: FR9, retry the surfaces load when the same floor is opened again (a retry counter).
- src/explorer/explorer.css:1353-1362: FR7, the list's table still scrolls 21 px at 320 px.
- src/explorer/explorer.css:1283-1286: FR8, the short-screen rows rule (FF:50 item 4), only if the user accepts the phone-layout change.
- src/styles/shell.css:581-592: FR10, the onyx strip of the fixed „Затвори“ covers „Начало“ on landscape phones.
- src/explorer/UnitPanel.jsx:117: FR11, the unit panel's scroll-lock colour against its darker backdrop.
- src/components/inquiry/inquiryStore.js:45: FR6, a shorter garage label once the client chooses one.
- src/routes/eu-proekt.jsx:57 and src/routes/not-found.jsx:14,31: missing no-break spaces after one-letter words (L:281).
- src/pages/golden-residence/StorySection.jsx:34: replace the local `number` with formatDecimal (format.js:16) (gr minor 3).
- src/test/css.js:80-87: HIDING misses hidden starting states such as clip-path inset and translate() (shell minor 6).
- src/shell/shell.test.jsx:98-112: add a test that #zapitvane exists on every `inquiry: true` route (shell minor 7).
- src/pages/golden-residence/ParkingSection.jsx:46-47 and GallerySection.jsx:114: untested branches (gr minor 4).
- scripts/smoke/smoke.mjs:142-146,228: land on the teaser's URLs (?floor=А-5, ?view=list#explorer), and on МН deep links once they exist (infra minor 1).
- scripts/smoke/smoke.mjs:501,845,868: the Task 9 smoke can-wait items (.stale read timing, settled() sampling, the dialogOpens copy).
- src/test/gsap.js:85: BlockGrid.motion.test.jsx:62 and DimensionLine.test keep their own flushers instead of using this shared one.
- vite.config.js:123-126: add gsap/Flip to optimizeDeps, and drop framer-motion and swiper when M4 removes the legacy code (infra minor 3).
- scripts/fonts/REPORT.md:277-282: rewrite §7 (Preloads) for preloadWithDocument (C4.10/C5.4) (infra minor 4).
- src/routes/eu-proekt.jsx and src/routes/not-found.jsx call no preloadWithDocument. Add it if the redesigned pages use the display face (C4.10, N:57).
- tests/contracts/contact-form.test.jsx:5,77 pins the legacy Contact page's CRM payload. The M4 plan must name any contract change (G1, N:13).
- tests/contracts/eu-visibility.test.jsx:52 and tests/contracts/routes.test.jsx:33: the redesigned /eu-proekt and /contact must keep what these contracts pin.
- N:240: legacy accessibility leftovers that M3/M4 rebuilds must not port: unnamed /blog viewer buttons, buttons inside links, click-only floor divs, the 2.39:1 ring on the EU poster links, the faint ring over a zoomed plan.
- src/root.jsx:225-226: /projects still imports GoldenResidenceFloorMap on a dead branch until M4.
- src/styles/diptych.css:132-147 and src/index.css:124: remove the .legacy-ground machinery once no legacy page remains (S:912).
- S:919,925: „[ТЕСТ]“ is added only by the new forms. M4's contact and sales forms must go through the inquiry service to get it.
- src/pages/legacy.focus.test.jsx:76,98,116 and src/routes.test.jsx:74-75,95-99: update the МН legacy rows when those pages are rebuilt (as F4 did for GR).
- N:182,230: real og:image assets per page; Home uses the default.

### Risks

- The Golden Residence page has 90 B of first-load headroom (RES:105,130). Root, shell, explorer-core and format.js code ships there, so generalising the explorer for МН can fail check:dist. Free bytes first (FR5).
- Shell changes cost every route. F18 alone added 28 B to each route, Golden Residence included (RES:126).
- The note calls the list V2_ROUTES (N:212), but the script's name is MUST_BE_V2 (check-dist.mjs:87). A rebuilt route left off it only WARNs if legacy code creeps in.
- scripts/fonts/REPORT.md:281-282 still tells you to add preloads to route `links`. That is superseded (C4.10) and brings back Chrome's 'preloaded but not used' warning.
- N:219-227 and N:236 still list D1–D7 and A5 as rulings, but S:10 and v2 spec:900 supersede them.
- The disk is case-insensitive: image ids that differ only in case collide and 404 on Vercel (F7, N:63).
- Concept CSS brings outline:none, ring-clipping overflow:hidden, vh units (use --screen-h, S:94) and keyframe names that clash with Tailwind's (C4.2).
- GSAP intros that start at opacity 0 hide focused controls (FF:170-175). Each one needs a :focus-within override.
- overflow-x: clip keeps the page at 320 px while it cuts text, so page-width checks pass anyway (FF:66-77; RES:172).
- A grid with no column template gets one auto column, which grows to the nowrap min-content at 320 px (FF:24-31). Use minmax(0, 1fr).
- Text pins normalise /\s+/, so a missing no-break space passes the existing tests. Pin U+00A0 explicitly (8b09bcd; FF:137).
- A plain fade or transition is cut to 1 ms by the reduced-motion clamp (index.css:145-148) unless it follows F13's pattern.
- The inquiry store is module-level and outlives the page (C5.1). A new form must clear its option on unmount, and picks go only with a GR subject (FR4).
- Forms on the previews send real leads to КСМ. Probes must abort EmailJS and POST /api/odoo-lead (L:133,169,265).
- G1 makes tests/contracts off-limits beyond the plan. Rebuilding /contact or /eu-proekt trips contact-form.test.jsx and eu-visibility.test.jsx.
- ?unit holds labels (F10). GR's are „А 501“; an МН fixture uses „А-901“ on floor 10 (select.test.js:82-84). Check the МН format before reusing the parsing.
- The explorer assumes 8×12 blocks and floors 1–8 (BlockGrid.jsx:33-34; S:738). F22's unclamped tab stop becomes reachable with smaller grids.
- html has scrollbar-gutter: stable (index.css:308). Every useScrollLock must pass the colour of the surface beside the gutter (FR11), and puppeteer captures hide that strip (RES:225).
- New dialogs on deep links must go through the provider's holdEuRow (ExplorerContext.jsx:80-83), or the EU-row occlusion check fails (T7a).
- „Запитване“ goes to #zapitvane whenever the handle sets `inquiry: true`, and no test checks the target exists (shell minor 7). A page without the section gets a dead link.
- FR2 moves focus to the hash target, so links into the МН explorer need ids that exist when the page mounts.
- The SDD workspace is git-ignored (.superpowers/sdd/.gitignore:1) and slated for deletion (N:3; L:285). The F1–F22 detail and the can-wait triage (scratch final-review.json) are not in the repo.
- МН counts must keep their „по данни към 01.12.2025“ label until the sheets are published (S:49). Don't present them as live.
