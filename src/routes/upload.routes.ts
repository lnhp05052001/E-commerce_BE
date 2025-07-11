import express from 'express';
import multer from 'multer';
import { deleteFile, getFile, uploadFile, uploadImages } from '../controllers/upload.controller';

const router = express.Router();

// Configure multer for memory storage (we'll handle file saving in the service)
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @swagger
 * /api/uploads/image:
 *   post:
 *     summary: Upload multiple images
 *     tags: [Upload]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: images
 *         type: file
 *         required: true
 *         description: The images to upload (multiple files)
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *       400:
 *         description: No files were uploaded
 *       500:
 *         description: Server error
 */
// Accept files with multiple possible field names
const imageUpload = upload.fields([
  { name: 'image', maxCount: 10 },
  { name: 'images', maxCount: 10 },
  { name: 'files', maxCount: 10 },
  { name: 'file', maxCount: 10 }
]);
router.post('/image', imageUpload, uploadImages);

/**
 * @swagger
 * /api/uploads/upload-file:
 *   post:
 *     summary: Upload a single file with field name 'file'
 *     tags: [Upload]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *         description: The file to upload
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: No file was uploaded
 *       500:
 *         description: Server error
 */
// Simple single file upload with specific field
router.post('/upload-file', upload.single('file'), uploadFile);

/**
 * @swagger
 * /api/uploads/upload-image:
 *   post:
 *     summary: Upload a single image with field name 'image'
 *     tags: [Upload]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *         description: The image to upload
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: No file was uploaded
 *       500:
 *         description: Server error
 */
// Simple single file upload with specific field
router.post('/upload-image', upload.single('image'), uploadFile);

/**
 * @swagger
 * /api/uploads/{filename}:
 *   get:
 *     summary: Get file by filename
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: filename
 *         schema:
 *           type: string
 *         required: true
 *         description: Filename of the file to get
 *     responses:
 *       200:
 *         description: File returned successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found
 *       500:
 *         description: Server error
 */
router.get('/:filename', getFile);

/**
 * @swagger
 * /api/uploads/{filename}:
 *   delete:
 *     summary: Delete file by filename
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: filename
 *         schema:
 *           type: string
 *         required: true
 *         description: Filename of the file to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       404:
 *         description: File not found
 *       500:
 *         description: Server error
 */
router.delete('/:filename', deleteFile);

export default router;
