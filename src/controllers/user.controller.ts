 
import { Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import Handlebars from 'handlebars';
import path from 'path';
import {
  ChangePasswordRequest,
  ChangeRoleRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  OtpRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UserUpdateRequest
} from '../dtos/user.dto';
import Cart from '../models/cart.model';
import User from '../models/user.model';
import {
  asyncHandler,
  generateToken,
  sendEmail,
  sendErrorResponse,
  sendSuccessResponse
} from '../utils';

/**
 * Tạo mã OTP ngẫu nhiên
 */
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * @desc    Đăng ký người dùng mới
 * @route   POST /api/user/register
 * @access  Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password }: RegisterRequest = req.body;
  try {
    // Kiểm tra người dùng đã tồn tại
  const userExists = await User.findOne({ email });

  if (userExists) {
    return sendErrorResponse(res, 'Email đã được sử dụng', 400);
  }

  // Tạo người dùng mới
  const user = await User.create({
    username,
    email,
    password,
  });

  // tạo giỏ hàng cho người dùng
  const cart = await Cart.create({ user: user._id });

  if (user) {
    return sendSuccessResponse(res, 'Đăng ký thành công', {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user),
    }, 201);
  } else {
    return sendErrorResponse(res, 'Dữ liệu người dùng không hợp lệ', 400);
  }
  } catch (error) {
    console.error('Error during user registration:', error);
    return sendErrorResponse(res, 'Đăng ký không thành công', 500);
    
  }
  
});

/**
 * @desc    Đăng nhập người dùng
 * @route   POST /api/user/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: LoginRequest = req.body;

  // Tìm người dùng theo email
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return sendErrorResponse(res, 'Email hoặc mật khẩu không đúng', 401);
  }

  // Kiểm tra mật khẩu
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return sendErrorResponse(res, 'Email hoặc mật khẩu không đúng', 401);
  }

  // Kiểm tra tài khoản bị khóa
  if (user.isLocked) {
    return sendErrorResponse(res, 'Tài khoản của bạn đã bị khóa', 403);
  }

  // Không gửi mật khẩu về client
  const userWithoutPassword = user.toObject();
  const { password: _, ...userWithoutPass } = userWithoutPassword;

  const loginResponse: LoginResponse = {
    user: userWithoutPass,
    token: generateToken(user),
  };

  return sendSuccessResponse(res, 'Đăng nhập thành công', loginResponse);
});

/**
 * @desc    Lấy thông tin người dùng đã đăng nhập
 * @route   GET /api/user/me
 * @access  Private
 */
export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user._id).populate('addresses');

  if (!user) {
    return sendErrorResponse(res, 'Không tìm thấy người dùng', 404);
  }

  return sendSuccessResponse(res, 'Lấy thông tin người dùng thành công', user);
});

/**
 * @desc    Cập nhật avatar người dùng
 * @route   PUT /api/user/avatar
 * @access  Private
 */
export const updateAvatar = asyncHandler(async (req: Request, res: Response) => {
  const { avatar } = req.body;
  console.log('Avatar:', avatar);

  const user = await User.findById(req.user._id);

  if (!user) {
    return sendErrorResponse(res, 'Không tìm thấy người dùng', 404);
  }

  user.avatar = avatar;
  await user.save();

  return sendSuccessResponse(res, 'Cập nhật avatar thành công', user);
});

/**
 * @desc    Cập nhật thông tin người dùng
 * @route   PUT /api/user/update
 * @access  Private
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const updateData: UserUpdateRequest = req.body;
  
  const user = await User.findById(req.user._id);

  if (!user) {
    return sendErrorResponse(res, 'Không tìm thấy người dùng', 404);
  }

  // Cập nhật thông tin
  if (updateData.username) user.username = updateData.username;
  if (updateData.bio) user.bio = updateData.bio;
  if (updateData.phone) user.phone = updateData.phone;
  if (updateData.avatar) user.avatar = updateData.avatar;

  const updatedUser = await user.save();

  return sendSuccessResponse(res, 'Cập nhật thông tin thành công', updatedUser);
});

/**
 * @desc    Gửi mã OTP qua email
 * @route   POST /api/user/send-otp
 * @access  Public
 */
export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email }: OtpRequest = req.body;

  // Tìm người dùng theo email
  const user = await User.findOne({ email });

  if (!user) {
    return sendErrorResponse(res, 'Không tìm thấy người dùng với email này', 404);
  }

  // Tạo mã OTP
  const otp = generateOTP();
  user.otp = otp;
  await user.save();

  // Gửi email với mã OTP
  await sendEmail({
    to: email,
    subject: 'Mã xác thực OTP',
    text: `Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 5 phút.`,
  });

  return sendSuccessResponse(res, 'Gửi mã OTP thành công');
});

/**
 * @desc    Xác thực mã OTP
 * @route   POST /api/user/verify-otp
 * @access  Public
 */
export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp }: OtpRequest = req.body;

  // Tìm người dùng theo email
  const user = await User.findOne({ email });

  if (!user) {
    return sendErrorResponse(res, 'Không tìm thấy người dùng với email này', 404);
  }

  // Kiểm tra OTP
  if (user.otp !== otp) {
    return sendErrorResponse(res, 'Mã OTP không đúng', 400);
  }

  // Xóa OTP sau khi xác thực thành công
  user.otp = undefined;
  await user.save();

  return sendSuccessResponse(res, 'Xác thực OTP thành công');
});

/**
 * @desc    Đổi mật khẩu
 * @route   POST /api/user/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { oldPassword, newPassword }: ChangePasswordRequest = req.body;

  // Validate input
  if (!oldPassword || !newPassword) {
    return sendErrorResponse(res, 'Mật khẩu cũ và mật khẩu mới là bắt buộc', 400);
  }

  // Validate new password strength
  if (newPassword.length < 8) {
    return sendErrorResponse(res, 'Mật khẩu mới phải có ít nhất 8 ký tự', 400);
  }

  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumbers = /\d/.test(newPassword);

  if (!hasUppercase || !hasLowercase || !hasNumbers) {
    return sendErrorResponse(res, 'Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số', 400);
  }

  // Check if new password is same as old password
  if (oldPassword === newPassword) {
    return sendErrorResponse(res, 'Mật khẩu mới phải khác mật khẩu hiện tại', 400);
  }

  // Tìm người dùng và bao gồm trường password
  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    return sendErrorResponse(res, 'Không tìm thấy người dùng', 404);
  }

  // Kiểm tra mật khẩu cũ
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    return sendErrorResponse(res, 'Mật khẩu cũ không đúng', 401);
  }

  try {
    // Cập nhật mật khẩu mới (sẽ được hash trong pre-save hook)
    user.password = newPassword;
    await user.save();

    return sendSuccessResponse(res, 'Đổi mật khẩu thành công');
  } catch (error) {
    console.error('Error changing password:', error);
    return sendErrorResponse(res, 'Lỗi server khi đổi mật khẩu', 500);
  }
});

/**
 * @desc    Lấy danh sách tất cả người dùng (chỉ admin)
 * @route   GET /api/user/all
 * @access  Admin
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search?.toString() || '';

  const searchQuery = search
    ? {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    : {};

  const users = await User.find(searchQuery)
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const totalUsers = await User.countDocuments(searchQuery);

  return sendSuccessResponse(res, 'Lấy danh sách người dùng thành công', users, 200, {
    page,
    totalPages: Math.ceil(totalUsers / limit),
    totalItems: totalUsers,
  });
});

/**
 * @desc    Lấy người dùng theo ID
 * @route   GET /api/user/:id
 * @access  Admin
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return sendErrorResponse(res, 'Không tìm thấy người dùng', 404);
  }

  return sendSuccessResponse(res, 'Lấy thông tin người dùng thành công', user);
});

/**
 * @desc    Xóa người dùng theo ID (chỉ admin)
 * @route   DELETE /api/user/:id
 * @access  Admin
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return sendErrorResponse(res, 'Không tìm thấy người dùng', 404);
  }

  await user.deleteOne();

  return sendSuccessResponse(res, 'Xóa người dùng thành công');
});

/**
 * @desc    Khóa/mở khóa người dùng (chỉ admin)
 * @route   PUT /api/user/block/:id
 * @access  Admin
 */
export const blockUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return sendErrorResponse(res, 'Không tìm thấy người dùng', 404);
  }

  // Đảo ngược trạng thái khóa
  user.isLocked = !user.isLocked;
  await user.save();

  const status = user.isLocked ? 'khóa' : 'mở khóa';

  return sendSuccessResponse(res, `Đã ${status} người dùng thành công`, user);
});

/**
 * @desc    Thay đổi vai trò người dùng (chỉ admin)
 * @route   PUT /api/user/role/:id
 * @access  Admin
 */
export const changeRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role }: ChangeRoleRequest = req.body;

  if (!['USER', 'ADMIN'].includes(role)) {
    return sendErrorResponse(res, 'Vai trò không hợp lệ', 400);
  }

  const user = await User.findById(id);

  if (!user) {
    return sendErrorResponse(res, 'Không tìm thấy người dùng', 404);
  }

  user.role = role;
  await user.save();

  return sendSuccessResponse(res, 'Thay đổi vai trò người dùng thành công', user);
});

/**
 * @desc    Gửi email để reset mật khẩu
 * @route   POST /api/user/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email }: ForgotPasswordRequest = req.body;

  if (!email) {
    return sendErrorResponse(res, 'Email là bắt buộc', 400);
  }

  // Tìm user theo email
  const user = await User.findOne({ email });

  if (!user) {
    return sendErrorResponse(res, 'Không tìm thấy tài khoản với email này', 404);
  }

  // Tạo reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token và lưu vào database
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

  await user.save();

  // Tạo reset URL - trỏ đến frontend
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  // Đọc template và compile
  const templatePath = path.join(__dirname, '..', 'templates', 'reset-password.hbs');
  const templateContent = fs.readFileSync(templatePath, 'utf8');
  const compiledTemplate = Handlebars.compile(templateContent);
  
  // Render template với data
  const htmlContent = compiledTemplate({
    resetUrl: resetUrl,
  });

  // Nội dung email plain text
  const textContent = `
    Đặt lại mật khẩu - Fashion Factory
    
    Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
    
    Để đặt lại mật khẩu, vui lòng truy cập link sau:
    ${resetUrl}
    
    Link này sẽ hết hạn sau 10 phút.
    
    Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
    
    Trân trọng,
    Đội ngũ Fashion Factory
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Đặt lại mật khẩu - Fashion Factory',
      text: textContent,
      html: htmlContent,
    });

    return sendSuccessResponse(res, 'Email đặt lại mật khẩu đã được gửi');
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return sendErrorResponse(res, 'Có lỗi khi gửi email. Vui lòng thử lại sau', 500);
  }
});

/**
 * @desc    Reset mật khẩu
 * @route   POST /api/user/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password, confirmPassword }: ResetPasswordRequest = req.body;

  if (!token || !password || !confirmPassword) {
    return sendErrorResponse(res, 'Token, mật khẩu và xác nhận mật khẩu là bắt buộc', 400);
  }

  if (password !== confirmPassword) {
    return sendErrorResponse(res, 'Mật khẩu và xác nhận mật khẩu không khớp', 400);
  }

  if (password.length < 8) {
    return sendErrorResponse(res, 'Mật khẩu phải có ít nhất 8 ký tự', 400);
  }

  // Hash token để so sánh với database
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Tìm user với token hợp lệ và chưa hết hạn
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return sendErrorResponse(res, 'Token không hợp lệ hoặc đã hết hạn', 400);
  }

  // Cập nhật mật khẩu mới
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  return sendSuccessResponse(res, 'Mật khẩu đã được đặt lại thành công');
});
