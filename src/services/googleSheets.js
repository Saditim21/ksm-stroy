/**
 * Google Sheets Service
 * Fetches apartment data from a public Google Sheet
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a Google Sheet with your apartment data
 * 2. Go to File > Share > Publish to web
 * 3. Select the sheet tab and choose "Comma-separated values (.csv)"
 * 4. Click Publish and copy the URL
 * 5. Paste the URL in the SHEET_URL constant below
 */

// Replace this with your published Google Sheet CSV URL
// Format: https://docs.google.com/spreadsheets/d/e/SPREADSHEET_ID/pub?gid=SHEET_ID&single=true&output=csv
const SHEET_URLS = {
  blockA: import.meta.env.VITE_GOOGLE_SHEET_BLOCK_A || '',
  blockB: import.meta.env.VITE_GOOGLE_SHEET_BLOCK_B || '',
  garages: import.meta.env.VITE_GOOGLE_SHEET_GARAGES || '',
  parking: import.meta.env.VITE_GOOGLE_SHEET_PARKING || '',
};

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// In-memory cache
const cache = {
  blockA: { data: null, timestamp: 0 },
  blockB: { data: null, timestamp: 0 },
  garages: { data: null, timestamp: 0 },
  parking: { data: null, timestamp: 0 },
};

/**
 * Parse CSV string into array of objects
 */
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  // Parse header row
  const headers = parseCSVLine(lines[0]);

  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index].trim();
      });
      data.push(row);
    }
  }

  return data;
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);

  return values;
}

/**
 * Transform raw sheet data to apartment format
 */
function transformToApartmentData(rawData) {
  const floorData = {};

  rawData.forEach(row => {
    const floor = parseInt(row['Етаж'] || row['Floor'] || '0', 10);
    if (floor === 0) return;

    if (!floorData[floor]) {
      floorData[floor] = [];
    }

    floorData[floor].push({
      apartment: row['Апартамент'] || row['Apartment'] || '',
      built: row['Застроена'] || row['Built'] || '',
      ideal: row['Идеални'] || row['Ideal'] || '',
      вид: row['Вид'] || row['Type'] || '',
      total: row['Обща'] || row['Total'] || '',
      изложение: row['Изложение'] || row['Exposure'] || '',
      status: row['Статус'] || row['Status'] || 'Свободен',
    });
  });

  return floorData;
}

/**
 * Fetch apartment data from Google Sheets
 */
export async function fetchApartmentData(block = 'blockA') {
  const sheetUrl = SHEET_URLS[block];

  // If no URL configured, return null (will use fallback data)
  if (!sheetUrl) {
    console.log(`No Google Sheet URL configured for ${block}, using fallback data`);
    return null;
  }

  // Check cache
  const cached = cache[block];
  if (cached.data && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Using cached data for ${block}`);
    return cached.data;
  }

  try {
    const response = await fetch(sheetUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.status}`);
    }

    const csvText = await response.text();
    const rawData = parseCSV(csvText);
    const apartmentData = transformToApartmentData(rawData);

    // Update cache
    cache[block] = {
      data: apartmentData,
      timestamp: Date.now(),
    };

    console.log(`Fetched fresh data for ${block}:`, Object.keys(apartmentData).length, 'floors');
    return apartmentData;

  } catch (error) {
    console.error(`Error fetching apartment data for ${block}:`, error);

    // Return cached data if available (even if expired)
    if (cached.data) {
      console.log(`Using expired cache for ${block} due to error`);
      return cached.data;
    }

    return null;
  }
}

/**
 * Calculate apartment statistics from floor data
 */
export function calculateStats(floorData) {
  let total = 0;
  let available = 0;
  let reserved = 0;
  let sold = 0;

  Object.values(floorData).forEach(apartments => {
    apartments.forEach(apt => {
      total++;
      const status = (apt.status || '').toLowerCase();

      if (status.includes('свободен') || status.includes('available')) {
        available++;
      } else if (status.includes('резервиран') || status.includes('reserved')) {
        reserved++;
      } else if (status.includes('продаден') || status.includes('sold')) {
        sold++;
      }
    });
  });

  return { total, available, reserved, sold };
}

/**
 * Transform raw sheet data to garage/parking format (flat list)
 */
function transformToGarageData(rawData) {
  return rawData.map(row => ({
    number: row['Номер'] || row['Number'] || '',
    built: row['Застроена'] || row['Built'] || '',
    ideal: row['Идеални'] || row['Ideal'] || '',
    total: row['Обща'] || row['Total'] || '',
    type: row['Тип'] || row['Type'] || 'Гараж',
    status: row['Статус'] || row['Status'] || 'Свободен',
  }));
}

/**
 * Fetch garage or parking data from Google Sheets
 */
export async function fetchGarageData(type = 'garages') {
  const sheetUrl = SHEET_URLS[type];

  if (!sheetUrl) {
    console.log(`No Google Sheet URL configured for ${type}, using fallback data`);
    return null;
  }

  const cached = cache[type];
  if (cached.data && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Using cached data for ${type}`);
    return cached.data;
  }

  try {
    const response = await fetch(sheetUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.status}`);
    }

    const csvText = await response.text();
    const rawData = parseCSV(csvText);
    const garageData = transformToGarageData(rawData);

    cache[type] = {
      data: garageData,
      timestamp: Date.now(),
    };

    console.log(`Fetched fresh data for ${type}:`, garageData.length, 'items');
    return garageData;

  } catch (error) {
    console.error(`Error fetching ${type} data:`, error);

    if (cached.data) {
      console.log(`Using expired cache for ${type} due to error`);
      return cached.data;
    }

    return null;
  }
}

/**
 * Calculate garage/parking statistics from flat list
 */
export function calculateGarageStats(garageData) {
  let total = 0;
  let available = 0;
  let reserved = 0;
  let sold = 0;

  garageData.forEach(item => {
    total++;
    const status = (item.status || '').toLowerCase();

    if (status.includes('свободен') || status.includes('available')) {
      available++;
    } else if (status.includes('резервиран') || status.includes('reserved')) {
      reserved++;
    } else if (status.includes('продаден') || status.includes('sold')) {
      sold++;
    }
  });

  return { total, available, reserved, sold };
}

/**
 * Clear the cache (useful for forcing refresh)
 */
export function clearCache() {
  cache.blockA = { data: null, timestamp: 0 };
  cache.blockB = { data: null, timestamp: 0 };
  cache.garages = { data: null, timestamp: 0 };
  cache.parking = { data: null, timestamp: 0 };
}
