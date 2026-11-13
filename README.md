# KSM Stroy website

The website of KSM Stroy, a residential developer in Bulgaria. The site is in
Bulgarian.

It is built with React 19, Vite 7, Tailwind CSS 3 and React Router 7, and is
deployed on Vercel.

- Apartment availability is read live from published Google Sheets
  (`src/services/googleSheets.js`, `src/context/ApartmentContext.jsx`). See
  [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md).
- The contact form sends each inquiry by EmailJS, and through the Vercel
  function `api/odoo-lead.js` to Odoo CRM.

## Scripts

- `npm run dev`: development server on port 3000
- `npm run build`: production build in `dist/`
- `npm run preview`: serves the production build
- `npm test`: unit tests and production contract tests (Vitest)
- `npm run check:dist`: checks the build in `dist/`; run `npm run build` first
- `npm run lint`: ESLint
