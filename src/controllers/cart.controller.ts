import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { CartAddItemRequest, CartUpdateRequest } from '../dtos/cart.dto';
import Cart, { CartItem } from '../models/cart.model';
import Product from '../models/product.model';
import { asyncHandler, sendErrorResponse, sendSuccessResponse } from '../utils';
import { populateCart } from '../utils/populate-helper';

/**
 * @desc    Thêm sản phẩm vào giỏ hàng
 * @route   POST /api/cart/add
 * @access  Private
 */
export const addToCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { productId, quantity, selectedSize, selectedColor }: CartAddItemRequest = req.body;

    if (!userId) {
        return sendErrorResponse(res,   'Bạn chưa đăng nhập', 401);
    }

    try {
        // Kiểm tra sản phẩm có tồn tại không
        const product = await Product.findById(productId);
        if (!product) {
            return sendErrorResponse(res,  'Không tìm thấy sản phẩm', 404);
        }

        // Validate size and color if provided
        if (selectedSize && product.sizes && product.sizes.length > 0 && !product.sizes.includes(selectedSize)) {
            return sendErrorResponse(res, `Size "${selectedSize}" không có sẵn cho sản phẩm này`, 400);
        }

        if (selectedColor && product.colors && product.colors.length > 0 && !product.colors.includes(selectedColor)) {
            return sendErrorResponse(res, `Màu "${selectedColor}" không có sẵn cho sản phẩm này`, 400);
        }

        // Tìm hoặc tạo giỏ hàng cho người dùng
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = await Cart.create({
                user: userId,
                items: [],
                totalPrice: 0
            });
        }

        // Kiểm tra xem sản phẩm với size và màu đã chọn đã có trong giỏ hàng chưa
        let cartItem = await CartItem.findOne({
            cart: cart._id,
            product: productId,
            selectedSize: selectedSize || { $exists: false },
            selectedColor: selectedColor || { $exists: false }
        });

        if (cartItem) {
            // Nếu đã có, cập nhật số lượng
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            // Nếu chưa có, tạo mới item
            cartItem = await CartItem.create({
                product: productId,
                quantity,
                price: product.price,
                selectedSize,
                selectedColor,
                cart: cart._id
            });

            // Thêm item vào giỏ hàng
            // Xác định kiểu dữ liệu rõ ràng để tránh lỗi typings
            const cartItems = cart.items as Types.ObjectId[];
            cartItems.push(cartItem._id as unknown as Types.ObjectId);
        }

        await cart.save();
        
        // Populate thông tin để trả về
        const populatedCart = await populateCart(await Cart.findById(cart._id));

        return sendSuccessResponse(res, 'Thêm vào giỏ hàng thành công', populatedCart);
    } catch (error: any) {
        return sendErrorResponse(res,   `Lỗi khi thêm vào giỏ hàng: ${error.message}` , 500);
    }
});

/**
 * @desc    Cập nhật số lượng sản phẩm trong giỏ hàng
 * @route   PUT /api/cart/:itemId
 * @access  Private
 */
export const updateCartItemQuantity = asyncHandler(async (req: Request, res: Response) => {
    const { itemId } = req.params;
    const { quantity }: CartUpdateRequest = req.body;
    const userId = req.user?._id;

    if (!userId) {
        return sendErrorResponse(res, 'Bạn chưa đăng nhập', 401);
    }

    try {
        // Kiểm tra item có tồn tại không
        const cartItem = await CartItem.findById(itemId);
        if (!cartItem) {
            return sendErrorResponse(res,   'Không tìm thấy sản phẩm trong giỏ hàng' , 404);
        }

        // Xác minh cart item thuộc về user hiện tại
        const cart = await Cart.findOne({
            user: userId,
            items: { $in: [itemId] }
        });

        if (!cart) {
            return sendErrorResponse(res,  'Bạn không có quyền truy cập vào item này' , 403);
        }

        // Cập nhật số lượng
        cartItem.quantity = quantity;
        await cartItem.save();
        await cart.save(); // Để kích hoạt middleware tính tổng giá

        // Populate thông tin để trả về sử dụng helper function
        const populatedCart = await populateCart(await Cart.findById(cart._id));

        return sendSuccessResponse(res, 'Cập nhật giỏ hàng thành công', populatedCart);
    } catch (error: any) {
        return sendErrorResponse(res,   `Lỗi khi cập nhật giỏ hàng: ${error.message}` , 500);
    }
});

/**
 * @desc    Xóa sản phẩm khỏi giỏ hàng
 * @route   DELETE /api/cart/:itemId
 * @access  Private
 */
export const removeCartItem = asyncHandler(async (req: Request, res: Response) => {
    const { itemId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
        return sendErrorResponse(res,  'Bạn chưa đăng nhập' ,401);
    }

    try {
        // Xác minh cart item thuộc về user hiện tại
        const cart = await Cart.findOne({
            user: userId,
            items: { $in: [itemId] }
        });

        if (!cart) {
            return sendErrorResponse(res,   'Không tìm thấy sản phẩm trong giỏ hàng', 404) ;
        }

        // Xóa item khỏi cart
        // Ép kiểu chính xác cho items để tránh lỗi typings
        const cartItems = cart.items as Types.ObjectId[];
        cart.items = cartItems.filter(item => 
            !item.equals(new Types.ObjectId(itemId))
        ) as unknown as typeof cart.items;
        
        // Xóa cart item
        await CartItem.findByIdAndDelete(itemId);
        await cart.save();

        // Populate thông tin để trả về sử dụng helper function
        const populatedCart = await populateCart(await Cart.findById(cart._id));

        return sendSuccessResponse(res, 'Xóa sản phẩm khỏi giỏ hàng thành công', populatedCart);
    } catch (error: any) {
        return sendErrorResponse(res,  `Lỗi khi xóa sản phẩm khỏi giỏ hàng: ${error.message}`, 500);
    }
});

/**
 * @desc    Xóa toàn bộ giỏ hàng
 * @route   DELETE /api/cart/clear
 * @access  Private
 */
export const clearCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;

    if (!userId) {
        return sendErrorResponse(res,   'Bạn chưa đăng nhập' , 401);
    }

    try {
        // Tìm giỏ hàng của người dùng
        const cart = await Cart.findOne({ user: userId });
        
        if (!cart) {
            return sendErrorResponse(res,   'Không tìm thấy giỏ hàng' , 404);
        }

        // Xóa tất cả các items của giỏ hàng
        await CartItem.deleteMany({ cart: cart._id });
        
        // Cập nhật giỏ hàng
        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();

        return sendSuccessResponse(res, 'Đã xóa toàn bộ giỏ hàng', cart);
    } catch (error: any) {
        return sendErrorResponse(res,   `Lỗi khi xóa giỏ hàng: ${error.message}` , 500); ;
    }
});

/**
 * @desc    Lấy thông tin giỏ hàng của người dùng
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;

    if (!userId) {
        return sendErrorResponse(res, 'Bạn chưa đăng nhập', 401);
    }

    try {
        // Tìm giỏ hàng của người dùng và populate thông tin
        const cartDoc = await Cart.findOne({ user: userId });
        const cart = await populateCart(cartDoc);
        
        if (!cart) {
            // Tạo giỏ hàng mới nếu chưa có
            const newCart = await Cart.create({
                user: userId,
                items: [],
                totalPrice: 0
            });
            
            // Populate giỏ hàng mới
            const populatedNewCart = await populateCart(newCart);
            
            return sendSuccessResponse(res, 'Giỏ hàng trống', populatedNewCart);
        }

        return sendSuccessResponse(res, 'Lấy thông tin giỏ hàng thành công', cart);
    } catch (error: any) {
        return sendErrorResponse(res, `Lỗi khi lấy thông tin giỏ hàng: ${error.message}`, 500);
    }
});
