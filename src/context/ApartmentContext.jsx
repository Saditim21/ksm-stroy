import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { fetchApartmentData, fetchGarageData, calculateStats, calculateGarageStats, clearCache, normalizeFloorData } from '../services/googleSheets';

// Fallback data - used when Google Sheets is not configured or unavailable
import { getBlockAFallbackData, getBlockBFallbackData, getGaragesFallbackData, getParkingFallbackData } from '../constants/apartmentFallbackData';

// The Многофамилна data built into the site, for when its sheets are not
// configured (they are optional) or fail. Nothing needs it before the sheets
// have answered, so it is a chunk of its own, loaded only then, and it goes
// through the same normalizeFloorData() as a sheet's rows. If even the chunk
// fails to load, the project shows no floors and the rest of the data stands.
async function loadMnogoFallback() {
  try {
    const { getMnogoAFallbackData, getMnogoBFallbackData } = await import('../constants/mnogofamilnaFallbackData');
    return { A: normalizeFloorData(getMnogoAFallbackData()), B: normalizeFloorData(getMnogoBFallbackData()) };
  } catch (err) {
    console.error('Could not load the Многофамилна fallback data:', err);
    return { A: {}, B: {} };
  }
}

// Fallback data for garages and parking
const defaultGaragesFallback = getGaragesFallbackData();
const defaultParkingFallback = getParkingFallbackData();

const ApartmentContext = createContext(null);

// A change in a sheet reaches a page that is already open when the visitor
// comes back to its tab and what it shows is more than a minute old. Not on a
// timer: polling re-read every sheet every minute on every open tab, for
// changes nobody was looking at.
const STALE_AFTER_MS = 60 * 1000;

export function ApartmentProvider({ children }) {
  const [blockAData, setBlockAData] = useState(null);
  const [blockBData, setBlockBData] = useState(null);
  const [mnogoAData, setMnogoAData] = useState(null);
  const [mnogoBData, setMnogoBData] = useState(null);
  const [garagesData, setGaragesData] = useState(null);
  const [parkingData, setParkingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  // When the sheets were last read: the first load, or the last refresh.
  const readAt = useRef(0);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      readAt.current = Date.now();

      try {
        // Fetch all data in parallel
        const [blockA, blockB, garages, parking, mnogoA, mnogoB] = await Promise.all([
          fetchApartmentData('blockA'),
          fetchApartmentData('blockB'),
          fetchGarageData('garages'),
          fetchGarageData('parking'),
          fetchApartmentData('mnogoA'),
          fetchApartmentData('mnogoB'),
        ]);

        // Use fetched data or fallback for apartments
        if (blockA) {
          setBlockAData(blockA);
        } else {
          setBlockAData(getBlockAFallbackData());
          setUsingFallback(true);
        }

        if (blockB) {
          setBlockBData(blockB);
        } else {
          setBlockBData(getBlockBFallbackData());
          setUsingFallback(true);
        }

        // Use fetched data or fallback for garages/parking
        setGaragesData(garages || defaultGaragesFallback);
        setParkingData(parking || defaultParkingFallback);

        // Use fetched data or fallback for Многофамилна сграда
        const mnogoFallback = mnogoA && mnogoB ? null : await loadMnogoFallback();
        setMnogoAData(mnogoA || mnogoFallback.A);
        setMnogoBData(mnogoB || mnogoFallback.B);

      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
        // Use fallback data on error
        setBlockAData(getBlockAFallbackData());
        setBlockBData(getBlockBFallbackData());
        setGaragesData(defaultGaragesFallback);
        setParkingData(defaultParkingFallback);
        const mnogoFallback = await loadMnogoFallback();
        setMnogoAData(mnogoFallback.A);
        setMnogoBData(mnogoFallback.B);
        setUsingFallback(true);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Silent re-read of every sheet. Deliberately different from the initial
  // load: it never touches `loading` (no spinner mid-browse) and never falls
  // back to the bundled data — a failed refresh just keeps the last good rows.
  const backgroundRefresh = useCallback(async () => {
    readAt.current = Date.now();
    try {
      clearCache();
      const [blockA, blockB, garages, parking, mnogoA, mnogoB] = await Promise.all([
        fetchApartmentData('blockA'),
        fetchApartmentData('blockB'),
        fetchGarageData('garages'),
        fetchGarageData('parking'),
        fetchApartmentData('mnogoA'),
        fetchApartmentData('mnogoB'),
      ]);

      if (blockA) setBlockAData(blockA);
      if (blockB) setBlockBData(blockB);
      if (garages) setGaragesData(garages);
      if (parking) setParkingData(parking);
      if (mnogoA) setMnogoAData(mnogoA);
      if (mnogoB) setMnogoBData(mnogoB);
      if (blockA && blockB) setUsingFallback(false);
    } catch (err) {
      console.error('Background refresh failed, keeping current data:', err);
    }
  }, []);

  useEffect(() => {
    const refreshIfStale = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - readAt.current <= STALE_AFTER_MS) return;
      backgroundRefresh();
    };

    document.addEventListener('visibilitychange', refreshIfStale);
    return () => document.removeEventListener('visibilitychange', refreshIfStale);
  }, [backgroundRefresh]);

  // Calculate combined stats for Golden Residence
  const getGoldenResidenceStats = () => {
    const defaultStats = {
      apartments: { total: 192, available: 127, reserved: 6, sold: 59, blocked: 0 },
      garages: { total: 224, available: 172, reserved: 2, sold: 50, blocked: 0 },
    };

    if (!blockAData || !blockBData) {
      return defaultStats;
    }

    const blockAStats = calculateStats(blockAData);
    const blockBStats = calculateStats(blockBData);

    // Calculate garage stats (combine garages + parking)
    let garageStats = defaultStats.garages;
    if (garagesData && parkingData) {
      const gStats = calculateGarageStats(garagesData);
      const pStats = calculateGarageStats(parkingData);
      garageStats = {
        total: gStats.total + pStats.total,
        available: gStats.available + pStats.available,
        reserved: gStats.reserved + pStats.reserved,
        sold: gStats.sold + pStats.sold,
        blocked: gStats.blocked + pStats.blocked,
      };
    } else if (garagesData) {
      garageStats = calculateGarageStats(garagesData);
    } else if (parkingData) {
      garageStats = calculateGarageStats(parkingData);
    }

    return {
      apartments: {
        total: blockAStats.total + blockBStats.total,
        available: blockAStats.available + blockBStats.available,
        reserved: blockAStats.reserved + blockBStats.reserved,
        sold: blockAStats.sold + blockBStats.sold,
        blocked: blockAStats.blocked + blockBStats.blocked,
      },
      garages: garageStats,
    };
  };

  // Get floor data for a specific block
  const getFloorData = (block) => {
    if (block === 'block-a' || block === 'A') {
      return blockAData || getBlockAFallbackData();
    }
    return blockBData || getBlockBFallbackData();
  };

  // Get garages data
  const getGaragesData = () => {
    return garagesData || defaultGaragesFallback;
  };

  // Get parking data
  const getParkingData = () => {
    return parkingData || defaultParkingFallback;
  };

  // Get floor data scoped to a project + block. Многофамилна has no floors
  // until its data has loaded: its fallback is a chunk of its own.
  const getProjectFloorData = (projectId, blockId) => {
    if (projectId === 'mnogofamilna-sgrada') {
      if (blockId === 'block-a' || blockId === 'A') return mnogoAData || {};
      return mnogoBData || {};
    }
    return getFloorData(blockId);
  };

  const value = {
    blockAData,
    blockBData,
    garagesData,
    parkingData,
    loading,
    error,
    usingFallback,
    getFloorData,
    getGaragesData,
    getParkingData,
    getGoldenResidenceStats,
    getProjectFloorData,
  };

  return (
    <ApartmentContext.Provider value={value}>
      {children}
    </ApartmentContext.Provider>
  );
}

export function useApartments() {
  const context = useContext(ApartmentContext);
  if (!context) {
    throw new Error('useApartments must be used within an ApartmentProvider');
  }
  return context;
}

export default ApartmentContext;
