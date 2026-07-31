import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DimensionLine from './ui/DimensionLine';
import DisplayHeading from './ui/DisplayHeading';
import Reveal from './ui/Reveal';
import { hoverZoom } from '../utils/motion';
import blockAImage from '../assets/продажби/project 1/block-A/blockA.webp';
import blockBImage from '../assets/продажби/project 1/block-B/blockB.webp';

// Gallery Photos
import photo1 from '../assets/продажби/project 1/photos/photo-1.webp';
import photo2 from '../assets/продажби/project 1/photos/photo-2.webp';
import photo3 from '../assets/продажби/project 1/photos/photo-3.webp';
import photo4 from '../assets/продажби/project 1/photos/photo-4.webp';

const BLOCKS = [
  { id: 'block-a', name: 'Блок А', count: '72 апартамента • 9 етажа', image: blockAImage },
  { id: 'block-b', name: 'Блок Б', count: '72 апартамента • 9 етажа', image: blockBImage },
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

const MnogofamilnaBlockSelection = () => {
  const navigate = useNavigate();
  const [showGallery, setShowGallery] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  // Gallery images array
  const galleryImages = [
    { id: 1, src: photo1, size: 'large' },
    { id: 2, src: photo2, size: 'medium' },
    { id: 3, src: photo3, size: 'medium' },
    { id: 4, src: photo4, size: 'large' }
  ];

  const handleBlockSelect = (block) => {
    setShowGallery(false);
    setFullscreenImage(null);
    navigate(`/projects/mnogofamilna-sgrada/${block}`);
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

        <DimensionLine label="Многофамилна жилищна сграда" />
        <DisplayHeading as="h1">Изберете <em>вход</em>.</DisplayHeading>

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
                Многофамилна жилищна сграда
              </h2>
              <p className="text-plaster/60 text-sm sm:text-base">Галерия със снимки</p>
            </motion.div>

            {/* Bento Box Grid */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 max-w-7xl mx-auto">

                {/* Image 1 - Large */}
                <motion.div
                  className="md:col-span-2 lg:col-span-2 lg:row-span-2 relative group overflow-hidden rounded-2xl cursor-pointer"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                  onClick={() => setFullscreenImage(photo1)}
                >
                  <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full">
                    <img
                      src={photo1}
                      alt="Многофамилна сграда - Снимка 1"
                      className="w-full h-full object-cover transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-200" />
                  </div>
                </motion.div>

                {/* Image 2 - Medium */}
                <motion.div
                  className="lg:col-span-1 relative group overflow-hidden rounded-2xl cursor-pointer"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                  onClick={() => setFullscreenImage(photo2)}
                >
                  <div className="relative aspect-[4/3]">
                    <img
                      src={photo2}
                      alt="Многофамилна сграда - Снимка 2"
                      className="w-full h-full object-cover transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-200" />
                  </div>
                </motion.div>

                {/* Image 3 - Medium */}
                <motion.div
                  className="lg:col-span-1 relative group overflow-hidden rounded-2xl cursor-pointer"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                  onClick={() => setFullscreenImage(photo3)}
                >
                  <div className="relative aspect-[4/3]">
                    <img
                      src={photo3}
                      alt="Многофамилна сграда - Снимка 3"
                      className="w-full h-full object-cover transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-200" />
                  </div>
                </motion.div>

                {/* Image 4 - Large */}
                <motion.div
                  className="md:col-span-2 lg:col-span-2 relative group overflow-hidden rounded-2xl cursor-pointer"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                  onClick={() => setFullscreenImage(photo4)}
                >
                  <div className="relative aspect-[16/9]">
                    <img
                      src={photo4}
                      alt="Многофамилна сграда - Снимка 4"
                      className="w-full h-full object-cover transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-200" />
                  </div>
                </motion.div>

              </div>

              <motion.div
                className="text-center mt-12 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-plaster/50 text-sm">
                  Натиснете ESC или X за затваряне
                </p>
              </motion.div>
            </div>

            {/* ESC key handler */}
            <div
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  if (fullscreenImage) {
                    setFullscreenImage(null);
                  } else {
                    setShowGallery(false);
                  }
                }
              }}
              tabIndex={0}
              className="fixed inset-0 -z-10"
            />
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
              alt="Многофамилна сграда - Fullscreen"
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

export default MnogofamilnaBlockSelection;
