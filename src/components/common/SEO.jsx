import { Helmet } from 'react-helmet-async'
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

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots Meta Tag */}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={ogTitleFinal} />
      {ogDescriptionFinal && <meta property="og:description" content={ogDescriptionFinal} />}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:locale" content={defaultSEO.locale} />
      <meta property="og:site_name" content={defaultSEO.siteName} />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitleFinal} />
      {ogDescriptionFinal && <meta name="twitter:description" content={ogDescriptionFinal} />}
      <meta name="twitter:image" content={ogImageUrl} />
      {defaultSEO.twitterHandle && (
        <meta name="twitter:site" content={defaultSEO.twitterHandle} />
      )}
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  )
}

export default SEO