import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import blockAImage from '../assets/продажби/project 1/block-A/blockA.png';
import blockBImage from '../assets/продажби/project 1/block-B/blockB.png';

const MnogofamilnaBlockSelection = () => {
  const navigate = useNavigate();

  const handleBlockSelect = (block) => {
    navigate(`/projects/mnogofamilna-sgrada/${block}`);
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
                  onClick={() => navigate('/projects')}
                  className="text-gray-800 hover:text-gray-600 active:text-gray-900 transition-all duration-300 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-200/50 sm:justify-start sm:min-w-auto sm:px-2"
                >
                  <span className="text-2xl sm:text-xl font-bold">←</span>
                  <span className="hidden sm:inline sm:ml-2 sm:mr-1 text-base font-medium">Назад към проекти</span>
                </button>
              </div>

              <div className="flex justify-center">
                <motion.h1
                  className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 bg-clip-text text-transparent leading-tight text-center"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.7 }}
                >
                  Многофамилна жилищна сграда
                </motion.h1>
              </div>

              {/* Empty space for balance */}
              <div></div>
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
                backgroundImage: `url(${blockAImage})`,
                backgroundPosition: 'center center',
                backgroundSize: 'cover'
              }}
            >
              {/* Enhanced gradient overlay for mobile */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/60 group-hover:from-black/40 group-hover:via-black/20 group-hover:to-black/50 group-active:from-black/60 group-active:to-black/70 transition-all duration-500"></div>

              {/* Mobile-optimized blue accent overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

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
                      72 апартамента • 9 етажа
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
                backgroundImage: `url(${blockBImage})`,
                backgroundPosition: 'center center',
                backgroundSize: 'cover'
              }}
            >
              {/* Enhanced gradient overlay for mobile */}
              <div className="absolute inset-0 bg-gradient-to-bl from-black/50 via-black/30 to-black/60 group-hover:from-black/40 group-hover:via-black/20 group-hover:to-black/50 group-active:from-black/60 group-active:to-black/70 transition-all duration-500"></div>

              {/* Mobile-optimized blue accent overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

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
                      72 апартамента • 9 етажа
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

      </div>
    </div>
  );
};

export default MnogofamilnaBlockSelection;
