import { useState } from 'react'
import { motion } from 'framer-motion'
import SEO from '../components/common/SEO'
import OptimizedImage from '../components/ui/OptimizedImage'
import { blogPosts, categories } from '../data/blogData'
import { seoData } from '../utils/seo'
import { pageVariants, pageTransition, fadeInUp, hoverLift, buttonExpand } from '../utils/animations'

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Format date to Bulgarian format
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const months = [
      'януари', 'февруари', 'март', 'април', 'май', 'юни',
      'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'
    ]
    
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    
    return `${day} ${month} ${year}`
  }

  // Filter posts by category
  const filteredPosts = selectedCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category.toLowerCase() === selectedCategory.toLowerCase())

  // Featured post (latest post)
  const featuredPost = blogPosts[0]
  const regularPosts = blogPosts.slice(1)

  return (
    <>
      <SEO 
        title={seoData.blog.title}
        description={seoData.blog.description}
        keywords={seoData.blog.keywords}
        ogTitle={seoData.blog.ogTitle}
        ogImage={seoData.blog.ogImage}
      />
      
      <motion.main 
        className="min-h-screen bg-primary-50 pt-8"
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >

      {/* Featured Post */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-gold-600 font-semibold text-sm uppercase tracking-wide">Препоръчано</span>
            <h2 className="text-display-1 text-primary-900 mt-2">Най-новото от блога</h2>
          </div>
          
          <div className="bg-white rounded-luxury-lg shadow-luxury border border-silver-200 overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <div className="h-64 md:h-full">
                  <OptimizedImage
                    src={featuredPost.image}
                    alt={`${featuredPost.title} - KSM Stroy блог`}
                    className="w-full h-full object-cover"
                    priority={true}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
              <div className="md:w-1/2 p-8 md:p-12">
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gold-100 text-gold-800">
                    {featuredPost.category}
                  </span>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold text-primary-900 mb-4 leading-tight">
                  {featuredPost.title}
                </h3>
                
                <p className="text-primary-600 mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-primary-500 mb-6">
                  <div className="flex items-center space-x-4">
                    <span>{featuredPost.author}</span>
                    <span>•</span>
                    <span>{formatDate(featuredPost.date)}</span>
                    <span>•</span>
                    <span>{featuredPost.readTime} четене</span>
                  </div>
                </div>
                
                <button className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-primary-900 px-6 py-3 rounded-luxury font-semibold transition-all duration-200 flex items-center group shadow-gold-glow hover:shadow-gold-glow-lg">
                  Прочети повече
                  <svg className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-gradient-to-br from-ivory-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-luxury text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-primary-900 shadow-gold-glow scale-105'
                    : 'bg-white text-primary-700 hover:bg-gold-50 hover:text-gold-700 border border-silver-200 hover:border-gold-500/30 shadow-luxury hover:shadow-luxury-lg'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 bg-gradient-to-br from-ivory-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} formatDate={formatDate} />
            ))}
          </div>
          
          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary-900 mb-2">Няма статии</h3>
              <p className="text-primary-600">В тази категория все още няма публикувани статии.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="py-16 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white relative overflow-hidden">
        {/* Gold accent overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gold-900/10 via-transparent to-gold-900/5"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-display-1 font-bold mb-4">
            Абонирайте се за нашия newsletter
          </h2>
          <p className="text-xl mb-8 text-platinum-300">
            Получавайте последните новини и експертни съвети директно в пощата си
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Вашият имейл адрес"
              className="flex-1 px-4 py-3 rounded-luxury text-primary-900 placeholder-primary-500 focus:outline-none focus:ring-2 focus:ring-gold-500 shadow-luxury"
            />
            <button className="bg-gradient-to-r from-gold-500 to-gold-600 text-primary-900 px-6 py-3 rounded-luxury font-semibold hover:shadow-gold-glow-lg transition-all duration-200 whitespace-nowrap">
              Абонирай се
            </button>
          </div>
          <p className="text-sm text-platinum-300 mt-4">
            Ние спазваме вашата поверителност и никога няма да споделяме данните ви
          </p>
        </div>
      </section>
    </motion.main>
  </>)
}

// Blog Post Card Component
const BlogPostCard = ({ post, formatDate }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(true)
  }

  return (
    <motion.article 
      className="bg-white rounded-luxury-lg overflow-hidden group cursor-pointer border border-silver-200 hover:border-gold-500/30 shadow-luxury hover:shadow-luxury-lg transition-all duration-300"
      variants={hoverLift}
      initial="initial"
      whileHover="hover"
      whileInView={fadeInUp.animate}
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Post Image */}
      <div className="relative h-48 bg-primary-200 overflow-hidden">
        {!imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-primary-200 animate-pulse flex items-center justify-center">
                <svg className="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <OptimizedImage
              src={post.image}
              alt={`${post.title} - KSM Stroy блог`}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-gold-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <span className="text-gold-700 text-sm font-medium">Статия</span>
            </div>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gold-700 rounded-full text-xs font-medium">
            {post.category}
          </span>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-primary-900 mb-3 line-clamp-2 group-hover:text-gold-700 transition-colors duration-200 leading-tight">
          {post.title}
        </h3>

        {/* Meta Information */}
        <div className="flex items-center text-sm text-primary-500 mb-3 space-x-4">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{post.author}</span>
          </div>
          <span>•</span>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 9l2 2 4-4m-6 2a9 9 0 108.29-5.64" />
            </svg>
            <span>{formatDate(post.date)}</span>
          </div>
        </div>

        {/* Excerpt */}
        <p className="text-primary-600 text-sm leading-relaxed mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        {/* Read Time and Tags */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-primary-500 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {post.readTime} четене
          </span>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-primary-100 text-primary-600 rounded-full text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Read More Button */}
        <motion.button 
          className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-primary-900 py-3 px-4 rounded-luxury font-semibold flex items-center justify-center group shadow-gold-glow hover:shadow-gold-glow-lg transition-all duration-200"
          variants={buttonExpand}
          whileHover="hover"
          whileTap="tap"
        >
          <span>Прочети повече</span>
          <svg className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </motion.button>
      </div>

      {/* Bottom accent line */}
      <motion.div 
        className="h-1 bg-gradient-to-r from-gold-500 to-gold-600 origin-left"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.article>
  )
}

export default Blog