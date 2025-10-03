import { useDocumentHead } from '../../hooks/useDocumentHead'
import { defaultSEO } from '../../utils/seo'

const SEO = ({ 
  title, 
  description, 
  keywords,
  ogTitle, 
  ogDescription, 
  ogImage,
  ogType = 'website',
  canonical,
  structuredData,
  noindex = false
}) => {
  const fullTitle = title ? `${title} | KSM Stroy` : 'KSM Stroy - Строителна компания в София'
  const ogTitleFinal = ogTitle || title
  const ogDescriptionFinal = ogDescription || description
  const canonicalUrl = canonical || `${defaultSEO.siteUrl}${typeof window !== 'undefined' ? window.location.pathname : ''}`
  const ogImageUrl = ogImage?.startsWith('http') ? ogImage : `${defaultSEO.siteUrl}${ogImage || '/assets/images/slider01.jpg'}`

  useDocumentHead({
    title: fullTitle,
    description,
    keywords,
    ogTitle: ogTitleFinal,
    ogDescription: ogDescriptionFinal,
    ogImage: ogImageUrl,
    ogType,
    canonical: canonicalUrl,
    structuredData,
    noindex
  })

  return null
}

export default SEO