/**
 * Fallback apartment data
 * Used when Google Sheets is not configured or unavailable
 * This data is automatically used as a backup
 */

export function getBlockAFallbackData() {
  return {
    1: [
      { apartment: 'А 101', built: '57.46', ideal: '8.22', total: '65.68', status: 'Свободен' },
      { apartment: 'А 102', built: '97.74', ideal: '14.00', total: '111.74', status: 'Свободен' },
      { apartment: 'А 103', built: '93.78', ideal: '13.46', total: '107.24', status: 'Свободен' },
      { apartment: 'А 104', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
      { apartment: 'А 105', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
      { apartment: 'А 106', built: '100.20', ideal: '14.38', total: '114.58', status: 'Свободен' },
      { apartment: 'А 107', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
      { apartment: 'А 108', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
      { apartment: 'А 109', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
      { apartment: 'А 110', built: '94.94', ideal: '13.62', total: '108.56', status: 'Свободен' },
      { apartment: 'А 111', built: '51.88', ideal: '7.43', total: '59.31', status: 'Свободен' },
      { apartment: 'А 112', built: '38.46', ideal: '5.52', total: '43.98', вид: 'Ателие', status: 'Свободен' }
    ],
    2: [
      { apartment: 'А 201', built: '54.36', ideal: '7.82', вид: '2-стаен', total: '62.18', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 202', built: '88.75', ideal: '12.73', вид: '3-стаен', total: '101.48', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'А 203', built: '93.78', ideal: '13.46', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 204', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 205', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Свободен' },
      { apartment: 'А 206', built: '100.20', ideal: '14.38', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Свободен' },
      { apartment: 'А 207', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 208', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 209', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 210', built: '94.94', ideal: '13.62', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'А 211', built: '55.54', ideal: '7.97', вид: '2-стаен', total: '63.51', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 212', built: '38.46', ideal: '5.52', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ],
    3: [
      { apartment: 'А 301', built: '54.36', ideal: '7.82', вид: '2-стаен', total: '62.18', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 302', built: '88.75', ideal: '12.73', вид: '3-стаен', total: '101.48', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'А 303', built: '93.78', ideal: '13.46', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Продадени' },
      { apartment: 'А 304', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 305', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Свободен' },
      { apartment: 'А 306', built: '100.20', ideal: '14.38', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Свободен' },
      { apartment: 'А 307', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 308', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 309', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Продадени' },
      { apartment: 'А 310', built: '94.94', ideal: '13.62', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'А 311', built: '55.54', ideal: '7.97', вид: '2-стаен', total: '63.51', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 312', built: '38.46', ideal: '5.52', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ],
    4: [
      { apartment: 'А 401', built: '54.38', ideal: '7.80', вид: '2-стаен', total: '62.18', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 402', built: '88.75', ideal: '12.73', вид: '3-стаен', total: '101.48', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'А 403', built: '93.78', ideal: '13.46', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 404', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 405', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Свободен' },
      { apartment: 'А 406', built: '100.20', ideal: '14.38', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Резервиран' },
      { apartment: 'А 407', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 408', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 409', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Продадени' },
      { apartment: 'А 410', built: '94.94', ideal: '13.62', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'А 411', built: '55.54', ideal: '7.97', вид: '2-стаен', total: '63.51', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 412', built: '38.46', ideal: '5.52', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ],
    5: [
      { apartment: 'А 501', built: '54.38', ideal: '7.80', вид: '2-стаен', total: '62.18', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 502', built: '88.75', ideal: '12.73', вид: '3-стаен', total: '101.48', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'А 503', built: '93.78', ideal: '13.46', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 504', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 505', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Свободен' },
      { apartment: 'А 506', built: '100.20', ideal: '14.38', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Резервиран' },
      { apartment: 'А 507', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 508', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 509', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Продадени' },
      { apartment: 'А 510', built: '94.94', ideal: '13.62', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'А 511', built: '55.54', ideal: '7.97', вид: '2-стаен', total: '63.51', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 512', built: '38.46', ideal: '5.52', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ],
    6: [
      { apartment: 'А 601', built: '54.38', ideal: '7.80', вид: '2-стаен', total: '62.18', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 602', built: '88.75', ideal: '12.73', вид: '3-стаен', total: '101.48', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'А 603', built: '93.78', ideal: '13.46', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 604', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 605', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Свободен' },
      { apartment: 'А 606', built: '100.20', ideal: '14.38', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Резервиран' },
      { apartment: 'А 607', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Резервиран' },
      { apartment: 'А 608', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Резервиран' },
      { apartment: 'А 609', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Резервиран' },
      { apartment: 'А 610', built: '94.94', ideal: '13.62', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'А 611', built: '55.54', ideal: '7.97', вид: '2-стаен', total: '63.51', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 612', built: '38.46', ideal: '5.52', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ],
    7: [
      { apartment: 'А 701', built: '54.38', ideal: '7.80', вид: '2-стаен', total: '62.18', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 702', built: '88.75', ideal: '12.73', вид: '3-стаен', total: '101.48', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'А 703', built: '93.78', ideal: '13.46', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 704', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Продадени' },
      { apartment: 'А 705', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Продадени' },
      { apartment: 'А 706', built: '100.20', ideal: '14.38', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Продадени' },
      { apartment: 'А 707', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 708', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 709', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Продадени' },
      { apartment: 'А 710', built: '94.94', ideal: '13.62', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'А 711', built: '55.54', ideal: '7.97', вид: '2-стаен', total: '63.51', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 712', built: '38.46', ideal: '5.52', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ],
    8: [
      { apartment: 'А 801', built: '54.38', ideal: '7.80', вид: '2-стаен', total: '62.18', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 802', built: '88.75', ideal: '12.73', вид: '3-стаен', total: '101.48', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'А 803', built: '93.78', ideal: '13.46', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 804', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'А 805', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Свободен' },
      { apartment: 'А 806', built: '100.20', ideal: '14.38', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Свободен' },
      { apartment: 'А 807', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 808', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 809', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'А 810', built: '94.94', ideal: '13.62', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'А 811', built: '55.54', ideal: '7.97', вид: '2-стаен', total: '63.51', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'А 812', built: '38.46', ideal: '5.52', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ]
  };
}

export function getBlockBFallbackData() {
  return {
    1: [
      { apartment: 'Б 101', built: '57.46', ideal: '8.22', вид: '2-стаен', total: '65.68', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'Б 102', built: '97.74', ideal: '14.00', вид: '3-стаен', total: '111.74', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'Б 103', built: '93.78', ideal: '13.46', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'Б 104', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'Б 105', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Свободен' },
      { apartment: 'Б 106', built: '100.20', ideal: '14.38', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Свободен' },
      { apartment: 'Б 107', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'Б 108', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'Б 109', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'Б 110', built: '94.94', ideal: '13.62', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'Б 111', built: '51.88', ideal: '7.43', вид: '2-стаен', total: '59.31', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'Б 112', built: '38.46', ideal: '5.52', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ],
    2: [
      { apartment: 'Б 201', built: '54.38', ideal: '7.80', вид: '2-стаен', total: '62.18', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'Б 202', built: '88.75', ideal: '12.73', вид: '3-стаен', total: '101.48', изложение: 'Юг/Изток', status: 'Свободен' },
      { apartment: 'Б 203', built: '93.78', ideal: '13.46', вид: '3-стаен', total: '107.24', изложение: 'Изток', status: 'Свободен' },
      { apartment: 'Б 204', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Изток', status: 'Продадени' },
      { apartment: 'Б 205', built: '59.36', ideal: '8.52', вид: '2-стаен', total: '67.88', изложение: 'Север', status: 'Свободен' },
      { apartment: 'Б 206', built: '100.20', ideal: '14.38', вид: '3-стаен', total: '114.58', изложение: 'Север/Запад', status: 'Свободен' },
      { apartment: 'Б 207', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'Б 208', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'Б 209', built: '61.11', ideal: '8.77', вид: '2-стаен', total: '69.88', изложение: 'Запад', status: 'Свободен' },
      { apartment: 'Б 210', built: '94.94', ideal: '13.62', вид: '3-стаен', total: '108.56', изложение: 'Запад/Юг', status: 'Свободен' },
      { apartment: 'Б 211', built: '55.54', ideal: '7.97', вид: '2-стаен', total: '63.51', изложение: 'Юг', status: 'Свободен' },
      { apartment: 'Б 212', built: '38.46', ideal: '5.52', вид: 'Ателие', total: '43.98', изложение: 'Юг', status: 'Свободен' }
    ],
    3: [
      { apartment: 'Б 301', built: '54.38', ideal: '7.80', total: '62.18', status: 'Продадени' },
      { apartment: 'Б 302', built: '88.75', ideal: '12.73', total: '101.48', status: 'Продадени' },
      { apartment: 'Б 303', built: '93.78', ideal: '13.46', total: '107.24', status: 'Продадени' },
      { apartment: 'Б 304', built: '59.36', ideal: '8.52', total: '67.88', status: 'Продадени' },
      { apartment: 'Б 305', built: '59.36', ideal: '8.52', total: '67.88', status: 'Продадени' },
      { apartment: 'Б 306', built: '100.20', ideal: '14.38', total: '114.58', status: 'Продадени' },
      { apartment: 'Б 307', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
      { apartment: 'Б 308', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
      { apartment: 'Б 309', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
      { apartment: 'Б 310', built: '94.94', ideal: '13.62', total: '108.56', status: 'Продадени' },
      { apartment: 'Б 311', built: '55.54', ideal: '7.97', total: '63.51', status: 'Продадени' },
      { apartment: 'Б 312', built: '38.46', ideal: '5.52', total: '43.98', вид: 'Ателие', status: 'Продадени' }
    ],
    4: [
      { apartment: 'Б 401', built: '54.38', ideal: '7.80', total: '62.18', status: 'Продадени' },
      { apartment: 'Б 402', built: '88.75', ideal: '12.73', total: '101.48', status: 'Продадени' },
      { apartment: 'Б 403', built: '93.78', ideal: '13.46', total: '107.24', status: 'Продадени' },
      { apartment: 'Б 404', built: '59.36', ideal: '8.52', total: '67.88', status: 'Продадени' },
      { apartment: 'Б 405', built: '59.36', ideal: '8.52', total: '67.88', status: 'Продадени' },
      { apartment: 'Б 406', built: '100.20', ideal: '14.38', total: '114.58', status: 'Продадени' },
      { apartment: 'Б 407', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
      { apartment: 'Б 408', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
      { apartment: 'Б 409', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
      { apartment: 'Б 410', built: '94.94', ideal: '13.62', total: '108.56', status: 'Продадени' },
      { apartment: 'Б 411', built: '55.54', ideal: '7.97', total: '63.51', status: 'Продадени' },
      { apartment: 'Б 412', built: '38.46', ideal: '5.52', total: '43.98', вид: 'Ателие', status: 'Продадени' }
    ],
    5: [
      { apartment: 'Б 501', built: '54.38', ideal: '7.80', total: '62.18', status: 'Продадени' },
      { apartment: 'Б 502', built: '88.75', ideal: '12.73', total: '101.48', status: 'Продадени' },
      { apartment: 'Б 503', built: '93.78', ideal: '13.46', total: '107.24', status: 'Продадени' },
      { apartment: 'Б 504', built: '59.36', ideal: '8.52', total: '67.88', status: 'Продадени' },
      { apartment: 'Б 505', built: '59.36', ideal: '8.52', total: '67.88', status: 'Продадени' },
      { apartment: 'Б 506', built: '100.20', ideal: '14.38', total: '114.58', status: 'Продадени' },
      { apartment: 'Б 507', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
      { apartment: 'Б 508', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
      { apartment: 'Б 509', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
      { apartment: 'Б 510', built: '94.94', ideal: '13.62', total: '108.56', status: 'Продадени' },
      { apartment: 'Б 511', built: '55.54', ideal: '7.97', total: '63.51', status: 'Продадени' },
      { apartment: 'Б 512', built: '38.46', ideal: '5.52', total: '43.98', вид: 'Ателие', status: 'Продадени' }
    ],
    6: [
      { apartment: 'Б 601', built: '54.38', ideal: '7.80', total: '62.18', status: 'Продадени' },
      { apartment: 'Б 602', built: '88.75', ideal: '12.73', total: '101.48', status: 'Продадени' },
      { apartment: 'Б 603', built: '93.78', ideal: '13.46', total: '107.24', status: 'Продадени' },
      { apartment: 'Б 604', built: '59.36', ideal: '8.52', total: '67.88', status: 'Продадени' },
      { apartment: 'Б 605', built: '59.36', ideal: '8.52', total: '67.88', status: 'Продадени' },
      { apartment: 'Б 606', built: '100.20', ideal: '14.38', total: '114.58', status: 'Продадени' },
      { apartment: 'Б 607', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
      { apartment: 'Б 608', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
      { apartment: 'Б 609', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
      { apartment: 'Б 610', built: '94.94', ideal: '13.62', total: '108.56', status: 'Продадени' },
      { apartment: 'Б 611', built: '55.54', ideal: '7.97', total: '63.51', status: 'Продадени' },
      { apartment: 'Б 612', built: '38.46', ideal: '5.52', total: '43.98', вид: 'Ателие', status: 'Продадени' }
    ],
    7: [
      { apartment: 'Б 701', built: '54.38', ideal: '7.80', total: '62.18', status: 'Свободен' },
      { apartment: 'Б 702', built: '88.75', ideal: '12.73', total: '101.48', status: 'Свободен' },
      { apartment: 'Б 703', built: '93.78', ideal: '13.46', total: '107.24', status: 'Свободен' },
      { apartment: 'Б 704', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
      { apartment: 'Б 705', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
      { apartment: 'Б 706', built: '100.20', ideal: '14.38', total: '114.58', status: 'Свободен' },
      { apartment: 'Б 707', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
      { apartment: 'Б 708', built: '61.11', ideal: '8.77', total: '69.88', status: 'Продадени' },
      { apartment: 'Б 709', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
      { apartment: 'Б 710', built: '94.94', ideal: '13.62', total: '108.56', status: 'Свободен' },
      { apartment: 'Б 711', built: '55.54', ideal: '7.97', total: '63.51', status: 'Свободен' },
      { apartment: 'Б 712', built: '38.46', ideal: '5.52', total: '43.98', вид: 'Ателие', status: 'Свободен' }
    ],
    8: [
      { apartment: 'Б 801', built: '54.38', ideal: '7.80', total: '62.18', status: 'Свободен' },
      { apartment: 'Б 802', built: '88.75', ideal: '12.73', total: '101.48', status: 'Свободен' },
      { apartment: 'Б 803', built: '93.78', ideal: '13.46', total: '107.24', status: 'Свободен' },
      { apartment: 'Б 804', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
      { apartment: 'Б 805', built: '59.36', ideal: '8.52', total: '67.88', status: 'Свободен' },
      { apartment: 'Б 806', built: '100.20', ideal: '14.38', total: '114.58', status: 'Свободен' },
      { apartment: 'Б 807', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
      { apartment: 'Б 808', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
      { apartment: 'Б 809', built: '61.11', ideal: '8.77', total: '69.88', status: 'Свободен' },
      { apartment: 'Б 810', built: '94.94', ideal: '13.62', total: '108.56', status: 'Свободен' },
      { apartment: 'Б 811', built: '55.54', ideal: '7.97', total: '63.51', status: 'Свободен' },
      { apartment: 'Б 812', built: '38.46', ideal: '5.52', total: '43.98', вид: 'Ателие', status: 'Свободен' }
    ]
  };
}
