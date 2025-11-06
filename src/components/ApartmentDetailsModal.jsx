import React from 'react';

const ApartmentDetailsModal = ({ isOpen, onClose, apartmentData, apartmentImage }) => {
  if (!isOpen || !apartmentData) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {apartmentData.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Затвори"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Image */}
            <div>
              {apartmentImage && (
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src={apartmentImage} 
                    alt={apartmentData.name}
                    className="w-full h-auto"
                  />
                </div>
              )}
            </div>

            {/* Right Side - Details */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Основна информация</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-sm text-gray-600">Етаж:</span>
                    <span className="block text-lg font-medium text-gray-900">{apartmentData.floor}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-600">Вид:</span>
                    <span className="block text-lg font-medium text-gray-900">{apartmentData.type}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-600">Обща площ:</span>
                    <span className="block text-lg font-medium text-gray-900">{apartmentData.totalArea}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-600">Статус:</span>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      apartmentData.status === 'Свободен' 
                        ? 'bg-green-100 text-green-800' 
                        : apartmentData.status === 'Резервиран'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {apartmentData.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  НЕКА ВИ БЪДЕМ ПО-ПОЛЕЗНИ. ВИЕ ИМАТЕ, НИЕ ОТГОВОРИ
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p className="font-semibold">СВЪРЖЕТЕ СЕ С НАС</p>
                  <p>София, бул"Христо Смирненски"23</p>
                  <p>Мобилен телефон</p>
                  <p>ksm_str@abv.bg</p>
                </div>
                
                {apartmentData.status === 'Свободен' && (
                  <div className="mt-6">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                      Запитване за апартамента
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentDetailsModal;