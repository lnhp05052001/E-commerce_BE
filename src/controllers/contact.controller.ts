import { Request, Response } from 'express';
import { ContactRequest } from '../dtos/contact.dto';
import Contact from '../models/contact.model';
import { asyncHandler, sendErrorResponse, sendSuccessResponse } from '../utils';

/**
 * @desc    Tạo liên hệ mới
 * @route   POST /api/contact
 * @access  Public
 */
export const createContact = asyncHandler(async (req: Request, res: Response) => {
  const contactData: ContactRequest = req.body;
  const contact = await Contact.create(contactData);
  return sendSuccessResponse(res, 'Liên hệ đã được gửi thành công', contact, 201);
});

/**
 * @desc    Cập nhật liên hệ
 * @route   PUT /api/contact/:id
 * @access  Private/Admin
 */
export const updateContact = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const contactData = req.body;

  const contact = await Contact.findByIdAndUpdate(
    id,
    { ...contactData },
    { new: true, runValidators: true }
  );

  if (!contact) {
    return sendErrorResponse(res, 'Không tìm thấy liên hệ', 404);
  }

  return sendSuccessResponse(res, 'Liên hệ đã được cập nhật thành công', contact);
});

/**
 * @desc    Xóa liên hệ
 * @route   DELETE /api/contact/:id
 * @access  Private/Admin
 */
export const deleteContact = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const contact = await Contact.findByIdAndDelete(id);
  
  if (!contact) {
    return sendErrorResponse(res, 'Không tìm thấy liên hệ', 404);
  }

  return sendSuccessResponse(res, 'Liên hệ đã được xóa thành công');
});

/**
 * @desc    Lấy liên hệ theo ID
 * @route   GET /api/contact/:id
 * @access  Private/Admin
 */
export const getContactById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const contact = await Contact.findById(id);
  
  if (!contact) {
    return sendErrorResponse(res, 'Không tìm thấy liên hệ', 404);
  }

  // Cập nhật trạng thái khi admin xem chi tiết
  if (contact.status === 'NEW') {
    contact.status = 'READ';
    await contact.save();
  }

  return sendSuccessResponse(res, 'Liên hệ đã được tìm thấy', contact);
});

/**
 * @desc    Lấy tất cả liên hệ (có phân trang và tìm kiếm)
 * @route   GET /api/contact
 * @access  Private/Admin
 */
export const getAllContacts = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 10;
  const search = (req.query.search as string) || '';

  // Tạo đối tượng query
  const query: any = {};
  
  // Thêm điều kiện tìm kiếm nếu có
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Đếm tổng số liên hệ thỏa mãn điều kiện
  const totalContacts = await Contact.countDocuments(query);
  
  // Lấy danh sách liên hệ với phân trang
  const contacts = await Contact.find(query)
    .sort({ createdAt: -1 })
    .skip(page * size)
    .limit(size);
  
  // Tạo đối tượng phân trang
  const pagination = {
    page: page + 1, 
    totalPages: Math.ceil(totalContacts / size),
    totalItems: totalContacts
  };

  return sendSuccessResponse(
    res, 
    'Lấy danh sách liên hệ thành công',
    contacts,
    200,
    pagination
  );
});

/**
 * @desc    Đánh dấu liên hệ đã trả lời
 * @route   PUT /api/contact/:id/respond
 * @access  Private/Admin
 */
export const markAsResponded = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const contact = await Contact.findByIdAndUpdate(
    id, 
    { status: 'RESPONDED' }, 
    { new: true }
  );
  
  if (!contact) {
    return sendErrorResponse(res, 'Không tìm thấy liên hệ', 404);
  }
  
  return sendSuccessResponse(res, 'Đã đánh dấu liên hệ là đã phản hồi', contact);
});
