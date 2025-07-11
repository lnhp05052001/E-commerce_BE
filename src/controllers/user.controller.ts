 
import { Request, Response } from 'express';
import {
  ChangePasswordRequest,
  ChangeRoleRequest,
  LoginRequest,
  LoginResponse,
  OtpRequest,
  RegisterRequest,
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
 * @route   POST /api/users/register
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
 * @route   POST /api/users/login
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
 * @route   GET /api/users/me
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
 * @route   PUT /api/users/avatar
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
 * @route   PUT /api/users/update
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
 * @route   POST /api/users/send-otp
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
 * @route   POST /api/users/verify-otp
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
 * @route   POST /api/users/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { oldPassword, newPassword }: ChangePasswordRequest = req.body;

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

  // Cập nhật mật khẩu mới
  user.password = newPassword;
  await user.save();

  return sendSuccessResponse(res, 'Đổi mật khẩu thành công');
});

/**
 * @desc    Lấy danh sách tất cả người dùng (chỉ admin)
 * @route   GET /api/users/all
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
 * @route   GET /api/users/:id
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
 * @route   DELETE /api/users/:id
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
 * @route   PUT /api/users/block/:id
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
 * @route   PUT /api/users/role/:id
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
