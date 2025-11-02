import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const GoldenResidenceBlockSelection = () => {
  const navigate = useNavigate();

  const handleBlockSelect = (block) => {
    navigate(`/projects/golden-residence/${block}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-16">
      <div className="container mx-auto px-4">
        <motion.div 
          className="mb-8 md:mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative mb-4">
            <button 
              onClick={() => navigate('/projects')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 text-black hover:text-gray-700 transition-colors duration-300 flex items-center"
            >
              <span className="mr-2">←</span>
              Назад към проекти
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-gold-600 text-center">Golden Residence</h1>
          </div>
          <p className="text-base md:text-lg text-gray-600 text-center">Изберете блок за преглед</p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-0 min-h-[60vh] md:h-[70vh] shadow-2xl rounded-lg overflow-hidden">
          {/* Block A - Left Side */}
          <motion.div 
            className="w-full md:w-1/2 relative group cursor-pointer overflow-hidden min-h-[50vh] md:min-h-full"
            onClick={() => handleBlockSelect('block-a')}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.02 }}
          >
            <div 
              className="w-full h-full bg-cover bg-center relative min-h-[50vh] md:min-h-full"
              style={{ 
                backgroundImage: `url('/src/assets/продажби/project 2/photos/golden-residence-6.png')` 
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300"></div>
              
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="text-center text-white">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <h2 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">БЛОК А</h2>
                    <p className="text-lg md:text-xl mb-6 drop-shadow-md">96 апартамента • 8 етажа</p>
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm px-6 md:px-8 py-3 rounded-full border-2 border-white group-hover:bg-opacity-30 transition-all duration-300">
                      <span className="text-base md:text-lg font-semibold">Преглед на блока</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Block B - Right Side */}
          <motion.div 
            className="w-full md:w-1/2 relative group cursor-pointer overflow-hidden min-h-[50vh] md:min-h-full"
            onClick={() => handleBlockSelect('block-b')}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.02 }}
          >
            <div 
              className="w-full h-full bg-cover bg-center relative min-h-[50vh] md:min-h-full"
              style={{ 
                backgroundImage: `url('/src/assets/продажби/project 2/photos/golden-residence-6.png')` 
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300"></div>
              
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="text-center text-white">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    <h2 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">БЛОК Б</h2>
                    <p className="text-lg md:text-xl mb-6 drop-shadow-md">96 апартамента • 8 етажа</p>
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm px-6 md:px-8 py-3 rounded-full border-2 border-white group-hover:bg-opacity-30 transition-all duration-300">
                      <span className="text-base md:text-lg font-semibold">Преглед на блока</span>
                    </div>
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

export default GoldenResidenceBlockSelection;