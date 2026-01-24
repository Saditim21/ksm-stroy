import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApartmentData, fetchGarageData, calculateStats, calculateGarageStats, clearCache } from '../services/googleSheets';

// Fallback data - used when Google Sheets is not configured or unavailable
import { getBlockAFallbackData, getBlockBFallbackData } from '../constants/apartmentFallbackData';

// Fallback data for garages and parking
const defaultGaragesFallback = [
  { number: 'Г-001', built: '21.07', ideal: '12.94', total: '34.01', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-002', built: '21.07', ideal: '12.94', total: '34.01', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-003', built: '21.07', ideal: '12.94', total: '34.01', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-004', built: '21.07', ideal: '12.94', total: '34.01', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-005', built: '21.07', ideal: '12.94', total: '34.01', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-006', built: '21.07', ideal: '12.94', total: '34.01', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-007', built: '21.07', ideal: '12.94', total: '34.01', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-008', built: '21.07', ideal: '12.94', total: '34.01', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-009', built: '21.07', ideal: '12.94', total: '34.01', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-010', built: '21.07', ideal: '12.94', total: '34.01', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-011', built: '21.82', ideal: '13.40', total: '35.22', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-012', built: '26.39', ideal: '16.21', total: '42.60', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-013', built: '22.37', ideal: '13.74', total: '36.11', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-014', built: '28.24', ideal: '17.34', total: '45.58', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-015', built: '28.77', ideal: '17.67', total: '46.44', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-016', built: '33.85', ideal: '20.80', total: '54.65', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-017', built: '33.93', ideal: '20.85', total: '54.78', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-018', built: '24.31', ideal: '14.93', total: '39.24', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-019', built: '23.87', ideal: '14.66', total: '38.53', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-020', built: '23.87', ideal: '14.66', total: '38.53', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-021', built: '24.31', ideal: '14.93', total: '39.24', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-022', built: '33.93', ideal: '20.85', total: '54.78', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-023', built: '33.85', ideal: '20.80', total: '54.65', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-024', built: '28.77', ideal: '17.67', total: '46.44', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-025', built: '28.25', ideal: '17.35', total: '45.60', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-026', built: '22.37', ideal: '13.74', total: '36.11', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-027', built: '26.39', ideal: '16.21', total: '42.60', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-028', built: '21.82', ideal: '13.40', total: '35.22', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-029', built: '21.07', ideal: '12.94', total: '34.01', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-030', built: '21.07', ideal: '12.94', total: '34.01', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-031', built: '21.07', ideal: '12.94', total: '34.01', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-032', built: '21.07', ideal: '12.94', total: '34.01', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-033', built: '21.07', ideal: '12.94', total: '34.01', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-034', built: '21.07', ideal: '12.94', total: '34.01', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-035', built: '21.07', ideal: '14.81', total: '38.92', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-036', built: '27.24', ideal: '11.55', total: '30.35', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-037', built: '24.11', ideal: '12.38', total: '32.53', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-038', built: '18.80', ideal: '12.15', total: '31.94', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-039', built: '20.15', ideal: '19.44', total: '51.08', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-040', built: '19.79', ideal: '19.91', total: '52.32', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-041', built: '31.64', ideal: '19.91', total: '52.32', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-042', built: '32.41', ideal: '19.44', total: '51.08', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-043', built: '32.41', ideal: '12.15', total: '31.94', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-044', built: '31.64', ideal: '12.38', total: '32.53', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-045', built: '19.79', ideal: '11.55', total: '30.35', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-046', built: '20.15', ideal: '14.81', total: '38.92', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-047', built: '18.80', ideal: '16.73', total: '43.97', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-048', built: '24.11', ideal: '12.94', total: '34.01', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-049', built: '27.24', ideal: '12.94', total: '34.01', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-050', built: '21.07', ideal: '12.94', total: '34.01', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-051', built: '21.07', ideal: '16.73', total: '43.97', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-052', built: '21.07', ideal: '12.94', total: '34.01', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-053', built: '27.15', ideal: '16.67', total: '43.82', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-054', built: '18.80', ideal: '11.55', total: '30.35', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-055', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-056', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-057', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-058', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-059', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-060', built: '24.76', ideal: '15.21', total: '39.97', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-061', built: '21.12', ideal: '12.97', total: '34.09', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-062', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-063', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-064', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-065', built: '21.12', ideal: '12.97', total: '34.09', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-066', built: '21.12', ideal: '12.97', total: '34.09', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-067', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-068', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-069', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-070', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-071', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-072', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-073', built: '21.12', ideal: '12.97', total: '34.09', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-074', built: '21.12', ideal: '12.97', total: '34.09', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-075', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-076', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-077', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-078', built: '21.12', ideal: '12.97', total: '34.09', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-079', built: '24.77', ideal: '15.21', total: '39.98', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-080', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-081', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-082', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-083', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-084', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-085', built: '18.20', ideal: '11.18', total: '29.38', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-086', built: '22.46', ideal: '13.79', total: '36.25', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-087', built: '25.34', ideal: '15.56', total: '40.90', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-088', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-089', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-090', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-091', built: '25.38', ideal: '15.59', total: '40.97', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-092', built: '25.38', ideal: '15.59', total: '40.97', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-093', built: '34.76', ideal: '21.35', total: '56.11', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-094', built: '34.76', ideal: '21.35', total: '56.11', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-095', built: '33.49', ideal: '20.57', total: '54.06', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-096', built: '33.49', ideal: '20.57', total: '54.06', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-097', built: '34.76', ideal: '21.35', total: '56.11', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-098', built: '34.13', ideal: '20.96', total: '55.09', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-099', built: '34.13', ideal: '20.96', total: '55.09', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-100', built: '34.76', ideal: '21.35', total: '56.11', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-101', built: '33.49', ideal: '20.57', total: '54.06', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-102', built: '33.49', ideal: '20.57', total: '54.06', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-103', built: '34.76', ideal: '21.35', total: '56.11', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-104', built: '34.76', ideal: '21.35', total: '56.11', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-105', built: '25.38', ideal: '15.59', total: '40.97', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-106', built: '25.38', ideal: '15.59', total: '40.97', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-107', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-108', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-109', built: '20.39', ideal: '12.52', total: '32.91', type: 'Гараж', status: 'Продадени' },
  { number: 'Г-110', built: '26.44', ideal: '16.24', total: '42.68', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-111', built: '27.15', ideal: '16.67', total: '43.82', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-112', built: '18.64', ideal: '11.45', total: '30.09', type: 'Гараж', status: 'Свободен' },
  { number: 'Г-113', built: '26.13', ideal: '16.05', total: '42.18', type: 'Гараж', status: 'Свободен' },
];

const defaultParkingFallback = [
  { number: 'ПМ-01', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-02', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Продадени' },
  { number: 'ПМ-03', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-04', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-05', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Продадени' },
  { number: 'ПМ-06', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Продадени' },
  { number: 'ПМ-07', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Продадени' },
  { number: 'ПМ-08', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Продадени' },
  { number: 'ПМ-09', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Продадени' },
  { number: 'ПМ-10', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Продадени' },
  { number: 'ПМ-11', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Продадени' },
  { number: 'ПМ-12', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Продадени' },
  { number: 'ПМ-13', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-14', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-15', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-16', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-17', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-18', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-19', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Продадени' },
  { number: 'ПМ-20', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-21', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-22', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-23', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-24', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-25', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-26', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-27', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-28', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-29', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-30', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-31', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-32', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-33', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-34', built: '17.67', ideal: '10.85', total: '28.52', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-35', built: '14.44', ideal: '8.87', total: '23.31', type: 'Паркомясто', status: 'Продадени' },
  { number: 'ПМ-36', built: '13.78', ideal: '8.46', total: '22.24', type: 'Паркомясто', status: 'Продадени' },
  { number: 'ПМ-37', built: '13.78', ideal: '8.46', total: '22.24', type: 'Паркомясто', status: 'Продадени' },
  { number: 'ПМ-38', built: '13.78', ideal: '8.46', total: '22.24', type: 'Паркомясто', status: 'Продадени' },
  { number: 'ПМ-39', built: '13.78', ideal: '8.46', total: '22.24', type: 'Паркомясто', status: 'Продадени' },
  { number: 'ПМ-40', built: '13.78', ideal: '8.46', total: '22.24', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-41', built: '13.78', ideal: '8.46', total: '22.24', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-42', built: '14.44', ideal: '8.87', total: '23.31', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-43', built: '14.44', ideal: '8.87', total: '23.31', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-44', built: '13.78', ideal: '8.46', total: '22.24', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-45', built: '13.78', ideal: '8.46', total: '22.24', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-46', built: '13.78', ideal: '8.46', total: '22.24', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-47', built: '13.78', ideal: '8.46', total: '22.24', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-48', built: '13.78', ideal: '8.46', total: '22.24', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-49', built: '14.44', ideal: '8.87', total: '23.31', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-50', built: '14.96', ideal: '9.19', total: '24.15', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-51', built: '14.96', ideal: '9.19', total: '24.15', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-52', built: '14.96', ideal: '9.19', total: '24.15', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-53', built: '14.96', ideal: '9.19', total: '24.15', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-54', built: '14.96', ideal: '9.19', total: '24.15', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-55', built: '14.96', ideal: '9.19', total: '24.15', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-56', built: '14.96', ideal: '9.19', total: '24.15', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-57', built: '14.96', ideal: '9.19', total: '24.15', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-58', built: '14.96', ideal: '9.19', total: '24.15', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-59', built: '14.96', ideal: '9.19', total: '24.15', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-60', built: '14.96', ideal: '9.19', total: '24.15', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-61', built: '14.96', ideal: '9.19', total: '24.15', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-62', built: '14.96', ideal: '9.19', total: '24.15', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-63', built: '14.96', ideal: '9.19', total: '24.15', type: 'Паркомясто', status: 'Продадени' },
  { number: 'ПМ-64', built: '14.96', ideal: '9.19', total: '24.15', type: 'Паркомясто', status: 'Продадени' },
  { number: 'ПМ-65', built: '14.96', ideal: '9.19', total: '24.15', type: 'Паркомясто', status: 'Продадени' },
  { number: 'ПМ-66', built: '24.23', ideal: '14.88', total: '39.11', type: 'Паркомясто', status: 'Продадени' },
  { number: 'ПМ-67', built: '18.53', ideal: '11.38', total: '29.91', type: 'Паркомясто', status: 'Свободен' },
  { number: 'ПМ-68', built: '18.53', ideal: '11.38', total: '29.91', type: 'Паркомясто', status: 'Свободен' },
];

const ApartmentContext = createContext(null);

export function ApartmentProvider({ children }) {
  const [blockAData, setBlockAData] = useState(null);
  const [blockBData, setBlockBData] = useState(null);
  const [garagesData, setGaragesData] = useState(null);
  const [parkingData, setParkingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch all data in parallel
        const [blockA, blockB, garages, parking] = await Promise.all([
          fetchApartmentData('blockA'),
          fetchApartmentData('blockB'),
          fetchGarageData('garages'),
          fetchGarageData('parking'),
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

      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
        // Use fallback data on error
        setBlockAData(getBlockAFallbackData());
        setBlockBData(getBlockBFallbackData());
        setGaragesData(defaultGaragesFallback);
        setParkingData(defaultParkingFallback);
        setUsingFallback(true);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Calculate combined stats for Golden Residence
  const getGoldenResidenceStats = () => {
    const defaultStats = {
      apartments: { total: 192, available: 127, reserved: 6, sold: 59 },
      garages: { total: 224, available: 172, reserved: 2, sold: 50 },
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

  // Refresh data from Google Sheets
  const refreshData = async () => {
    setLoading(true);
    // Clear cache to ensure fresh data is fetched
    clearCache();
    try {
      const [blockA, blockB, garages, parking] = await Promise.all([
        fetchApartmentData('blockA'),
        fetchApartmentData('blockB'),
        fetchGarageData('garages'),
        fetchGarageData('parking'),
      ]);

      if (blockA) setBlockAData(blockA);
      if (blockB) setBlockBData(blockB);
      if (garages) setGaragesData(garages);
      if (parking) setParkingData(parking);
      setUsingFallback(!blockA && !blockB);

    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setLoading(false);
    }
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
    refreshData,
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
