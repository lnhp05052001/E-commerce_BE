import { NextFunction, Request, Response } from "express";
import { sendErrorResponse } from "../utils";

/**
 * Middleware to validate brand request data
 */
export const validateBrandRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, logo } = req.body;

  // Kiểm tra name (bắt buộc)
  if (!name || name.trim() === "") {
      sendErrorResponse(res, "Tên thương hiệu không được để trống", 400);
        return;
  }

  // Kiểm tra độ dài tên thương hiệu
  if (name.length < 2 || name.length > 100) {
      sendErrorResponse(
      res,
      "Tên thương hiệu phải có độ dài từ 2 đến 100 ký tự",
      400
    );
    return;
  }

  // Nếu có logo, kiểm tra định dạng URL hợp lệ
  if (logo && !isValidUrl(logo)) {
      sendErrorResponse(res, "Logo phải là một URL hợp lệ", 400);
      return;
  }

  next();
};

/**
 * Helper function to validate URL
 */
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};
