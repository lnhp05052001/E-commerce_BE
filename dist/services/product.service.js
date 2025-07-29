"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const product_model_1 = __importDefault(require("../models/product.model"));
class ProductService {
    static buildMatchStage(queryParams) {
        const { minPrice, maxPrice, brandId, categoryId, search, isActive, gender, sizes } = queryParams;
        const andConditions = [];
        if (minPrice !== undefined || maxPrice !== undefined) {
            const priceConditions = this.buildPriceConditions(minPrice, maxPrice);
            andConditions.push({ $or: priceConditions });
        }
        if (brandId) {
            andConditions.push({ brand: new mongoose_1.default.Types.ObjectId(brandId) });
        }
        if (categoryId) {
            andConditions.push({ category: new mongoose_1.default.Types.ObjectId(categoryId) });
        }
        if (gender) {
            andConditions.push({ gender });
        }
        if (sizes) {
            andConditions.push({ sizes: { $in: [sizes] } });
        }
        if (isActive !== undefined) {
            andConditions.push({ isActive: isActive === 'true' });
        }
        if (search) {
            andConditions.push({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            });
        }
        return andConditions.length > 0 ? { $and: andConditions } : {};
    }
    static buildPriceConditions(minPrice, maxPrice) {
        const priceConditions = [];
        if (minPrice !== undefined && maxPrice !== undefined) {
            priceConditions.push({
                isSale: true,
                salePrice: { $gt: 0, $gte: Number(minPrice), $lte: Number(maxPrice) }
            });
            priceConditions.push({
                $or: [
                    { isSale: false },
                    { isSale: true, salePrice: { $eq: 0 } }
                ],
                price: { $gte: Number(minPrice), $lte: Number(maxPrice) }
            });
        }
        else if (minPrice !== undefined) {
            priceConditions.push({
                isSale: true,
                salePrice: { $gt: 0, $gte: Number(minPrice) }
            });
            priceConditions.push({
                $or: [
                    { isSale: false },
                    { isSale: true, salePrice: { $eq: 0 } }
                ],
                price: { $gte: Number(minPrice) }
            });
        }
        else if (maxPrice !== undefined) {
            priceConditions.push({
                isSale: true,
                salePrice: { $gt: 0, $lte: Number(maxPrice) }
            });
            priceConditions.push({
                $or: [
                    { isSale: false },
                    { isSale: true, salePrice: { $eq: 0 } }
                ],
                price: { $lte: Number(maxPrice) }
            });
        }
        return priceConditions;
    }
    static buildBasicPipeline() {
        return [
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                    pipeline: [{ $project: { name: 1, slug: 1 } }]
                }
            },
            {
                $lookup: {
                    from: "brands",
                    localField: "brand",
                    foreignField: "_id",
                    as: "brand",
                    pipeline: [{ $project: { name: 1, logo: 1, slug: 1 } }]
                }
            },
            {
                $addFields: {
                    category: { $arrayElemAt: ["$category", 0] },
                    brand: { $arrayElemAt: ["$brand", 0] },
                    actualPrice: {
                        $cond: {
                            if: { $and: ["$isSale", { $gt: ["$salePrice", 0] }] },
                            then: "$salePrice",
                            else: "$price"
                        }
                    }
                }
            }
        ];
    }
    static addSortStage(pipeline, sortBy, sortDirection) {
        if (sortBy === 'price') {
            pipeline.push({
                $sort: { actualPrice: sortDirection === 'asc' ? 1 : -1 }
            });
        }
        else if (sortBy === 'name') {
            pipeline.push({
                $sort: { name: sortDirection === 'asc' ? 1 : -1 }
            });
        }
        else {
            const sortField = sortBy;
            pipeline.push({
                $sort: { [sortField]: sortDirection === 'asc' ? 1 : -1 }
            });
        }
    }
    static executeAggregation(pipeline, sortBy) {
        return __awaiter(this, void 0, void 0, function* () {
            if (sortBy === 'name') {
                return yield product_model_1.default.aggregate(pipeline, {
                    collation: {
                        locale: 'vi',
                        strength: 2,
                        caseLevel: false,
                        numericOrdering: true
                    }
                });
            }
            else {
                return yield product_model_1.default.aggregate(pipeline);
            }
        });
    }
    static countDocuments(matchStage) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const pipeline = [];
            if (Object.keys(matchStage).length > 0) {
                pipeline.push({ $match: matchStage });
            }
            pipeline.push({ $count: "totalCount" });
            const countResult = yield product_model_1.default.aggregate(pipeline);
            return ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.totalCount) || 0;
        });
    }
    static getProductsWithPagination(queryParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const { sortBy = 'createdAt', sortDirection = 'desc' } = queryParams;
            const page = parseInt(queryParams.page) || 0;
            const size = parseInt(queryParams.size) || 10;
            const skip = page * size;
            const matchStage = this.buildMatchStage(queryParams);
            const totalItems = yield this.countDocuments(matchStage);
            const pipeline = [];
            if (Object.keys(matchStage).length > 0) {
                pipeline.push({ $match: matchStage });
            }
            pipeline.push(...this.buildBasicPipeline());
            this.addSortStage(pipeline, sortBy, sortDirection);
            pipeline.push({ $skip: skip });
            pipeline.push({ $limit: size });
            const products = yield this.executeAggregation(pipeline, sortBy);
            return {
                products,
                pagination: {
                    page: page + 1,
                    totalPages: Math.ceil(totalItems / size),
                    totalItems
                }
            };
        });
    }
    static getNewArrivals() {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = [
                { $match: { isActive: true } },
                { $sort: { createdAt: -1 } },
                { $limit: 10 },
                ...this.buildBasicPipeline()
            ];
            return yield product_model_1.default.aggregate(pipeline);
        });
    }
    static getTopSelling() {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = [
                { $match: { isActive: true } },
                { $sample: { size: 5 } },
                ...this.buildBasicPipeline()
            ];
            return yield product_model_1.default.aggregate(pipeline);
        });
    }
    static getTopDiscounted() {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = [
                {
                    $match: {
                        isActive: true,
                        isSale: true,
                        salePrice: { $gt: 0 },
                        price: { $gt: 0 }
                    }
                },
                {
                    $addFields: {
                        discountAmount: { $subtract: ["$price", "$salePrice"] },
                        discountPercentage: {
                            $multiply: [
                                { $divide: [{ $subtract: ["$price", "$salePrice"] }, "$price"] },
                                100
                            ]
                        }
                    }
                },
                { $sort: { discountPercentage: -1 } },
                { $limit: 10 },
                ...this.buildBasicPipeline()
            ];
            return yield product_model_1.default.aggregate(pipeline);
        });
    }
    static searchProducts(keyword) {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = [
                {
                    $match: {
                        isActive: true,
                        $or: [
                            { name: { $regex: keyword, $options: 'i' } },
                            { description: { $regex: keyword, $options: 'i' } }
                        ]
                    }
                },
                ...this.buildBasicPipeline()
            ];
            return yield product_model_1.default.aggregate(pipeline);
        });
    }
}
exports.ProductService = ProductService;
