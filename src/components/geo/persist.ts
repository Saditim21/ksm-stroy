/**
 * Save data to localStorage
 */
export function saveLocal(key: string, obj: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(obj));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

/**
 * Load data from localStorage
 */
export function loadLocal<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

/**
 * Export data as JSON string
 */
export function exportJSON(data: any): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Import data from JSON string
 */
export function importJSON<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
}

/**
 * Download JSON file
 */
export function downloadJSON(data: any, filename: string = 'towers-config.json'): void {
  const json = exportJSON(data);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
}

/**
 * Upload and parse JSON file
 */
export function uploadJSON<T>(file: File): Promise<T | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const json = e.target?.result as string;
      resolve(importJSON<T>(json));
    };
    reader.onerror = () => resolve(null);
    reader.readAsText(file);
  });
}