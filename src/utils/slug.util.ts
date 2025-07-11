import slugify from 'slugify';

// Default slugify options
const slugifyOptions = {
  lower: true,          // convert to lower case
  strict: true,         // strip special characters except replacement
  locale: 'vi',         // language code of the locale to use
  remove: /[*+~.()'"!:@]/g, // regex to remove characters
  replacement: '-',     // replacement for spaces
  trim: true            // trim leading and trailing replacement chars
};

/**
 * Generate a slug from a string input
 * @param input The string to convert to a slug
 * @returns A URL-friendly slug
 */
export const generateSlug = (input: string): string => {
  return slugify(input, slugifyOptions);
};

/**
 * Generate a product slug from a product name
 * @param productName The name of the product
 * @returns A URL-friendly slug for the product
 */
export const generateProductSlug = (productName: string): string => {
  return generateSlug(productName);
};

/**
 * Generate a category slug from a category name
 * @param categoryName The name of the category
 * @returns A URL-friendly slug for the category
 */
export const generateCategorySlug = (categoryName: string): string => {
  return generateSlug(categoryName);
};

/**
 * Generate a blog slug from a blog title
 * @param blogTitle The title of the blog
 * @returns A URL-friendly slug for the blog
 */
export const generateBlogSlug = (blogTitle: string): string => {
  return generateSlug(blogTitle);
};

/**
 * Generate a tag slug from a tag name
 * @param tagName The name of the tag
 * @returns A URL-friendly slug for the tag
 */
export const generateTagSlug = (tagName: string): string => {
  return generateSlug(tagName);
};

/**
 * Generate a brand slug from a brand name
 * @param brandName The name of the brand
 * @returns A URL-friendly slug for the brand
 */
export const generateBrandSlug = (brandName: string): string => {
  return generateSlug(brandName);
};
