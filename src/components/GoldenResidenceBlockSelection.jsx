import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Gallery Images
import galleryImage1 from '../assets/продажби/project 2/photos/golden-residence-1.png';
import galleryImage2 from '../assets/продажби/project 2/photos/golden-residence-2.png';
import galleryImage4 from '../assets/продажби/project 2/photos/golden-residence-4.png';
import galleryImage6 from '../assets/продажби/project 2/photos/golden-residence-6.png';
import galleryImage7 from '../assets/продажби/project 2/photos/golden-residence-7.png';
import galleryImage8 from '../assets/продажби/project 2/photos/golden-residence-8.png';

const GoldenResidenceBlockSelection = () => {
  const navigate = useNavigate();
  const [showGallery, setShowGallery] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  // Gallery images array
  const galleryImages = [
    { id: 1, src: galleryImage1 },
    { id: 2, src: galleryImage2 },
    { id: 3, src: galleryImage4 },
    { id: 4, src: galleryImage6 },
    { id: 5, src: galleryImage7 },
    { id: 6, src: galleryImage8 }
  ];

  const handleBlockSelect = (block) => {
    navigate(`/projects/golden-residence/${block}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 py-2 sm:py-6 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="mb-4 sm:mb-8 lg:mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Enhanced mobile-first header layout */}
          <div className="mb-6 sm:mb-8">
            {/* Back button and title on same level */}
            <div className="grid grid-cols-3 items-center mb-6 sm:mb-8">
              <div className="flex justify-start">
                <button 
                  onClick={() => navigate(-1)}
                  className="text-gray-800 hover:text-gray-600 active:text-gray-900 transition-all duration-300 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-200/50 sm:justify-start sm:min-w-auto sm:px-2"
                >
                  <span className="text-2xl sm:text-xl font-bold">←</span>
                  <span className="hidden sm:inline sm:ml-2 sm:mr-1 text-base font-medium">Назад</span>
                </button>
              </div>
              
              <div className="flex justify-center">
                <motion.h1
                  className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 bg-clip-text text-transparent leading-tight text-center"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.7 }}
                >
                  Golden Residence
                </motion.h1>
              </div>

              {/* Gallery Button - Top Right */}
              <div className="flex justify-end">
                <motion.button
                  onClick={() => {
                    setShowGallery(true);
                    setCurrentGalleryIndex(0);
                  }}
                  className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 group text-sm sm:text-base"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-bold">Снимки</span>
                  <span className="hidden sm:inline text-xs bg-white/20 px-2 py-0.5 rounded-full">({galleryImages.length})</span>
                </motion.button>
              </div>
            </div>
            
            {/* Centered decorative line */}
            <div className="flex justify-center">
              <motion.div 
                className="w-16 sm:w-20 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "4rem" }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </div>
          </div>
          <motion.p
            className="text-base sm:text-lg lg:text-xl text-gray-700 text-center px-6 sm:px-8 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Изберете блок за преглед
          </motion.p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-2 min-h-[75vh] sm:min-h-[80vh] lg:h-[75vh]">
          {/* Block A - Enhanced Mobile Experience */}
          <motion.div
            className="w-full lg:w-1/2 relative group cursor-pointer overflow-hidden min-h-[45vh] sm:min-h-[50vh] lg:min-h-full shadow-2xl rounded-2xl lg:rounded-l-2xl lg:rounded-r-none touch-manipulation active:shadow-3xl"
            onClick={() => handleBlockSelect('block-a')}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98, y: 0 }}
          >
            <div
              className="w-full h-full bg-cover bg-center relative min-h-[45vh] sm:min-h-[50vh] lg:min-h-full"
              style={{
                backgroundImage: `url(${galleryImage6})`,
                backgroundPosition: 'center 20%'
              }}
            >
              {/* Enhanced gradient overlay for mobile */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/60 group-hover:from-black/40 group-hover:via-black/20 group-hover:to-black/50 group-active:from-black/60 group-active:to-black/70 transition-all duration-500"></div>
              
              {/* Mobile-optimized golden accent overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/20 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
              
              <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="text-center text-white max-w-sm">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                  >
                    <motion.h2 
                      className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black mb-3 sm:mb-4 lg:mb-6 drop-shadow-2xl tracking-wide"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      БЛОК А
                    </motion.h2>
                    <motion.p 
                      className="text-lg sm:text-xl lg:text-2xl xl:text-3xl mb-6 sm:mb-8 lg:mb-10 drop-shadow-lg font-semibold tracking-wide"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                    >
                      96 апартамента • 8 етажа
                    </motion.p>
                    <motion.div 
                      className="bg-white/25 backdrop-blur-lg px-6 sm:px-8 lg:px-10 py-4 sm:py-5 rounded-2xl border-2 border-white/90 group-hover:bg-white/35 group-hover:border-white group-active:bg-white/20 transition-all duration-300 shadow-2xl min-h-[56px] flex items-center justify-center touch-manipulation"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95, y: 0 }}
                    >
                      <span className="text-base sm:text-lg lg:text-xl font-bold tracking-wide">Преглед на блока</span>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Block B - Enhanced Mobile Experience */}
          <motion.div
            className="w-full lg:w-1/2 relative group cursor-pointer overflow-hidden min-h-[45vh] sm:min-h-[50vh] lg:min-h-full shadow-2xl rounded-2xl lg:rounded-r-2xl lg:rounded-l-none touch-manipulation active:shadow-3xl"
            onClick={() => handleBlockSelect('block-b')}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98, y: 0 }}
          >
            <div
              className="w-full h-full bg-cover bg-center relative min-h-[45vh] sm:min-h-[50vh] lg:min-h-full"
              style={{
                backgroundImage: `url(${galleryImage6})`,
                backgroundPosition: 'center 20%'
              }}
            >
              {/* Enhanced gradient overlay for mobile */}
              <div className="absolute inset-0 bg-gradient-to-bl from-black/50 via-black/30 to-black/60 group-hover:from-black/40 group-hover:via-black/20 group-hover:to-black/50 group-active:from-black/60 group-active:to-black/70 transition-all duration-500"></div>
              
              {/* Mobile-optimized golden accent overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/20 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
              
              <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="text-center text-white max-w-sm">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                  >
                    <motion.h2 
                      className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black mb-3 sm:mb-4 lg:mb-6 drop-shadow-2xl tracking-wide"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      БЛОК Б
                    </motion.h2>
                    <motion.p 
                      className="text-lg sm:text-xl lg:text-2xl xl:text-3xl mb-6 sm:mb-8 lg:mb-10 drop-shadow-lg font-semibold tracking-wide"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.6 }}
                    >
                      96 апартамента • 8 етажа
                    </motion.p>
                    <motion.div 
                      className="bg-white/25 backdrop-blur-lg px-6 sm:px-8 lg:px-10 py-4 sm:py-5 rounded-2xl border-2 border-white/90 group-hover:bg-white/35 group-hover:border-white group-active:bg-white/20 transition-all duration-300 shadow-2xl min-h-[56px] flex items-center justify-center touch-manipulation"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95, y: 0 }}
                    >
                      <span className="text-base sm:text-lg lg:text-xl font-bold tracking-wide">Преглед на блока</span>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Creative Full-Page Gallery */}
        <AnimatePresence>
          {showGallery && (
            <motion.div
              className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-50 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Close button */}
              <motion.button
                onClick={() => setShowGallery(false)}
                className="fixed top-6 right-6 z-50 text-white hover:text-gold-400 transition-colors p-3 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>

              {/* Gallery Title */}
              <motion.div
                className="text-center pt-8 pb-6"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent mb-2">
                  Golden Residence
                </h2>
                <p className="text-gray-400 text-sm sm:text-base">Галерия със снимки</p>
              </motion.div>

              {/* Creative Bento Box Grid - 6 images */}
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 max-w-7xl mx-auto">

                  {galleryImages.map((image, idx) => {
                    const delays = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7];
                    const rotations = [-2, 2, -1, 1, -2, 2];
                    const hoverRotations = [0.5, -0.5, 0.5, -0.5, 0.5, -0.5];

                    return (
                      <motion.div
                        key={image.id}
                        className="relative group overflow-hidden rounded-2xl shadow-2xl cursor-pointer"
                        initial={{ opacity: 0, y: 50, rotate: rotations[idx] }}
                        animate={{ opacity: 1, y: 0, rotate: 0 }}
                        transition={{ delay: delays[idx], duration: 0.6 }}
                        whileHover={{ scale: 1.03, rotate: hoverRotations[idx], transition: { duration: 0.2 } }}
                        onClick={() => setFullscreenImage(image.src)}
                      >
                        <div className="relative aspect-[4/3]">
                          <img
                            src={image.src}
                            alt={`Golden Residence - Снимка ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                        </div>
                      </motion.div>
                    );
                  })}

                </div>

                {/* Decorative elements */}
                <motion.div
                  className="text-center mt-12 mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <p className="text-gray-500 text-sm">
                    Натиснете ESC или X за затваряне
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fullscreen Image Viewer */}
        <AnimatePresence>
          {fullscreenImage && (
            <motion.div
              className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFullscreenImage(null)}
            >
              {/* Close button */}
              <button
                onClick={() => setFullscreenImage(null)}
                className="absolute top-4 right-4 text-white hover:text-gold-400 transition-colors p-3 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Fullscreen Image */}
              <motion.img
                src={fullscreenImage}
                alt="Golden Residence - Fullscreen"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              />

              {/* Hint */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/60 text-sm">
                Кликнете навсякъде за затваряне
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default GoldenResidenceBlockSelection;