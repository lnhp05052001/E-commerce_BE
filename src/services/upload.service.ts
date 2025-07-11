import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../utils';

// Define allowed file types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Create uploads directory if it doesn't exist
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Upload service handles file uploads, validation and storage
 */
class UploadService {
  /**
   * Upload multiple images
   * @param files Array of files to upload
   * @returns List of URLs for the uploaded images
   */
  async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new ApiError(400, 'No files provided');
    }

    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      // Validate file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        throw new ApiError(400, `File type ${file.mimetype} is not supported. Supported types: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
      }
      
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new ApiError(400, `File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      }
      
      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      
      // Save file to uploads directory
      const filePath = path.join(UPLOAD_DIR, fileName);
      fs.writeFileSync(filePath, file.buffer);
      
      // Add file URL to list
      uploadedUrls.push(`/api/uploads/${fileName}`);
    }
    
    return uploadedUrls;
  }

  /**
   * Upload a single file
   * @param file File to upload
   * @returns URL of the uploaded file
   */
  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new ApiError(400, 'No file provided');
    }
    
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      throw new ApiError(400, `File type ${file.mimetype} is not supported. Supported types: ${ALLOWED_FILE_TYPES.join(', ')}`);
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new ApiError(400, `File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }
    
    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    
    // Save file to uploads directory
    const filePath = path.join(UPLOAD_DIR, fileName);
    fs.writeFileSync(filePath, file.buffer);
    
    return `/api/uploads/${fileName}`;
  }

  /**
   * Get file by filename
   * @param filename Name of the file to retrieve
   * @returns File path and info
   */
  getFile(filename: string): { path: string, exists: boolean } {
    const filePath = path.join(UPLOAD_DIR, filename);
    const fileExists = fs.existsSync(filePath);
    
    return { 
      path: filePath, 
      exists: fileExists 
    };
  }

  /**
   * Delete file by filename
   * @param filename Name of the file to delete
   * @returns Boolean indicating if file was deleted successfully
   */
  deleteFile(filename: string): boolean {
    const filePath = path.join(UPLOAD_DIR, filename);
    const fileExists = fs.existsSync(filePath);
    
    if (!fileExists) {
      return false;
    }
    
    // Delete the file
    fs.unlinkSync(filePath);
    return true;
  }
}

export default new UploadService();
