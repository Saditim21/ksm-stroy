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
 *
 * The "Статус" column accepts four values (case and plural forms are tolerated):
 *   Свободен · Резервиран · Продаден · Блокиран
 * See src/utils/propertyStatus.js for how they are normalized and counted.
 */

import { normalizeStatus, summarizeStatuses } from '../utils/propertyStatus';

// Replace this with your published Google Sheet CSV URL
// Format: https://docs.google.com/spreadsheets/d/e/SPREADSHEET_ID/pub?gid=SHEET_ID&single=true&output=csv
const SHEET_URLS = {
  blockA: import.meta.env.VITE_GOOGLE_SHEET_BLOCK_A || '',
  blockB: import.meta.env.VITE_GOOGLE_SHEET_BLOCK_B || '',
  garages: import.meta.env.VITE_GOOGLE_SHEET_GARAGES || '',
  parking: import.meta.env.VITE_GOOGLE_SHEET_PARKING || '',
  mnogoA: import.meta.env.VITE_GOOGLE_SHEET_MNOGO_A || '',
  mnogoB: import.meta.env.VITE_GOOGLE_SHEET_MNOGO_B || '',
};

// Cache duration in milliseconds (30 seconds for faster updates)
const CACHE_DURATION = 30 * 1000;

// In-memory cache
const cache = {
  blockA: { data: null, timestamp: 0 },
  blockB: { data: null, timestamp: 0 },
  garages: { data: null, timestamp: 0 },
  parking: { data: null, timestamp: 0 },
  mnogoA: { data: null, timestamp: 0 },
  mnogoB: { data: null, timestamp: 0 },
};

/**
 * Parse CSV string into array of objects
 */
export function parseCSV(csvText) {
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
export function transformToApartmentData(rawData) {
  const floorData = {};

  rawData.forEach(row => {
    const floor = parseInt(row['Етаж'] || row['Floor'] || '0', 10);

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
      status: row['Статус'] || row['Status'],
      цена: row['Цена'] || row['Price'] || '',
    });
  });

  return normalizeFloorData(floorData);
}

/**
 * The last step for every floor map the site shows, a sheet's rows or the
 * Многофамилна data built into the site (ApartmentContext): floor 0, the
 * Многофамилна garages that no page lists, is dropped, and every status goes
 * through normalizeStatus(). Returns new rows; the input is left as it was.
 */
export function normalizeFloorData(floorData) {
  const normalized = {};
  for (const [floor, apartments] of Object.entries(floorData)) {
    if (Number(floor) === 0) continue;
    normalized[floor] = apartments.map((apartment) => ({
      ...apartment,
      status: normalizeStatus(apartment.status),
    }));
  }
  return normalized;
}

/**
 * Fetch a published sheet's CSV text, past every cache on the way.
 *
 * No custom request header on purpose: one (it used to be Cache-Control)
 * turns the fetch into a non-simple CORS request, which the browser preflights
 * with an OPTIONS request, once for docs.google.com and once more after it
 * redirects to googleusercontent.com. cache: 'no-store' and the _cb
 * cache-buster keep the data fresh without it.
 */
async function fetchSheetCSV(sheetUrl) {
  // Add cache-busting parameter to bypass Google's CDN cache
  const response = await fetch(`${sheetUrl}&_cb=${Date.now()}`, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to fetch sheet: ${response.status}`);
  }

  return response.text();
}

/**
 * Fetch apartment data from Google Sheets
 */
export async function fetchApartmentData(block = 'blockA') {
  const sheetUrl = SHEET_URLS[block];

  // No URL configured (the Многофамилна sheets are optional): return null, and
  // the caller uses the data built into the site. Silently, as it is no error.
  if (!sheetUrl) return null;

  // Check cache
  const cached = cache[block];
  if (cached.data && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Using cached data for ${block}`);
    return cached.data;
  }

  try {
    const csvText = await fetchSheetCSV(sheetUrl);
    const rawData = parseCSV(csvText);
    const apartmentData = transformToApartmentData(rawData);

    // A 200 that parses to nothing (Google serving an HTML error/login page,
    // an emptied tab) must behave like a failure — an empty {} is truthy and
    // would otherwise sail past the caller's fallback check and grey out the
    // whole site.
    if (Object.keys(apartmentData).length === 0) {
      throw new Error('Sheet response contained no apartment rows');
    }

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
  const statuses = Object.values(floorData).flatMap(apartments =>
    apartments.map(apt => apt.status)
  );
  return summarizeStatuses(statuses);
}

/**
 * Transform raw sheet data to garage/parking format (flat list). A row with no
 * Номер names no place (a blank line), so it is left out.
 */
function transformToGarageData(rawData) {
  return rawData.map(row => ({
    number: row['Номер'] || row['Number'] || '',
    built: row['Застроена'] || row['Built'] || '',
    ideal: row['Идеални'] || row['Ideal'] || '',
    total: row['Обща'] || row['Total'] || '',
    type: row['Тип'] || row['Type'] || 'Гараж',
    status: normalizeStatus(row['Статус'] || row['Status']),
  })).filter(item => item.number !== '');
}

// The columns a garage or parking tab must have. Sheet columns are never
// renamed, so a body without them is not the tab: Google's HTML error page has
// neither, and without Статус every place would read as free.
const GARAGE_COLUMNS = ['Номер', 'Статус'];

/**
 * Fetch garage or parking data from Google Sheets
 */
export async function fetchGarageData(type = 'garages') {
  const sheetUrl = SHEET_URLS[type];

  // No URL configured: return null, silently; the caller uses the built-in list.
  if (!sheetUrl) return null;

  const cached = cache[type];
  if (cached.data && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Using cached data for ${type}`);
    return cached.data;
  }

  try {
    const csvText = await fetchSheetCSV(sheetUrl);
    const header = parseCSVLine(csvText.trim().split('\n')[0]).map((name) => name.trim());
    const missing = GARAGE_COLUMNS.filter((column) => !header.includes(column));
    if (missing.length > 0) {
      throw new Error(`Sheet response has no ${missing.join(' or ')} column`);
    }

    const garageData = transformToGarageData(parseCSV(csvText));

    // Same trap as above: [] is truthy, so an unparsable 200 would silently
    // replace the fallback list with nothing.
    if (garageData.length === 0) {
      throw new Error('Sheet response contained no rows');
    }

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
  return summarizeStatuses(garageData.map(item => item.status));
}

/**
 * Clear the cache (useful for forcing refresh)
 */
export function clearCache() {
  cache.blockA = { data: null, timestamp: 0 };
  cache.blockB = { data: null, timestamp: 0 };
  cache.garages = { data: null, timestamp: 0 };
  cache.parking = { data: null, timestamp: 0 };
  cache.mnogoA = { data: null, timestamp: 0 };
  cache.mnogoB = { data: null, timestamp: 0 };
}
