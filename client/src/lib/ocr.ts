import Tesseract from 'tesseract.js';
import { useToast } from "@/hooks/use-toast";

type LanguageCode = 'eng' | 'hin' | 'tel';

// Map our app language codes to Tesseract language codes
const languageMap: Record<string, LanguageCode> = {
  en: 'eng', // English
  hi: 'hin', // Hindi
  te: 'tel'  // Telugu
};

/**
 * Recognizes text from an image using Tesseract OCR
 * @param imageFile The image file to extract text from
 * @param language The language code (defaults to English)
 * @returns Promise resolving to the recognized text
 */
export async function recognizeText(
  imageFile: File,
  language: string = 'en'
): Promise<string> {
  try {
    // Convert our app language code to Tesseract language code
    const tesseractLang = languageMap[language] || 'eng';

    // Create a scheduler and worker
    const worker = await Tesseract.createWorker(tesseractLang);

    // Recognize text in the image
    const result = await worker.recognize(imageFile);

    // Terminate the worker
    await worker.terminate();

    // Return the recognized text
    return result.data.text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Recognizes text from an image with progress updates
 * @param imageFile The image file to extract text from
 * @param language The language code
 * @param onProgress Optional callback for progress updates
 * @returns Promise resolving to the recognized text
 */
export async function recognizeTextWithProgress(
  imageFile: File,
  language: string = 'en',
  onProgress?: (progress: number, status: string) => void
): Promise<string> {
  try {
    const tesseractLang = languageMap[language] || 'eng';
    
    // Create a worker with progress logging
    const worker = await Tesseract.createWorker();
    
    // Initialize worker with language
    await worker.loadLanguage(tesseractLang);
    await worker.initialize(tesseractLang);
    
    // Log progress if a callback is provided
    if (onProgress) {
      worker.setProgressHandler((progress) => {
        onProgress(progress.progress, progress.status);
      });
    }
    
    // Perform OCR
    const result = await worker.recognize(imageFile);
    
    // Clean up
    await worker.terminate();
    
    return result.data.text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Crop an image before OCR processing
 * @param imageFile Original image file
 * @param cropArea Crop coordinates and dimensions
 * @returns Promise resolving to cropped image file
 */
export async function cropImageForOCR(
  imageFile: File,
  cropArea: { x: number; y: number; width: number; height: number }
): Promise<File> {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      img.onload = () => {
        // Set canvas dimensions to the crop area
        canvas.width = cropArea.width;
        canvas.height = cropArea.height;
        
        // Draw only the cropped portion to the canvas
        ctx.drawImage(
          img,
          cropArea.x, cropArea.y, cropArea.width, cropArea.height,
          0, 0, cropArea.width, cropArea.height
        );
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create image blob'));
            return;
          }
          
          // Create a new file from the blob
          const croppedFile = new File(
            [blob],
            `cropped-${imageFile.name}`,
            { type: imageFile.type }
          );
          
          resolve(croppedFile);
        }, imageFile.type);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      // Load the image from the file
      img.src = URL.createObjectURL(imageFile);
    } catch (error) {
      reject(error);
    }
  });
}
