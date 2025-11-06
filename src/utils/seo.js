// SEO metadata for different pages in Bulgarian

export const seoData = {
  home: {
    title: "KSM Stroy - Строителна компания в София | Качествено строителство",
    description: "KSM Stroy е водеща строителна компания в София с над 15 години опит. Предлагаме жилищно, комерсиално строителство, ремонти и реновации с най-високо качество.",
    keywords: "строителство, строителна компания, къщи, апартаменти, ремонти, реновации, София, България, KSM Stroy",
    ogTitle: "KSM Stroy - Строителна компания в София",
    ogImage: "/assets/images/slider01.jpg"
  },

  about: {
    title: "За нас - KSM Stroy | 15+ години опит в строителството",
    description: "Научете повече за екипа на KSM Stroy - експерти в строителството с над 15 години опит, 200+ завършени проекта и 50+ доволни клиенти в София и цяла България.",
    keywords: "за нас, екип, история, опит, строители, архитекти, инженери, София, България",
    ogTitle: "За нас - KSM Stroy | Професионален строителен екип",
    ogImage: "/assets/images/001.jpg"
  },

  projects: {
    title: "Проекти - KSM Stroy | Нашите реализирани строителни проекти",
    description: "Разгледайте нашите завършени проекти - жилищни сгради, комерсиални обекти, ремонти и реновации. Над 200 успешно реализирани проекта в София и България.",
    keywords: "проекти, портфолио, жилищно строителство, комерсиални сгради, ремонти, реализации",
    ogTitle: "Проекти - KSM Stroy | Реализирани строителни проекти",
    ogImage: "/assets/images/002.jpg"
  },

  contact: {
    title: "Контакти - KSM Stroy | Свържете се с нас за оферта",
    description: "Свържете се с KSM Stroy за безплатна консултация и оферта. Офис в София, телефон: +359885762224, имейл: ksm_str@abv.bg. Работно време: Пн-Пт 8:00-18:00.",
    keywords: "контакти, телефон, имейл, адрес, оферта, консултация, София, България",
    ogTitle: "Контакти - KSM Stroy | Свържете се за оферта",
    ogImage: "/assets/images/003.jpg"
  },

  blog: {
    title: "Блог - KSM Stroy | Новини и съвети за строителството",
    description: "Последни новини, тенденции и експертни съвети за строителството от екипа на KSM Stroy. Полезна информация за собственици на имоти и строители.",
    keywords: "блог, новини, съвети, строителни тенденции, експертни мнения, строителство България",
    ogTitle: "Блог - KSM Stroy | Новини и съвети за строителството",
    ogImage: "/assets/images/slider01.jpg"
  }
}

export const defaultSEO = {
  siteName: "KSM Stroy",
  siteUrl: "https://ksmstroy.bg",
  locale: "bg_BG",
  type: "website",
  twitterHandle: "@ksmstroy"
}

// Generate structured data for different content types
export const generateStructuredData = (type, data) => {
  const baseUrl = defaultSEO.siteUrl

  switch (type) {
    case 'organization':
      return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "KSM Stroy",
        "url": baseUrl,
        "logo": `${baseUrl}/logo.jpg`,
        "description": "Строителна компания в София с над 15 години опит",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "ул. Строителна 123",
          "addressLocality": "София",
          "postalCode": "1000",
          "addressCountry": "BG"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+359885762224",
          "contactType": "customer service",
          "availableLanguage": "Bulgarian"
        },
        "sameAs": [
          "https://www.facebook.com/ksm.stroi/",
          "https://www.linkedin.com/company/ksmstroy"
        ]
      }

    case 'article':
      return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": data.title,
        "description": data.description,
        "image": `${baseUrl}${data.image}`,
        "author": {
          "@type": "Person",
          "name": data.author
        },
        "publisher": {
          "@type": "Organization",
          "name": "KSM Stroy",
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/logo.jpg`
          }
        },
        "datePublished": data.datePublished,
        "dateModified": data.dateModified || data.datePublished
      }

    case 'service':
      return {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": data.name,
        "description": data.description,
        "provider": {
          "@type": "Organization",
          "name": "KSM Stroy",
          "url": baseUrl
        },
        "serviceType": "Construction Services",
        "areaServed": {
          "@type": "City",
          "name": "София"
        }
      }

    default:
      return null
  }
}