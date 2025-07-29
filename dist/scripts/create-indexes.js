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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const product_model_1 = __importDefault(require("../models/product.model"));
const category_model_1 = __importDefault(require("../models/category.model"));
const brand_model_1 = __importDefault(require("../models/brand.model"));
dotenv_1.default.config();
const createIndexIfNotExists = (collection_1, indexSpec_1, ...args_1) => __awaiter(void 0, [collection_1, indexSpec_1, ...args_1], void 0, function* (collection, indexSpec, options = {}) {
    try {
        yield collection.createIndex(indexSpec, options);
        console.log(`✅ Created index: ${JSON.stringify(indexSpec)}`);
    }
    catch (error) {
        if (error.code === 86) {
            console.log(`ℹ️  Index already exists: ${JSON.stringify(indexSpec)}`);
        }
        else {
            console.error(`❌ Error creating index ${JSON.stringify(indexSpec)}:`, error.message);
        }
    }
});
const createIndexes = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('✅ Đã kết nối MongoDB');
        console.log('🚀 Bắt đầu tạo indexes cho Product collection...');
        yield createIndexIfNotExists(product_model_1.default.collection, { isActive: 1 });
        yield createIndexIfNotExists(product_model_1.default.collection, { createdAt: -1 });
        yield createIndexIfNotExists(product_model_1.default.collection, { price: 1 });
        yield createIndexIfNotExists(product_model_1.default.collection, { salePrice: 1 });
        yield createIndexIfNotExists(product_model_1.default.collection, { isSale: 1 });
        yield createIndexIfNotExists(product_model_1.default.collection, { category: 1 });
        yield createIndexIfNotExists(product_model_1.default.collection, { brand: 1 });
        yield createIndexIfNotExists(product_model_1.default.collection, { gender: 1 });
        yield createIndexIfNotExists(product_model_1.default.collection, { sizes: 1 });
        yield createIndexIfNotExists(product_model_1.default.collection, { colors: 1 });
        yield createIndexIfNotExists(product_model_1.default.collection, {
            isActive: 1,
            createdAt: -1
        });
        yield createIndexIfNotExists(product_model_1.default.collection, {
            isActive: 1,
            category: 1
        });
        yield createIndexIfNotExists(product_model_1.default.collection, {
            isActive: 1,
            brand: 1
        });
        yield createIndexIfNotExists(product_model_1.default.collection, {
            isActive: 1,
            gender: 1
        });
        yield createIndexIfNotExists(product_model_1.default.collection, {
            isActive: 1,
            isSale: 1,
            salePrice: 1
        });
        yield createIndexIfNotExists(product_model_1.default.collection, {
            name: 'text',
            description: 'text'
        });
        console.log('🚀 Bắt đầu tạo indexes cho Category collection...');
        yield createIndexIfNotExists(category_model_1.default.collection, { isActive: 1 });
        yield createIndexIfNotExists(category_model_1.default.collection, { name: 1 });
        console.log('🚀 Bắt đầu tạo indexes cho Brand collection...');
        yield createIndexIfNotExists(brand_model_1.default.collection, { isActive: 1 });
        yield createIndexIfNotExists(brand_model_1.default.collection, { name: 1 });
        console.log('🎉 Hoàn thành tạo indexes');
        const productIndexes = yield product_model_1.default.collection.indexes();
        console.log('📋 Product indexes:', productIndexes.map(idx => idx.name));
        const categoryIndexes = yield category_model_1.default.collection.indexes();
        console.log('📋 Category indexes:', categoryIndexes.map(idx => idx.name));
        const brandIndexes = yield brand_model_1.default.collection.indexes();
        console.log('📋 Brand indexes:', brandIndexes.map(idx => idx.name));
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Lỗi tạo indexes:', error);
        process.exit(1);
    }
});
createIndexes();
