/**
 * Demo Page for Floor Highlighter Component
 * 
 * This demonstrates the complete Floor Highlighter functionality
 * with a sample building image and interactive features.
 */

import React from 'react';
import FloorHighlighter from './FloorHighlighter';

const Demo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Проекти → Детайлен изглед
          </h1>
          <p className="text-gray-600 mt-1">
            Интерактивна визуализация на етажи с перфектно подравняване
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-6">
        <FloorHighlighter />
      </main>

      {/* Instructions */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Как да използвате компонента
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Преминете с мишката върху етаж в списъка или върху сградата</li>
                <li>• Кликнете за избор на етаж и показване на детайли</li>
                <li>• Използвайте стрелките ↑↓ за навигация с клавиатура</li>
                <li>• Enter/Space за избор, Escape за отмяна</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Технически характеристики
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• SVG полигони с перфектно подравняване</li>
                <li>• Респонсивен дизайн с процентни координати</li>
                <li>• Плавни CSS преходи (250-300ms)</li>
                <li>• Пълна достъпност с ARIA атрибути</li>
              </ul>
            </div>
          </div>
          
          {/* Calibration Instructions */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-lg font-semibold text-blue-900 mb-3">
              Настройка за нова сграда
            </h4>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-800">
              <div>
                <h5 className="font-medium mb-2">Стъпки за калибриране:</h5>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Заменете изображението в BUILDING_IMAGE</li>
                  <li>Включете CALIBRATION_MODE = true</li>
                  <li>Кликнете 4-те ъгъла на фасадата (ляво-горе, дясно-горе, дясно-долу, ляво-долу)</li>
                  <li>Настройте броя етажи и отстояния</li>
                  <li>Експортирайте JSON с координатите</li>
                  <li>Заменете DEFAULT_FACADE с новите данни</li>
                  <li>Изключете CALIBRATION_MODE = false</li>
                </ol>
              </div>
              
              <div>
                <h5 className="font-medium mb-2">Алгоритъм за генериране:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>Дефинира фасадата като четириъгълник (LT, RT, RB, LB)</li>
                  <li>Разделя вертикално на n етажа</li>
                  <li>Интерполира линейно по левия и десния ръб</li>
                  <li>Прилага padding за избягване на припокриване</li>
                  <li>Генерира полигони в процентни координати</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Demo;