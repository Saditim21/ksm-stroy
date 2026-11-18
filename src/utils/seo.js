// Production's head for Home (its src/utils/seo.js `home`): the title and the
// description, which Home's `meta` (src/pages/Home.jsx) and the root's
// fallback head (src/root.jsx) use. Each other page keeps production's words
// in its own route module (spec M3/M4 §9: the unused entries left with the
// legacy pages).
export const seoData = {
  home: {
    title: "KSM Stroy - Строителна компания в София | Качествено строителство",
    description: "KSM Stroy е водеща строителна компания в София с над 15 години опит. Предлагаме жилищно, комерсиално строителство, ремонти и реновации с най-високо качество.",
  },
}
