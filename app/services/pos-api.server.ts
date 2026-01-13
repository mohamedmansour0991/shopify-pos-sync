import CryptoJS from "crypto-js";

export interface PosConfig {
  baseUrl: string;
  username: string;
  password: string;
  encryptionKey: string;
  iv: string;
}

export interface PosCategory {
  CategoryID: number;
  CategoryCode: string;
  CategoryName: string;
  CategoryNameAr?: string;
  CategoryNameEn?: string;
  ParentID?: number;
  IsActive: boolean;
  ImageURL?: string;
}

export interface PosProduct {
  ProductID: number;
  ProductCode: string;
  ProductName: string;
  ProductNameAr?: string;
  ProductNameEn?: string;
  Description?: string;
  DescriptionAr?: string;
  DescriptionEn?: string;
  Price: number;
  CostPrice?: number;
  CategoryID: number;
  CategoryName?: string;
  Barcode?: string;
  SKU?: string;
  ImageURL?: string;
  Images?: string[];
  IsActive: boolean;
  StockQuantity?: number;
  Unit?: string;
  Weight?: number;
}

export interface PosApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Decrypts AES-256-CBC encrypted data from the POS API
 */
function decryptResponse(encryptedData: string, key: string, iv: string): string {
  try {
    const keyWordArray = CryptoJS.enc.Utf8.parse(key);
    const ivWordArray = CryptoJS.enc.Utf8.parse(iv);

    const decrypted = CryptoJS.AES.decrypt(encryptedData, keyWordArray, {
      iv: ivWordArray,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt API response");
  }
}

/**
 * Makes an authenticated request to the POS API
 */
async function makeRequest<T>(
  config: PosConfig,
  endpoint: string,
  params?: Record<string, string | number>
): Promise<PosApiResponse<T>> {
  try {
    const url = new URL(endpoint, config.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const authHeader = Buffer.from(
      `${config.username}:${config.password}`
    ).toString("base64");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const responseText = await response.text();
    
    // Try to parse as JSON first (in case it's not encrypted)
    try {
      const jsonData = JSON.parse(responseText);
      // Check if the response is encrypted (usually a base64 string)
      if (typeof jsonData === "string") {
        const decrypted = decryptResponse(
          jsonData,
          config.encryptionKey,
          config.iv
        );
        return { success: true, data: JSON.parse(decrypted) };
      }
      // If it's already JSON, check for encrypted field
      if (jsonData.data && typeof jsonData.data === "string") {
        const decrypted = decryptResponse(
          jsonData.data,
          config.encryptionKey,
          config.iv
        );
        return { success: true, data: JSON.parse(decrypted) };
      }
      // Response is already decrypted JSON
      return { success: true, data: jsonData as T };
    } catch {
      // Assume the entire response is encrypted
      const decrypted = decryptResponse(
        responseText,
        config.encryptionKey,
        config.iv
      );
      return { success: true, data: JSON.parse(decrypted) };
    }
  } catch (error) {
    console.error("POS API request error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all categories using Category/GetSubCategory
 * Note: This endpoint seems to return all categories regardless of parentId
 */
export async function getAllCategories(
  config: PosConfig
): Promise<PosApiResponse<PosCategory[]>> {
  console.log("[POS API] Fetching all categories using Category/GetSubCategory...");
  
  // Try with different parentId values (or no parentId)
  const paramsToTry: Record<string, string | number>[] = [
    {}, // No params
    { parentId: 0 },
    { parentId: 1 },
  ];
  
  for (const params of paramsToTry) {
    const result = await makeRequest<any>(config, "Category/GetSubCategory", params);
    
    if (result.success && result.data) {
      console.log(`[POS API] ✅ Categories found using Category/GetSubCategory with params:`, params);
      
      // Log the actual response structure for debugging
      if (Array.isArray(result.data) && result.data.length > 0) {
        console.log("[POS API] Categories response structure:", JSON.stringify(result.data[0], null, 2));
        console.log(`[POS API] Found ${result.data.length} total categories`);
      }
      
      // Normalize the data
      const categories = Array.isArray(result.data) ? result.data : [result.data];
      const normalized = categories.map(normalizeCategory);
      
      // Remove duplicates based on CategoryID
      const uniqueCategories = normalized.filter((cat, index, self) =>
        index === self.findIndex((c) => c.CategoryID === cat.CategoryID)
      );
      
      console.log(`[POS API] Total unique categories: ${uniqueCategories.length}`);
      return { success: true, data: uniqueCategories };
    }
  }
  
  return { success: false, error: "Failed to fetch categories using Category/GetSubCategory" };
}

/**
 * Get all main categories from the POS system (kept for backward compatibility)
 * Now uses Category/GetSubCategory internally
 */
export async function getMainCategories(
  config: PosConfig
): Promise<PosApiResponse<PosCategory[]>> {
  const result = await getAllCategories(config);
  
  if (result.success && result.data) {
    // Filter to only main categories (ParentID = 0 or undefined)
    const mainCategories = result.data.filter(cat => !cat.ParentID || cat.ParentID === 0);
    console.log(`[POS API] Found ${mainCategories.length} main categories (out of ${result.data.length} total)`);
    return { success: true, data: mainCategories };
  }
  
  return result;
}

/**
 * Normalize category data from different possible API formats
 * Actual API format:
 * {
 *   "CategoryId": 21,
 *   "CategoryCode": "1",
 *   "CategoryArName": "خلطات",
 *   "CategoryEnName": "Alcohol & oil mixing",
 *   "CategoryImage": "http://...",
 *   "StopedCategory": false,
 *   "ParentCategoryId": 0
 * }
 */
function normalizeCategory(cat: any): PosCategory {
  return {
    CategoryID: cat.CategoryId || cat.CategoryID || cat.categoryId || cat.Id || cat.id || 0,
    CategoryCode: cat.CategoryCode || cat.categoryCode || cat.Code || cat.code || "",
    CategoryName: cat.CategoryEnName || cat.CategoryName || cat.categoryName || cat.Name || cat.name || "Unknown",
    CategoryNameAr: cat.CategoryArName || cat.CategoryNameAr || cat.categoryNameAr || cat.ArabicName || cat.arabicName,
    CategoryNameEn: cat.CategoryEnName || cat.CategoryNameEn || cat.categoryNameEn || cat.EnglishName || cat.englishName,
    ParentID: cat.ParentCategoryId || cat.ParentID || cat.parentId || cat.ParentId || cat.parentID,
    IsActive: !(cat.StopedCategory || cat.InvisibleCategory) && (cat.IsActive ?? cat.isActive ?? cat.Active ?? cat.active ?? true),
    ImageURL: cat.CategoryImage || cat.ImageURL || cat.imageUrl || cat.ImageUrl || cat.Image || cat.image,
  };
}

// Note: getCategoriesByParentId removed - we now use Category/GetSubCategory to get all categories at once

/**
 * Normalize product data from different possible API formats
 * Based on the Category API pattern, likely fields:
 * - ProductId, ProductCode, ProductArName, ProductEnName, ProductImage
 * - ItemId, ItemCode, ItemArName, ItemEnName, ItemImage
 * - Price, CostPrice, SalePrice, UnitPrice
 * - CategoryId, Barcode, StopedProduct
 */
function normalizeProduct(prod: any): PosProduct {
  // Handle both Product* and Item* field naming conventions
  const id = prod.ProductId || prod.ItemId || prod.ProductID || prod.ItemID || prod.productId || prod.itemId || prod.Id || prod.id || 0;
  const code = prod.ProductCode || prod.ItemCode || prod.productCode || prod.itemCode || prod.Code || prod.code || "";
  const nameEn = prod.ProductEnName || prod.ItemEnName || prod.ProductNameEn || prod.ItemNameEn || prod.EnglishName || prod.Name || prod.name || "Unknown";
  const nameAr = prod.ProductArName || prod.ItemArName || prod.ProductNameAr || prod.ItemNameAr || prod.ArabicName;
  const image = prod.ProductImage || prod.ItemImage || prod.ImageURL || prod.imageUrl || prod.Image || prod.image;
  const isStopped = prod.StopedProduct || prod.StopedItem || prod.InvisibleProduct || prod.InvisibleItem || false;
  
  return {
    ProductID: id,
    ProductCode: code,
    ProductName: nameEn,
    ProductNameAr: nameAr,
    ProductNameEn: nameEn,
    Description: prod.Description || prod.Notes || prod.description || "",
    DescriptionAr: prod.DescriptionAr || prod.descriptionAr || prod.ArabicDescription || prod.arabicDescription,
    DescriptionEn: prod.DescriptionEn || prod.descriptionEn || prod.EnglishDescription || prod.englishDescription,
    Price: prod.Price || prod.SalePrice || prod.UnitPrice || prod.price || prod.salePrice || prod.unitPrice || 0,
    CostPrice: prod.CostPrice || prod.Cost || prod.costPrice || prod.cost,
    CategoryID: prod.CategoryId || prod.CategoryID || prod.categoryId || prod.categoryID || 0,
    CategoryName: prod.CategoryEnName || prod.CategoryName || prod.categoryName,
    Barcode: prod.Barcode || prod.BarCode || prod.barcode || prod.barCode,
    SKU: prod.SKU || prod.Sku || prod.sku || code,
    ImageURL: image,
    Images: prod.Images || prod.images || (image ? [image] : []),
    IsActive: !isStopped && (prod.IsActive ?? prod.isActive ?? prod.Active ?? prod.active ?? true),
    StockQuantity: prod.StockQuantity || prod.Quantity || prod.Stock || prod.stockQuantity || prod.quantity || prod.stock,
    Unit: prod.Unit || prod.UnitName || prod.unit || prod.unitName,
    Weight: prod.Weight || prod.weight,
  };
}

/**
 * Get products with pagination - tries multiple endpoint variations
 */
export async function getProducts(
  config: PosConfig,
  page = 1,
  pageSize = 100
): Promise<PosApiResponse<PosProduct[]>> {
  // Try different endpoint variations based on the Category API pattern
  // Category uses: Category/GetMainCategory, Category/GetSubCategory
  const endpoints: Array<{ name: string; params?: Record<string, string | number> }> = [
    // Based on Category/GetMainCategory pattern
    { name: "Product/GetMainProduct" },
    { name: "Product/GetMainProducts" },
    // Based on Category/GetSubCategory pattern (this might return all products)
    { name: "Product/GetSubProduct" },
    { name: "Product/GetSubProducts" },
    // Other variations
    { name: "Product/GetAllProduct" },
    { name: "Product/GetAllProducts" },
    { name: "Product/GetProduct" },
    { name: "Product/GetProducts" },
    { name: "Product/Get", params: { page, pageSize } },
    { name: "Product/GetAll", params: { page, pageSize } },
    // Item variants
    { name: "Item/GetMainItem" },
    { name: "Item/GetMainItems" },
    { name: "Item/GetSubItem" },
    { name: "Item/GetSubItems" },
    { name: "Item/GetAllItem" },
    { name: "Item/GetAllItems" },
    { name: "Item/GetItem" },
    { name: "Item/GetItems" },
    { name: "Item/Get", params: { page, pageSize } },
    { name: "Item/GetAll", params: { page, pageSize } },
    // Products (plural) variants
    { name: "Products/GetMainProduct" },
    { name: "Products/GetSubProduct" },
    { name: "Products/GetAll", params: { page, pageSize } },
    { name: "Products/Get", params: { page, pageSize } },
    // Items (plural) variants
    { name: "Items/GetMainItem" },
    { name: "Items/GetSubItem" },
    { name: "Items/GetAll", params: { page, pageSize } },
    { name: "Items/Get", params: { page, pageSize } },
    // Stock variants
    { name: "Stock/GetAllProduct" },
    { name: "Stock/GetAllItem" },
    { name: "Stock/Get", params: { page, pageSize } },
    // Inventory variants
    { name: "Inventory/GetAllProduct" },
    { name: "Inventory/GetAllItem" },
  ];
  
  const triedEndpoints: string[] = [];
  
  for (const endpoint of endpoints) {
    triedEndpoints.push(endpoint.name);
    const result = await makeRequest<any>(config, endpoint.name, endpoint.params);
    
    if (result.success && result.data) {
      console.log(`[POS API] Products found using endpoint: ${endpoint.name}`);
      console.log("[POS API] Products response structure:", JSON.stringify(result.data[0] || result.data, null, 2));
      
      // Normalize the data
      const products = Array.isArray(result.data) ? result.data : [result.data];
      result.data = products.map(normalizeProduct);
      return result as PosApiResponse<PosProduct[]>;
    }
  }
  
  // If all endpoints failed, return the last error
  return {
    success: false,
    error: "Failed to fetch products: No valid endpoint found. Tried: " + triedEndpoints.join(", "),
  };
}

/**
 * Get products by category
 */
export async function getProductsByCategory(
  config: PosConfig,
  categoryId: number,
  page = 1,
  pageSize = 100
): Promise<PosApiResponse<PosProduct[]>> {
  // Try different endpoint variations
  const endpoints: Array<{ name: string; params: Record<string, string | number> }> = [
    { name: "Product/GetByCategory", params: { categoryId, page, pageSize } },
    { name: "Product/GetByCategoryId", params: { categoryId, page, pageSize } },
    { name: "Product/GetProductByCategoryId", params: { categoryId } },
    { name: "Products/GetByCategory", params: { categoryId, page, pageSize } },
    { name: "Item/GetByCategory", params: { categoryId, page, pageSize } },
    { name: "Item/GetByCategoryId", params: { categoryId, page, pageSize } },
    { name: "Item/GetItemByCategoryId", params: { categoryId } },
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest<any>(config, endpoint.name, endpoint.params);
    
    if (result.success && result.data) {
      const products = Array.isArray(result.data) ? result.data : [result.data];
      result.data = products.map(normalizeProduct);
      return result as PosApiResponse<PosProduct[]>;
    }
  }
  
  return {
    success: false,
    error: `No products found for category ${categoryId}`,
  };
}

/**
 * Get all products (paginated)
 * Falls back to fetching products by category if main endpoint fails
 */
export async function getAllProducts(
  config: PosConfig,
  onProgress?: (current: number, total: number) => void
): Promise<PosApiResponse<PosProduct[]>> {
  const allProducts: PosProduct[] = [];
  let page = 1;
  const pageSize = 100;
  let hasMore = true;

  // First, try the main products endpoint
  while (hasMore) {
    const result = await getProducts(config, page, pageSize);
    
    if (!result.success) {
      // If main endpoint failed, try fetching by category
      return await getProductsByAllCategories(config, onProgress);
    }

    if (result.data && result.data.length > 0) {
      allProducts.push(...result.data);
      onProgress?.(allProducts.length, allProducts.length);
      
      if (result.data.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    } else {
      hasMore = false;
    }
  }

  return { success: true, data: allProducts };
}

/**
 * Get products by fetching from all categories
 */
async function getProductsByAllCategories(
  config: PosConfig,
  onProgress?: (current: number, total: number) => void
): Promise<PosApiResponse<PosProduct[]>> {
  // Get ALL categories (main + subcategories)
  console.log("[POS API] Fetching all categories for product lookup...");
  const categoriesResult = await getAllCategories(config);
  
  if (!categoriesResult.success || !categoriesResult.data) {
    return {
      success: false,
      error: "Failed to fetch categories for product lookup",
    };
  }
  
  console.log(`[POS API] Will fetch products from ${categoriesResult.data.length} categories`);
  
  const allProducts: PosProduct[] = [];
  const seenProductIds = new Set<number>();
  
  // Use the correct endpoint: Product/GetProductsByCategory with categoryId, pageNumber, and pageSize
  console.log("[POS API] Fetching products by category using Product/GetProductsByCategory...");
  
  for (const category of categoriesResult.data) {
    console.log(`[POS API] Fetching products for category ${category.CategoryID} (${category.CategoryName})...`);
    
    const pageSize = 100;
    let pageNumber = 1;
    let hasMorePages = true;
    
    while (hasMorePages) {
      const params = {
        categoryId: category.CategoryID,
        pageNumber: pageNumber,
        pageSize: pageSize,
      };
      
      console.log(`[POS API] Fetching page ${pageNumber} for category ${category.CategoryID}...`);
      const result = await makeRequest<any>(config, "Product/GetProductsByCategory", params);
      
      if (result.success && result.data) {
        const products = Array.isArray(result.data) ? result.data : [result.data];
        
        if (products.length === 0) {
          console.log(`[POS API] No products found on page ${pageNumber} for category ${category.CategoryID}`);
          hasMorePages = false;
          break;
        }
        
        if (allProducts.length === 0 && pageNumber === 1) {
          console.log("[POS API] Product structure:", JSON.stringify(products[0], null, 2));
        }
        
        console.log(`[POS API] Found ${products.length} products on page ${pageNumber} for category ${category.CategoryID}`);
        
        for (const prod of products) {
          const normalizedProd = normalizeProduct(prod);
          if (!seenProductIds.has(normalizedProd.ProductID)) {
            seenProductIds.add(normalizedProd.ProductID);
            allProducts.push(normalizedProd);
          }
        }
        
        onProgress?.(allProducts.length, allProducts.length);
        
        // If we got fewer products than pageSize, we've reached the last page
        if (products.length < pageSize) {
          hasMorePages = false;
        } else {
          pageNumber++;
        }
      } else {
        console.log(`[POS API] ❌ Failed to fetch page ${pageNumber} for category ${category.CategoryID}: ${result.error || 'No data'}`);
        hasMorePages = false;
      }
    }
    
    console.log(`[POS API] ✅ Finished fetching products for category ${category.CategoryID} (${category.CategoryName})`);
  }
  
  if (allProducts.length === 0) {
    return {
      success: false,
      error: "No products found in any category. The POS API may not have a products endpoint.",
    };
  }
  
  return { success: true, data: allProducts };
}

/**
 * Test the POS API connection
 */
export async function testPosConnection(config: PosConfig): Promise<{
  success: boolean;
  error?: string;
  categoryCount?: number;
}> {
  try {
    // Use getAllCategories which uses Category/GetSubCategory
    const result = await getAllCategories(config);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to fetch categories",
      };
    }

    return {
      success: true,
      categoryCount: result.data?.length || 0,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}
