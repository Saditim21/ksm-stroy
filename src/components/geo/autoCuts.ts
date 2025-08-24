import { AutoCutsConfig, Quad } from './types';
import { computeHomography, projectPoint } from './homography';

export function autoCutsFromImage(config: AutoCutsConfig): number[] {
  const { img, quad, floors, garageIndex = 0 } = config;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const rectWidth = 512;
  const rectHeight = 1024;
  canvas.width = rectWidth;
  canvas.height = rectHeight;
  
  const H = computeHomography(quad);
  
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(rectWidth, 0);
  ctx.lineTo(rectWidth, rectHeight);
  ctx.lineTo(0, rectHeight);
  ctx.clip();
  
  const srcCanvas = document.createElement('canvas');
  const srcCtx = srcCanvas.getContext('2d')!;
  srcCanvas.width = img.width;
  srcCanvas.height = img.height;
  srcCtx.drawImage(img, 0, 0);
  
  for (let y = 0; y < rectHeight; y++) {
    for (let x = 0; x < rectWidth; x++) {
      const normX = x / rectWidth;
      const normY = y / rectHeight;
      const srcPoint = projectPoint(invertHomography(H), { x: normX, y: normY });
      
      const srcX = Math.round(srcPoint.x * img.width / 100);
      const srcY = Math.round(srcPoint.y * img.height / 100);
      
      if (srcX >= 0 && srcX < img.width && srcY >= 0 && srcY < img.height) {
        const pixelData = srcCtx.getImageData(srcX, srcY, 1, 1).data;
        ctx.fillStyle = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  ctx.restore();
  
  const imageData = ctx.getImageData(0, 0, rectWidth, rectHeight);
  const gray = toGrayscale(imageData);
  const blurred = gaussianBlur(gray, rectWidth, rectHeight, 1.2);
  const edges = sobelY(blurred, rectWidth, rectHeight);
  
  const profile = new Float32Array(rectHeight);
  for (let y = 0; y < rectHeight; y++) {
    let sum = 0;
    for (let x = 0; x < rectWidth; x++) {
      sum += edges[y * rectWidth + x];
    }
    profile[y] = sum / rectWidth;
  }
  
  const smoothed = boxFilter(profile, 5);
  const minDist = Math.floor(rectHeight / (floors + 1) / 2);
  const peaks = findPeaks(smoothed, minDist);
  
  const targetCount = floors + 1;
  let selected = selectBestPeaks(peaks, targetCount, rectHeight);
  
  if (garageIndex === 0) {
    const bottomRegion = peaks.filter(p => p.index > rectHeight * 0.08 && p.index < rectHeight * 0.15);
    if (bottomRegion.length > 0) {
      const strongest = bottomRegion.reduce((a, b) => a.value > b.value ? a : b);
      selected[0] = strongest.index;
    }
  }
  
  selected.sort((a, b) => a - b);
  
  return selected.map(idx => idx / rectHeight);
}

function toGrayscale(imageData: ImageData): Float32Array {
  const { data, width, height } = imageData;
  const gray = new Float32Array(width * height);
  
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    gray[j] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  
  return gray;
}

function gaussianBlur(data: Float32Array, width: number, height: number, sigma: number): Float32Array {
  const kernel = gaussianKernel(sigma);
  const kSize = kernel.length;
  const kHalf = Math.floor(kSize / 2);
  const result = new Float32Array(width * height);
  
  const temp = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let k = 0; k < kSize; k++) {
        const sx = Math.min(Math.max(x + k - kHalf, 0), width - 1);
        sum += data[y * width + sx] * kernel[k];
      }
      temp[y * width + x] = sum;
    }
  }
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let k = 0; k < kSize; k++) {
        const sy = Math.min(Math.max(y + k - kHalf, 0), height - 1);
        sum += temp[sy * width + x] * kernel[k];
      }
      result[y * width + x] = sum;
    }
  }
  
  return result;
}

function gaussianKernel(sigma: number): Float32Array {
  const size = Math.ceil(sigma * 6);
  const kernel = new Float32Array(size);
  const half = Math.floor(size / 2);
  let sum = 0;
  
  for (let i = 0; i < size; i++) {
    const x = i - half;
    kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
    sum += kernel[i];
  }
  
  for (let i = 0; i < size; i++) {
    kernel[i] /= sum;
  }
  
  return kernel;
}

function sobelY(data: Float32Array, width: number, height: number): Float32Array {
  const result = new Float32Array(width * height);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      const top = data[(y - 1) * width + (x - 1)] + 2 * data[(y - 1) * width + x] + data[(y - 1) * width + (x + 1)];
      const bottom = data[(y + 1) * width + (x - 1)] + 2 * data[(y + 1) * width + x] + data[(y + 1) * width + (x + 1)];
      
      result[idx] = Math.abs(bottom - top);
    }
  }
  
  let max = 0;
  for (let i = 0; i < result.length; i++) {
    if (result[i] > max) max = result[i];
  }
  
  if (max > 0) {
    for (let i = 0; i < result.length; i++) {
      result[i] /= max;
    }
  }
  
  return result;
}

function boxFilter(data: Float32Array, size: number): Float32Array {
  const result = new Float32Array(data.length);
  const half = Math.floor(size / 2);
  
  for (let i = 0; i < data.length; i++) {
    let sum = 0;
    let count = 0;
    
    for (let j = -half; j <= half; j++) {
      const idx = i + j;
      if (idx >= 0 && idx < data.length) {
        sum += data[idx];
        count++;
      }
    }
    
    result[i] = sum / count;
  }
  
  return result;
}

function findPeaks(data: Float32Array, minDistance: number): Array<{index: number, value: number}> {
  const peaks: Array<{index: number, value: number}> = [];
  
  for (let i = 1; i < data.length - 1; i++) {
    if (data[i] > data[i - 1] && data[i] > data[i + 1]) {
      let tooClose = false;
      for (const peak of peaks) {
        if (Math.abs(peak.index - i) < minDistance) {
          if (data[i] > peak.value) {
            peaks.splice(peaks.indexOf(peak), 1);
          } else {
            tooClose = true;
          }
          break;
        }
      }
      
      if (!tooClose) {
        peaks.push({ index: i, value: data[i] });
      }
    }
  }
  
  return peaks;
}

function selectBestPeaks(peaks: Array<{index: number, value: number}>, count: number, height: number): number[] {
  peaks.sort((a, b) => b.value - a.value);
  
  const selected = peaks.slice(0, Math.min(count, peaks.length)).map(p => p.index);
  
  while (selected.length < count) {
    const idx = selected.length;
    selected.push(Math.floor((idx * height) / count));
  }
  
  return selected;
}

function invertHomography(H: number[][]): number[][] {
  const det = 
    H[0][0] * (H[1][1] * H[2][2] - H[1][2] * H[2][1]) -
    H[0][1] * (H[1][0] * H[2][2] - H[1][2] * H[2][0]) +
    H[0][2] * (H[1][0] * H[2][1] - H[1][1] * H[2][0]);
  
  const invDet = 1 / det;
  
  return [
    [
      invDet * (H[1][1] * H[2][2] - H[1][2] * H[2][1]),
      invDet * (H[0][2] * H[2][1] - H[0][1] * H[2][2]),
      invDet * (H[0][1] * H[1][2] - H[0][2] * H[1][1])
    ],
    [
      invDet * (H[1][2] * H[2][0] - H[1][0] * H[2][2]),
      invDet * (H[0][0] * H[2][2] - H[0][2] * H[2][0]),
      invDet * (H[0][2] * H[1][0] - H[0][0] * H[1][2])
    ],
    [
      invDet * (H[1][0] * H[2][1] - H[1][1] * H[2][0]),
      invDet * (H[0][1] * H[2][0] - H[0][0] * H[2][1]),
      invDet * (H[0][0] * H[1][1] - H[0][1] * H[1][0])
    ]
  ];
}

export function kmeans1d(data: number[], k: number): number[] {
  let centers = [];
  for (let i = 0; i < k; i++) {
    centers.push(data[Math.floor(Math.random() * data.length)]);
  }
  
  for (let iter = 0; iter < 20; iter++) {
    const clusters: number[][] = Array(k).fill(null).map(() => []);
    
    for (const point of data) {
      let minDist = Infinity;
      let closestCluster = 0;
      
      for (let i = 0; i < k; i++) {
        const dist = Math.abs(point - centers[i]);
        if (dist < minDist) {
          minDist = dist;
          closestCluster = i;
        }
      }
      
      clusters[closestCluster].push(point);
    }
    
    let changed = false;
    for (let i = 0; i < k; i++) {
      if (clusters[i].length > 0) {
        const newCenter = clusters[i].reduce((a, b) => a + b, 0) / clusters[i].length;
        if (Math.abs(newCenter - centers[i]) > 0.001) {
          changed = true;
        }
        centers[i] = newCenter;
      }
    }
    
    if (!changed) break;
  }
  
  return centers.sort((a, b) => a - b);
}