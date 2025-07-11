import { Request, Response } from "express";
import path from "path";
import uploadService from "../services/upload.service";
import { asyncHandler, sendErrorResponse, sendSuccessResponse } from "../utils";

/**
 * @desc    Upload multiple images
 * @route   POST /api/uploads/image
 * @access  Public
 */
export const uploadImages = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      // Handle the files from multer.fields (structured as object with field names as keys)
      // or from multer.any() (structured as array)
      if (!req.files) {
        return sendErrorResponse(res, "No files were uploaded", 400);
      }

      let allFiles: Express.Multer.File[] = [];

      // Check if files is an array (from multer.any())
      if (Array.isArray(req.files)) {
        allFiles = req.files;
      }
      // Otherwise it's an object from multer.fields()
      else {
        const filesObject = req.files as {
          [fieldname: string]: Express.Multer.File[];
        };
        // Extract files from all field names
        Object.keys(filesObject).forEach((key) => {
          allFiles = [...allFiles, ...filesObject[key]];
        });
      }

      if (allFiles.length === 0) {
        return sendErrorResponse(res, "No files were uploaded", 400);
      }

      const urls = await uploadService.uploadImages(allFiles);
      return sendSuccessResponse(res, "Images uploaded successfully", urls);
    } catch (error: any) {
      console.log(error)
      return sendErrorResponse(
        res,
        error.message || "Error uploading images",
        error.statusCode || 500
      );
    }
  }
);

/**
 * @desc    Upload a single file
 * @route   POST /api/uploads/file
 * @access  Public
 */
export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log("Request files:", req.files);
    console.log("Request file:", req.file);
    console.log("Request body:", req.body);

    let fileToUpload: Express.Multer.File | undefined = undefined;

    // Handle the case where we directly have a file from multer.single
    if (req.file) {
      fileToUpload = req.file;
    }
    // Handle the case where we have an array of files from multer.any()
    else if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      fileToUpload = req.files[0];
    }
    // Handle the case where we have an object of files from multer.fields
    else if (
      req.files &&
      typeof req.files === "object" &&
      !Array.isArray(req.files)
    ) {
      const filesObject = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };

      for (const fieldname in filesObject) {
        if (filesObject[fieldname] && filesObject[fieldname].length > 0) {
          fileToUpload = filesObject[fieldname][0];
          break;
        }
      }
    }

    if (!fileToUpload) {
      console.error("No file was found in the request");
      return sendErrorResponse(res, "No file was uploaded", 400);
    }

    try {
      console.log("Uploading file:", fileToUpload.originalname);
      const url = await uploadService.uploadFile(fileToUpload);
      console.log("File uploaded successfully:", url);
      return sendSuccessResponse(res, "File uploaded successfully", url);
    } catch (uploadError: any) {
      console.error("Upload service error:", uploadError);
      return sendErrorResponse(
        res,
        uploadError.message || "Error processing the uploaded file",
        uploadError.statusCode || 500
      );
    }
  } catch (error: any) {
    console.error("Error in upload controller:", error);
    return sendErrorResponse(
      res,
      error.message || "Error uploading file",
      error.statusCode || 500
    );
  }
});

/**
 * @desc    Get file by filename
 * @route   GET /api/uploads/:filename
 * @access  Public
 */
export const getFile = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const { path: filePath, exists } = uploadService.getFile(filename);

    if (!exists) {
      return sendErrorResponse(res, "File not found", 404);
    }

    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = "application/octet-stream";

    switch (ext) {
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
      case ".webp":
        contentType = "image/webp";
        break;
      case ".pdf":
        contentType = "application/pdf";
        break;
      case ".doc":
        contentType = "application/msword";
        break;
      case ".docx":
        contentType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        break;
      case ".txt":
        contentType = "text/plain";
        break;
      case ".xls":
        contentType = "application/vnd.ms-excel";
        break;
      case ".xlsx":
        contentType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        break;
    }
    // Set appropriate headers for CORS and file serving
    res.setHeader("Content-Type", contentType);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    
    return res.sendFile(filePath);
  } catch (error: any) {
    return sendErrorResponse(
      res,
      error.statusCode || 500,
      error.message || "Error retrieving file"
    );
  }
});

/**
 * @desc    Delete file by filename
 * @route   DELETE /api/uploads/:filename
 * @access  Public
 */
export const deleteFile = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;

    const deleted = uploadService.deleteFile(filename);

    if (!deleted) {
      return sendErrorResponse(
        res,
        "File not found or could not be deleted",
        404
      );
    }

    return sendSuccessResponse(res, "File deleted successfully", { filename });
  } catch (error: any) {
    return sendErrorResponse(
      res,
      error.message || "Error deleting file",
      error.statusCode || 500
    );
  }
});
