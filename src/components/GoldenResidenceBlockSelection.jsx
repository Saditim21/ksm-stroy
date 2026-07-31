import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DimensionLine from './ui/DimensionLine';
import DisplayHeading from './ui/DisplayHeading';
import Reveal from './ui/Reveal';
import { hoverZoom } from '../utils/motion';

// Gallery Images
import galleryImage1 from '../assets/продажби/project 2/photos/golden-residence-1.webp';
import galleryImage2 from '../assets/продажби/project 2/photos/golden-residence-2.webp';
import galleryImage4 from '../assets/продажби/project 2/photos/golden-residence-4.webp';
import galleryImage6 from '../assets/продажби/project 2/photos/golden-residence-6.webp';
import galleryImage7 from '../assets/продажби/project 2/photos/golden-residence-7.webp';
import galleryImage8 from '../assets/продажби/project 2/photos/golden-residence-8.webp';

// Golden Residence has no dedicated per-block render, so both panels share the
// same exterior photo (carried over from the pre-redesign page).
const BLOCKS = [
  { id: 'block-a', name: 'Блок А', count: '96 апартамента • 8 етажа', image: galleryImage6 },
  { id: 'block-b', name: 'Блок Б', count: '96 апартамента • 8 етажа', image: galleryImage6 },
];

function BlockPanel({ block, delay, onSelect }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <Reveal delay={delay}>
      <motion.div
        role="button"
        tabIndex={0}
        aria-label={`Разгледайте ${block.name}`}
        onClick={onSelect}
        onKeyDown={handleKeyDown}
        initial="rest"
        whileHover="hover"
        whileFocus="hover"
        className="relative overflow-hidden rounded-2xl group cursor-pointer aspect-[4/5] md:aspect-[3/4] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-accent"
      >
        <motion.img
          src={block.image}
          alt={block.name}
          className="object-cover w-full h-full"
          variants={{ rest: { scale: 1 }, hover: hoverZoom }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 sm:p-8">
          <h2 className="font-display text-4xl text-plaster">{block.name}</h2>
          <p className="text-plaster/70 text-sm mt-1">{block.count}</p>
          <p className="text-gold-accent text-sm font-semibold mt-3">Преглед на блока →</p>
        </div>
      </motion.div>
    </Reveal>
  );
}

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
    setShowGallery(false);
    setFullscreenImage(null);
    navigate(`/projects/golden-residence/${block}`);
  };

  // Reset gallery state when component unmounts
  useEffect(() => {
    return () => {
      setShowGallery(false);
      setFullscreenImage(null);
    };
  }, []);

  return (
    <div className="bg-plaster min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-2 text-graphite hover:text-ink transition-colors text-sm"
          >
            <span aria-hidden="true">←</span> Назад към проекти
          </button>
          <button
            onClick={() => {
              setShowGallery(true);
              setFullscreenImage(null);
            }}
            className="inline-flex items-center gap-2 text-graphite hover:text-ink transition-colors text-sm"
          >
            Снимки <span className="text-graphite/60 text-xs">({galleryImages.length})</span>
          </button>
        </div>

        <DimensionLine label="Golden Residence" />
        <DisplayHeading as="h1">Изберете <em>блок</em>.</DisplayHeading>

        <div className="grid md:grid-cols-2 gap-6 mt-10">
          {BLOCKS.map((block, index) => (
            <BlockPanel
              key={block.id}
              block={block}
              delay={index * 0.08}
              onSelect={() => handleBlockSelect(block.id)}
            />
          ))}
        </div>
      </div>

      {/* Full-page photo gallery */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            className="fixed inset-0 bg-ink z-50 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Close button */}
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowGallery(false);
                setFullscreenImage(null);
              }}
              className="fixed top-6 right-6 z-50 text-plaster hover:text-gold-accent transition-colors p-3 rounded-full bg-plaster/10 hover:bg-plaster/20"
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
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-plaster mb-2">
                Golden Residence
              </h2>
              <p className="text-plaster/60 text-sm sm:text-base">Галерия със снимки</p>
            </motion.div>

            {/* Bento Box Grid - 6 images */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 max-w-7xl mx-auto">

                {galleryImages.map((image, idx) => {
                  const delays = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7];

                  return (
                    <motion.div
                      key={image.id}
                      className="relative group overflow-hidden rounded-2xl cursor-pointer"
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: delays[idx], duration: 0.6 }}
                      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                      onClick={() => setFullscreenImage(image.src)}
                    >
                      <div className="relative aspect-[4/3]">
                        <img
                          src={image.src}
                          alt={`Golden Residence - Снимка ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-200" />
                      </div>
                    </motion.div>
                  );
                })}

              </div>

              <motion.div
                className="text-center mt-12 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <p className="text-plaster/50 text-sm">
                  Натиснете ESC или X за затваряне
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Image Viewer */}
      <AnimatePresence>
        {fullscreenImage && showGallery && (
          <motion.div
            className="fixed inset-0 bg-ink/95 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              setFullscreenImage(null);
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenImage(null);
              }}
              className="absolute top-4 right-4 text-plaster hover:text-gold-accent transition-colors p-3 rounded-full bg-plaster/10 hover:bg-plaster/20 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <motion.img
              src={fullscreenImage}
              alt="Golden Residence - Fullscreen"
              className="max-w-full max-h-full object-contain rounded-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-plaster/60 text-sm">
              Кликнете навсякъде за затваряне
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GoldenResidenceBlockSelection;
