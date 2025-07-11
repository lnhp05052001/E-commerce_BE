import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { OrderRequestDTO, UpdateOrderStatusRequest } from '../dtos/order.dto';
import Order, { IOrderItem, OrderItem, OrderStatus } from '../models/order.model';
import Product from '../models/product.model';
import emailService from '../services/email.service';
import { Relation, RelationList } from '../types/database';
import { asyncHandler, sendErrorResponse, sendSuccessResponse } from '../utils';
import { populateOrder } from '../utils/populate-helper';

/**
 * @desc    Tạo đơn hàng mới
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  try {
    const {
      username,
      paymentMethod,
      orderItems,
      discountAmount,
      finalAmount,
      totalAmount,
      address,
      discountCode
    }: OrderRequestDTO = req.body;

    const userId = req.user?._id;

    if (!userId) {
      return sendErrorResponse(res, 'Không tìm thấy thông tin người dùng', 401);
    }

    if (orderItems.length === 0) {
      return sendErrorResponse(res, 'Không có sản phẩm trong giỏ hàng', 400);
    }

    // Tạo đơn hàng trước với danh sách sản phẩm rỗng
    const order = await Order.create({
      user: userId,
      orderItems: [],
      paymentMethod,
      discountAmount,
      finalAmount,
      totalAmount,
      address,
      discountCode,
      status: OrderStatus.PENDING
    });

    // Tạo danh sách OrderItem và cập nhật trường `order`
    const orderItemIds: RelationList<IOrderItem> = [];
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return sendErrorResponse(res, `Sản phẩm ${item.name} không tồn tại`, 404);
      }

      // Validate selected size and color if provided
      if (item.selectedSize && product.sizes && product.sizes.length > 0 && !product.sizes.includes(item.selectedSize)) {
        return sendErrorResponse(res, `Size "${item.selectedSize}" không có sẵn cho sản phẩm ${item.name}`, 400);
      }

      if (item.selectedColor && product.colors && product.colors.length > 0 && !product.colors.includes(item.selectedColor)) {
        return sendErrorResponse(res, `Màu "${item.selectedColor}" không có sẵn cho sản phẩm ${item.name}`, 400);
      }

      const orderItem = await OrderItem.create({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        order: order._id // Gán ID của đơn hàng
      });

      orderItemIds.push(orderItem._id as Relation<IOrderItem>);
    }

    // Cập nhật danh sách sản phẩm trong đơn hàng
    order.orderItems = orderItemIds;
    await order.save();

    // Populate orderItems để trả về đầy đủ thông tin
    const orderDoc = await Order.findById(order._id);
    const populatedOrder = await populateOrder(orderDoc);

    return sendSuccessResponse(res, 'Đơn hàng được tạo thành công', populatedOrder, 201);
  } catch (error) {
    console.error('Error creating order:', error);
    return sendErrorResponse(res, 'Đã xảy ra lỗi khi tạo đơn hàng', 500);
  }
});

/**
 * @desc    Lấy đơn hàng theo ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const orderDoc = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems')
      .populate('address');  

    if (!orderDoc) {
      return sendErrorResponse(res, 'Không tìm thấy đơn hàng', 404);
    }

    // Populate với thông tin chi tiết sản phẩm
    const order = await populateOrder(orderDoc, true);

    if (!order) {
      return sendErrorResponse(res, 'Không tìm thấy đơn hàng', 404);
    }

    // Kiểm tra xem người dùng có quyền xem đơn hàng hay không
    const user = order.user as any;
    const orderUserId = typeof user === 'object' ? user._id : user;

 

    return sendSuccessResponse(res, 'Lấy thông tin đơn hàng thành công', order);
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    return sendErrorResponse(res, 'Đã xảy ra lỗi khi lấy thông tin đơn hàng', 500);
  }
});

/**
 * @desc    Lấy tất cả đơn hàng (admin)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 10;
  const status = req.query.status as OrderStatus;
  
  let query: any = {};
  
  if (status) {
    query.status = status;
  }

  const totalItems = await Order.countDocuments(query);
  const totalPages = Math.ceil(totalItems / size);
  
  const orders = await Order.find(query)
    .populate('user')
     .skip(page * size)
    .limit(size)
    .sort({ createdAt: -1 });

  return sendSuccessResponse(
    res, 
    'Lấy danh sách đơn hàng thành công', 
    orders,
    200,
    {
      page: page + 1,
      totalPages,
      totalItems
    }
  );
});

/**
 * @desc    Lấy đơn hàng của người dùng đang đăng nhập
 * @route   GET /api/orders/user
 * @access  Private
 */
export const getUserOrders = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  if (!userId) {
    return sendErrorResponse(res, 'Không tìm thấy thông tin người dùng', 401);
  }

  const orders = await Order.find({ user: userId })
    .populate('orderItems')
    .sort({ createdAt: -1 });

  return sendSuccessResponse(res, 'Lấy danh sách đơn hàng thành công', orders);
});

/**
 * @desc    Cập nhật trạng thái đơn hàng
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { status }: UpdateOrderStatusRequest = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return sendErrorResponse(res, 'Không tìm thấy đơn hàng', 404);
    }

    // Kiểm tra trạng thái hợp lệ
    if (!Object.values(OrderStatus).includes(status)) {
      return sendErrorResponse(res, 'Trạng thái đơn hàng không hợp lệ', 400);
    }

    order.status = status;

    const updatedOrder = await order.save();
    return sendSuccessResponse(res, 'Cập nhật trạng thái đơn hàng thành công', updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    return sendErrorResponse(res, 'Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng', 500);
  }
});

/**
 * @desc    Xóa đơn hàng
 * @route   DELETE /api/orders/:id
 * @access  Private/Admin
 */
export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return sendErrorResponse(res, 'Không tìm thấy đơn hàng', 404);
  }

  // Xóa các OrderItem liên quan
  await OrderItem.deleteMany({ order: order._id });
  
  // Xóa đơn hàng
  await order.deleteOne();
  
  return sendSuccessResponse(res, 'Đơn hàng đã được xóa thành công', null);
});

/**
 * @desc    Tìm kiếm đơn hàng theo Order ID
 * @route   GET /api/orders/search
 * @access  Private/Admin
 */
export const searchOrdersByOrderId = asyncHandler(async (req: Request, res: Response) => {
  const orderId = req.query.orderId as string;
  
  if (!orderId) {
    return sendErrorResponse(res, 'Vui lòng cung cấp mã đơn hàng để tìm kiếm', 400);
  }

  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 10;

  const query = { orderId: { $regex: orderId, $options: 'i' } };
  
  const totalItems = await Order.countDocuments(query);
  const totalPages = Math.ceil(totalItems / size);
  
  const orders = await Order.find(query)
    .populate('user', 'name email')
    .skip(page * size)
    .limit(size)
    .sort({ createdAt: -1 });

  return sendSuccessResponse(
    res, 
    'Tìm kiếm đơn hàng thành công', 
    orders,
    200,
    {
      page: page + 1,
      totalPages,
      totalItems
    }
  );
});

/**
 * @desc    Tạo file PDF cho đơn hàng
 * @route   GET /api/orders/:id/download-pdf
 * @access  Private
 */
export const generateOrderPdf = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems')
    .populate('address');  

  if (!order) {
    return sendErrorResponse(res, 'Không tìm thấy đơn hàng', 404);
  }

  // Kiểm tra quyền truy cập đơn hàng
  const orderUser = order.user as any;
  const orderUserId = typeof orderUser === 'object' ? orderUser._id : orderUser;

  if (req.user?.role !== 'admin' && orderUserId.toString() !== req.user?._id.toString()) {
    return sendErrorResponse(res, 'Không có quyền truy cập đơn hàng này', 403);
  }

  // Tạo PDF
  const doc = new PDFDocument({ margin: 50 });

  // Thiết lập tên file
  const fileName = `order_${order.orderId}.pdf`;
  const filePath = path.join(__dirname, '..', '..', 'temp', fileName);

  // Đảm bảo thư mục temp tồn tại
  if (!fs.existsSync(path.join(__dirname, '..', '..', 'temp'))) {
    fs.mkdirSync(path.join(__dirname, '..', '..', 'temp'), { recursive: true });
  }

  // Stream PDF vào file và phản hồi
  const fileStream = fs.createWriteStream(filePath);
  doc.pipe(fileStream);

  // Thiết kế PDF
  doc.fontSize(25).text(`Đơn hàng #${order.orderId}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Ngày đặt hàng: ${order.orderDate}`);
  doc.fontSize(12).text(`Trạng thái: ${order.status}`);
  doc.moveDown();

  // Thông tin khách hàng
  doc.fontSize(14).text('Thông tin khách hàng:');
  const orderUserInfo = order.user as any;
  doc.fontSize(12).text(`Tên: ${orderUserInfo.name}`);
  doc.fontSize(12).text(`Email: ${orderUserInfo.email}`);
  doc.moveDown();

  // Địa chỉ giao hàng
  doc.fontSize(14).text('Địa chỉ giao hàng:');
  const shippingAddress = order.address as any;
  doc.fontSize(12).text(`Tên: ${shippingAddress.fullName}`);
  doc.fontSize(12).text(`Địa chỉ: ${shippingAddress.address}`);
  doc.fontSize(12).text(`Thành phố: ${shippingAddress.city}`);
  doc.fontSize(12).text(`Mã bưu điện: ${shippingAddress.postalCode || 'N/A'}`);
  doc.fontSize(12).text(`Số điện thoại: ${shippingAddress.phone}`);
  doc.moveDown();

  // Danh sách sản phẩm
  doc.fontSize(14).text('Sản phẩm:');

  // Header cho bảng
  let yPos = doc.y + 10;
  doc.fontSize(12).text('Sản phẩm', 50, yPos);
  doc.text('SL', 300, yPos);
  doc.text('Giá', 350, yPos);
  doc.text('Tổng', 400, yPos);
  yPos += 20;

  // Vẽ đường kẻ ngang
  doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
  yPos += 10;

  // Danh sách sản phẩm
  const orderItems = order.orderItems as IOrderItem[];
  orderItems.forEach((item: IOrderItem) => {
    doc.fontSize(10).text(item.name, 50, yPos, { width: 240 });
    doc.text(item.quantity.toString(), 300, yPos);
    doc.text(`${item.price.toLocaleString('vi-VN')}đ`, 350, yPos);
    doc.text(`${(item.price * item.quantity).toLocaleString('vi-VN')}đ`, 400, yPos);
    yPos += 20;
  });

  // Vẽ đường kẻ ngang
  doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
  yPos += 10;

  // Tổng tiền
  doc.fontSize(12).text('Tổng tiền hàng:', 300, yPos);
  doc.text(`${order.totalAmount.toLocaleString('vi-VN')}đ`, 400, yPos);
  yPos += 20;

  doc.text('Giảm giá:', 300, yPos);
  doc.text(`${order.discountAmount.toLocaleString('vi-VN')}đ`, 400, yPos);
  yPos += 20;

  doc.fontSize(14).text('Tổng thanh toán:', 300, yPos);
  doc.text(`${order.finalAmount.toLocaleString('vi-VN')}đ`, 400, yPos);

  // Thông tin thanh toán
  doc.moveDown(2);
  doc.fontSize(12).text(`Phương thức thanh toán: ${order.paymentMethod}`);

  // Kết thúc PDF
  doc.end();

  // Đợi PDF được tạo xong
  fileStream.on('finish', () => {
    // Đọc file và trả về
    const fileBuffer = fs.readFileSync(filePath);

    // Xóa file tạm sau khi đã gửi
    fs.unlinkSync(filePath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=order_${order.orderId}.pdf`);
    return res.send(fileBuffer);
  });
});

/**
 * @desc    Gửi email thông tin đơn hàng
 * @route   POST /api/orders/:id/send-email
 * @access  Private
 */
export const sendOrderEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  
  if (!email) {
    return sendErrorResponse(res, 'Vui lòng cung cấp địa chỉ email', 400);
  }
  
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems');

  if (!order) {
    return sendErrorResponse(res, 'Không tìm thấy đơn hàng', 404);
  }

  try {
    // Gửi email với template
    await emailService.sendOrderEmail(
      email,
      `Chi tiết đơn hàng #${order.orderId}`,
      'order-email',
      { order }
    );

    return sendSuccessResponse(res, 'Email đã được gửi thành công', null);
  } catch (error) {
    console.error('Email sending error:', error);
    return sendErrorResponse(res, 'Không thể gửi email', 500);
  }
});
