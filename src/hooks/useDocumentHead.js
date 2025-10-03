import { useEffect } from 'react'

export const useDocumentHead = ({
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
  useEffect(() => {
    const originalTitle = document.title
    const originalMeta = []
    
    // Store original meta tags
    const metaTags = document.querySelectorAll('meta[name], meta[property]')
    metaTags.forEach(tag => {
      originalMeta.push({
        element: tag,
        name: tag.getAttribute('name') || tag.getAttribute('property'),
        content: tag.getAttribute('content')
      })
    })

    // Update title
    if (title) {
      document.title = title
    }

    // Helper function to update or create meta tag
    const setMetaTag = (name, content, property = false) => {
      if (!content) return
      
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
      let tag = document.querySelector(selector)
      
      if (!tag) {
        tag = document.createElement('meta')
        if (property) {
          tag.setAttribute('property', name)
        } else {
          tag.setAttribute('name', name)
        }
        document.head.appendChild(tag)
      }
      
      tag.setAttribute('content', content)
    }

    // Update meta tags
    setMetaTag('description', description)
    setMetaTag('keywords', keywords)
    setMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow')
    
    // Open Graph tags
    setMetaTag('og:title', ogTitle || title, true)
    setMetaTag('og:description', ogDescription || description, true)
    setMetaTag('og:type', ogType, true)
    setMetaTag('og:image', ogImage, true)
    setMetaTag('og:site_name', 'KSM Stroy', true)
    
    // Twitter tags
    setMetaTag('twitter:card', 'summary_large_image')
    setMetaTag('twitter:title', ogTitle || title)
    setMetaTag('twitter:description', ogDescription || description)
    setMetaTag('twitter:image', ogImage)

    // Canonical link
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]')
      if (!canonicalLink) {
        canonicalLink = document.createElement('link')
        canonicalLink.setAttribute('rel', 'canonical')
        document.head.appendChild(canonicalLink)
      }
      canonicalLink.setAttribute('href', canonical)
    }

    // Structured data
    if (structuredData) {
      let structuredDataScript = document.querySelector('script[type="application/ld+json"]')
      if (!structuredDataScript) {
        structuredDataScript = document.createElement('script')
        structuredDataScript.setAttribute('type', 'application/ld+json')
        document.head.appendChild(structuredDataScript)
      }
      structuredDataScript.textContent = JSON.stringify(structuredData)
    }

    // Cleanup function
    return () => {
      document.title = originalTitle
      // Note: In a real app, you might want to restore original meta tags
      // For simplicity, we'll leave the SEO tags as they help with navigation
    }
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, ogType, canonical, structuredData, noindex])
}