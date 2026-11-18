# КСМ Строй v2: pre-review polish (2026-11-19)

The user's six changes before the client review. Picked from the live concepts in
`C:\ksm-stroy\design\2026-11-19-polish-concepts\` (index.html; the user chose "go with your recommendations": Продажби A,
За нас A; light mode yes, "if it's not good we can disable it after I see it").

## 1. The EU line without its sentence (done, uncommitted at the time of writing)
The header's top row keeps the co-funding lockup and the programme's logo and „За проекта“; the sentence
„Проект „Дигитализация на предприятията“, № …“ leaves the row. The footer and /eu-proekt keep it. Why the row stays:
the beneficiary's handbook 2021–2027, §3.1, wants the emblem and „Съфинансирано от Европейския съюз“ visible on opening
a page, without scrolling.

## 2. Home's „Нашите обекти“ covers
- Green Life: the night pool the user sent, from its larger original in the gallery (960 × 640; the user's file is a
  569 × 427 darker crop of it). Хотел Парадайс: the aerial at sunset (45359157). Панорама: the concrete frame and its
  crane (50580441), cropped above the bins. Сънни Хил: the finished corner (57124599). Айвазовски and Читалище keep theirs.
- Each cover gets a master of its own, enlarged and graded alike (slightly warm, a little less saturated, lifted
  blacks), new image ids `cover-<work>` so Обекти and За нас keep their photos. The enlargement is Real-ESRGAN ×4 when its
  output exists (the user runs it; the session's safety check blocks the binary), else Lanczos with light sharpening.

## 3. Продажби = concept A „Две сгради“
- `#top`: the two buildings at dusk, side by side on the seam (one under the other on a phone), each: place, name, its
  free count (Golden Residence live, Многофамилна dated 01.12.2025), a bar of its statuses, its reserved and sold in
  words, its free apartments by type, the range of their areas, „Разгледайте сградата“ (solid) and „Само свободните“
  (to #svobodni, filtered to it). A mouse on a half widens it and dims the other. The page's H1 „Продажби“ and its line
  over the seam. Header: overlay.
- `#etazhi`, „Етаж по етаж“: one building at a time (two toggles), its blocks either side of the seam, a row a floor,
  top floor first: its number, its apartments as squares in their status's pattern, „6 свободни“ / „няма свободни“. A
  row opens (button, aria-expanded) to its free apartments, each a link to the apartment on its building's page.
- `#svobodni`, „Свободни апартаменти“: filters (сграда, стаи, етаж 1–3 / 4–6 / 7+), each choice with its count; rows
  (number, building, type, area, floor, exposure, „Вижте“); 10 then „Покажи още N“; an empty state that says what to do.
- The closing as now. The squares board and the comparison rows go.

## 4. За нас = concept A „Стена“
- `#top`: 35 of the company's photographs in a 7 × 5 wall (5 × 7 on a phone), darkened, around the H1 „Добрата работа –
  реклама за майстора“ (second line italic brass) and „КСМ Строй ООД, строителна компания от 2008 г.“. Scrolling (pinned,
  scrubbed) zooms the wall into its centre tile, Хотел Парадайс from the air, until it covers the screen; the H1's lines
  part to either side; the full-size photograph takes over; then „Хотел Парадайс, с. Огняново“ and „Строим жилищни,
  обществени и индустриални сгради – от изкопа до последния детайл.“ Without motion: the wall and the motto, no pin.
- „Семейство строители“: the founding sentence in production's words (the contract reads „основана през месец
  септември 2008“), the motto paragraph, the team sentence, the figures in one line; three photographs: the dig, the
  rough build, the finished building.
- „Какво сме построили“: the seven works of Обекти on a track that scrolls sideways (pinned) on a desktop, each a stack
  of three photographs that fans out as it reaches the middle; a column on a phone and without motion; „Всички обекти“.
- „Какво предлагаме“ with „Защо да изберете КСМ Строй“, mission | vision (with the three values), the call to action.

## 5. Light theme
- A switch („Светла тема“ / „Тъмна тема“) in the header before „Меню“ and in the menu; remembered (localStorage
  `ksm-theme`); set before the first paint by a head script; dark stays the default. The page changes inside a circle
  that grows from the switch (View Transitions where available, else at once; never under reduced motion).
- Light tokens („травертин“): onyx→#ECE6DA, umber→#E2DACC, umber-2→#D8CEBE, ivory→#17140F, ivory-2→rgba(23,20,15,.8),
  ivory-3→rgba(23,20,15,.66), stone→#5E574B, hair→rgba(23,20,15,.2), hair-2→rgba(23,20,15,.1), hair-ctl→rgba(23,20,15,.5),
  brass→#9A7834, brass-l→#7A5D22, statuses free #2E9A62, reserved #C06E1C, sold #BA4136, blocked #7A756B.
- What sits on photographs (heroes, the works panel, the wall, the film bands, the explorer's facade) stays dark: a
  `.dark` island re-declares the dark tokens. The header over a dark opening stays dark until the page scrolls.

## 6. Responsiveness
A scripted sweep of every route at 320–2560 px, phone landscape and tablets, in both themes: no sideways scroll, no
clipped or overlapping text, the header and menu usable; the findings fixed.

## Constraints
Everything in the M1–M4 specs and rulings still holds: first-load JS ≤ 160 KiB with 512 B of room per route and the caps
on `/` and Golden Residence; the first viewport's motion is CSS; prerendered HTML is the final state; reduced motion is
honoured; a11y as before. Nothing reaches `main` or production without the user's go.
