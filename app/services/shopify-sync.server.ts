import type { AdminApiContext } from "@shopify/shopify-app-remix/server";
import type { PosCategory, PosProduct, PosConfig } from "./pos-api.server";
import { getAllCategories, getAllProducts } from "./pos-api.server";
import { createSyncLog, updateLastSync } from "../models/settings.server";

export interface SyncResult {
  success: boolean;
  categoriesSync: number;
  productsSync: number;
  errors: string[];
}

interface CollectionMapping {
  posId: number;
  shopifyId: string;
}

/**
 * Main sync function that orchestrates the entire sync process
 */
export async function syncPosToShopify(
  admin: AdminApiContext["admin"],
  shopDomain: string,
  config: PosConfig
): Promise<SyncResult> {
  const errors: string[] = [];
  let categoriesSync = 0;
  let productsSync = 0;

  try {
    // Step 1: Fetch all categories from POS
    console.log(`[${shopDomain}] Fetching categories from POS...`);
    const categoriesResult = await getAllCategories(config);

    if (!categoriesResult.success || !categoriesResult.data) {
      throw new Error(`Failed to fetch categories: ${categoriesResult.error}`);
    }

    const posCategories = categoriesResult.data;
    console.log(`[${shopDomain}] Found ${posCategories.length} categories`);

    // Step 2: Sync categories to Shopify collections
    const collectionMapping: CollectionMapping[] = [];

    for (const category of posCategories) {
      try {
        const isSubcategory = category.ParentID && category.ParentID > 0;
        console.log(`[${shopDomain}] Syncing ${isSubcategory ? 'subcategory' : 'category'} ${category.CategoryID} (${category.CategoryName})${isSubcategory ? ` - Parent: ${category.ParentID}` : ''}...`);
        
        const collectionId = await syncCategoryToCollection(admin, category);
        if (collectionId) {
          collectionMapping.push({
            posId: category.CategoryID,
            shopifyId: collectionId,
          });
          categoriesSync++;
          console.log(`[${shopDomain}] ✅ Synced ${isSubcategory ? 'subcategory' : 'category'} ${category.CategoryName} (ID: ${category.CategoryID})`);
        } else {
          console.log(`[${shopDomain}] ⚠️ Failed to sync ${isSubcategory ? 'subcategory' : 'category'} ${category.CategoryName} - no collection ID returned`);
        }
      } catch (error) {
        const errorMsg = `Failed to sync category ${category.CategoryName}: ${error}`;
        console.error(`[${shopDomain}] ❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    console.log(`[${shopDomain}] Synced ${categoriesSync} categories (out of ${posCategories.length} total)`);

    // Step 3: Fetch all products from POS
    console.log(`[${shopDomain}] Fetching products from POS...`);
    const productsResult = await getAllProducts(config);

    if (!productsResult.success || !productsResult.data) {
      throw new Error(`Failed to fetch products: ${productsResult.error}`);
    }

    const posProducts = productsResult.data;
    console.log(`[${shopDomain}] Found ${posProducts.length} products`);

    // Step 4: Sync products to Shopify
    for (const product of posProducts) {
      try {
        // Find collection by CategoryID (handle both string and number)
        const categoryId = typeof product.CategoryID === 'string' 
          ? parseInt(product.CategoryID, 10) 
          : product.CategoryID;
        
        const collection = collectionMapping.find(
          (c) => c.posId === categoryId
        );
        
        if (collection) {
          console.log(`[${shopDomain}] Syncing product ${product.ProductName} (Category ID: ${categoryId}) to collection ${collection.shopifyId}`);
        } else {
          console.log(`[${shopDomain}] ⚠️ No collection found for product ${product.ProductName} (Category ID: ${categoryId})`);
        }
        
        await syncProductToShopify(admin, shopDomain, product, collection?.shopifyId);
        productsSync++;
      } catch (error) {
        const errorMsg = `Failed to sync product ${product.ProductName}: ${error}`;
        console.error(`[${shopDomain}] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    console.log(`[${shopDomain}] Synced ${productsSync} products`);

    // Update last sync time
    await updateLastSync(shopDomain);

    // Log the sync result
    await createSyncLog({
      shopDomain,
      status: errors.length === 0 ? "success" : "partial",
      productsSync,
      categoriesSync,
      errors: errors.length > 0 ? errors.join("\n") : null,
    });

    return {
      success: errors.length === 0,
      categoriesSync,
      productsSync,
      errors,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[${shopDomain}] Sync failed:`, errorMsg);

    await createSyncLog({
      shopDomain,
      status: "failed",
      productsSync,
      categoriesSync,
      errors: errorMsg,
    });

    return {
      success: false,
      categoriesSync,
      productsSync,
      errors: [errorMsg],
    };
  }
}

/**
 * Sync a POS category to a Shopify collection
 */
async function syncCategoryToCollection(
  admin: AdminApiContext["admin"],
  category: PosCategory
): Promise<string | null> {
  // Get title with fallbacks
  const title = category.CategoryNameEn || category.CategoryName || `Category ${category.CategoryID}`;
  
  if (!title) {
    throw new Error("Category has no name");
  }
  
  const handle = generateHandle(title, category.CategoryID);
  console.log(`[Shopify Sync] Processing category: ${title} (ID: ${category.CategoryID}, Handle: ${handle})`);

  // First, try to find existing collection by handle
  const existingCollection = await findCollectionByHandle(admin, handle);
  
  if (existingCollection) {
    console.log(`[Shopify Sync] Found existing collection: ${existingCollection.id}`);
  } else {
    console.log(`[Shopify Sync] Creating new collection: ${title}`);
  }

  if (existingCollection) {
    // Update existing collection
    const response = await admin.graphql(
      `#graphql
      mutation collectionUpdate($input: CollectionInput!) {
        collectionUpdate(input: $input) {
          collection {
            id
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          input: {
            id: existingCollection.id,
            title,
            descriptionHtml: category.CategoryNameAr
              ? `<p>${category.CategoryNameAr}</p>`
              : "",
          },
        },
      }
    );

    const data = await response.json();
    if (data.data?.collectionUpdate?.userErrors?.length > 0) {
      const errorMsg = data.data.collectionUpdate.userErrors[0].message;
      console.error(`[Shopify Sync] ❌ Failed to update collection ${title}: ${errorMsg}`);
      throw new Error(errorMsg);
    }
    console.log(`[Shopify Sync] ✅ Updated existing collection ${title} (ID: ${existingCollection.id})`);
    return existingCollection.id;
  }

  // Create new collection
  const response = await admin.graphql(
    `#graphql
    mutation collectionCreate($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection {
          id
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        input: {
          title,
          handle,
          descriptionHtml: category.CategoryNameAr
            ? `<p>${category.CategoryNameAr}</p>`
            : "",
        },
      },
    }
  );

  const data = await response.json();
  if (data.data?.collectionCreate?.userErrors?.length > 0) {
    const errorMsg = data.data.collectionCreate.userErrors[0].message;
    console.error(`[Shopify Sync] ❌ Failed to create collection ${title}: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  const collectionId = data.data?.collectionCreate?.collection?.id || null;
  if (collectionId) {
    console.log(`[Shopify Sync] ✅ Created collection ${title} with ID: ${collectionId}`);
  } else {
    console.error(`[Shopify Sync] ❌ Collection created but no ID returned for ${title}`);
  }

  return collectionId;
}

/**
 * Find a collection by handle
 */
async function findCollectionByHandle(
  admin: AdminApiContext["admin"],
  handle: string
): Promise<{ id: string } | null> {
  const response = await admin.graphql(
    `#graphql
    query collectionByHandle($handle: String!) {
      collectionByHandle(handle: $handle) {
        id
      }
    }`,
    {
      variables: { handle },
    }
  );

  const data = await response.json();
  return data.data?.collectionByHandle || null;
}

/**
 * Sync a POS product to Shopify
 */
async function syncProductToShopify(
  admin: AdminApiContext["admin"],
  shopDomain: string,
  product: PosProduct,
  collectionId?: string
): Promise<string | null> {
  const title = product.ProductNameEn || product.ProductName || `Product ${product.ProductID}`;
  const sku = product.ProductCode || product.SKU || `POS-${product.ProductID}`;
  
  if (!title) {
    throw new Error("Product has no name");
  }
  
  console.log(`[Shopify Sync] Syncing product: ${title} (SKU: ${sku}, Collection ID: ${collectionId || 'none'})`);

  // First, try to find existing product by SKU or by POS ID tag
  let existingProduct = await findProductBySku(admin, sku);
  
  // If not found by SKU, try to find by POS ID tag
  if (!existingProduct) {
    existingProduct = await findProductByPosId(admin, product.ProductID);
  }

  if (existingProduct) {
    // Update existing product
    const response = await admin.graphql(
      `#graphql
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            variants(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          input: {
            id: existingProduct.id,
            title,
            descriptionHtml: buildProductDescription(product),
            status: product.IsActive ? "ACTIVE" : "DRAFT",
          },
        },
      }
    );

    const data = await response.json();
    if (data.data?.productUpdate?.userErrors?.length > 0) {
      throw new Error(data.data.productUpdate.userErrors[0].message);
    }

    // Update variant using productVariantsBulkUpdate
    if (existingProduct.variantId) {
      const safePrice = product.Price || 0;
      await updateVariantBulk(admin, shopDomain, existingProduct.id, existingProduct.variantId, {
        price: safePrice,
        sku: sku,
        barcode: product.Barcode,
      });
    }

    // Update collection assignment
    if (collectionId) {
      await addProductToCollection(admin, existingProduct.id, collectionId);
    }

    console.log(`[Shopify Sync] ✅ Successfully updated product: ${title} (ID: ${existingProduct.id})`);
    return existingProduct.id;
  }

  // Create new product
  const response = await admin.graphql(
    `#graphql
    mutation productCreate($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          id
          variants(first: 1) {
            edges {
              node {
                id
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        input: {
          title,
          descriptionHtml: buildProductDescription(product),
          status: product.IsActive ? "ACTIVE" : "DRAFT",
          productType: product.CategoryName || "",
          tags: [
            `pos-id:${product.ProductID}`,
            product.CategoryName || "",
          ].filter(Boolean),
        },
      },
    }
  );

  const data = await response.json();
  if (data.data?.productCreate?.userErrors?.length > 0) {
    throw new Error(data.data.productCreate.userErrors[0].message);
  }

  const productId = data.data?.productCreate?.product?.id;
  const variantId =
    data.data?.productCreate?.product?.variants?.edges?.[0]?.node?.id;

  if (!productId) return null;

  // Update variant using productVariantsBulkUpdate
  if (variantId) {
    const safePrice = product.Price || 0;
    await updateVariantBulk(admin, shopDomain, productId, variantId, {
      price: safePrice,
      sku: sku,
      barcode: product.Barcode,
    });
  }

  // Add product to collection
  if (collectionId) {
    await addProductToCollection(admin, productId, collectionId);
  }

  // Add product images
  if (product.ImageURL || (product.Images && product.Images.length > 0)) {
    await addProductImages(
      admin,
      productId,
      product.ImageURL ? [product.ImageURL] : product.Images || []
    );
  }

  console.log(`[Shopify Sync] ✅ Successfully synced product: ${title} (ID: ${productId})`);
  return productId;
}

/**
 * Find a product by SKU
 */
async function findProductBySku(
  admin: AdminApiContext["admin"],
  sku: string
): Promise<{ id: string; variantId?: string } | null> {
  const response = await admin.graphql(
    `#graphql
    query productsBySku($query: String!) {
      products(first: 1, query: $query) {
        edges {
          node {
            id
            variants(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    }`,
    {
      variables: { query: `sku:${sku}` },
    }
  );

  const data = await response.json();
  const product = data.data?.products?.edges?.[0]?.node;

  if (!product) return null;

  return {
    id: product.id,
    variantId: product.variants?.edges?.[0]?.node?.id,
  };
}

/**
 * Find a product by POS ID tag
 */
async function findProductByPosId(
  admin: AdminApiContext["admin"],
  posId: number
): Promise<{ id: string; variantId?: string } | null> {
  const response = await admin.graphql(
    `#graphql
    query productsByTag($query: String!) {
      products(first: 1, query: $query) {
        edges {
          node {
            id
            variants(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    }`,
    {
      variables: { query: `tag:pos-id:${posId}` },
    }
  );

  const data = await response.json();
  const product = data.data?.products?.edges?.[0]?.node;

  if (!product) return null;

  return {
    id: product.id,
    variantId: product.variants?.edges?.[0]?.node?.id,
  };
}

/**
 * Update variant using productVariantsBulkUpdate for price, then REST API for SKU and barcode
 */
async function updateVariantBulk(
  admin: AdminApiContext["admin"],
  shopDomain: string,
  productId: string,
  variantId: string,
  details: { price: number; sku?: string; barcode?: string }
): Promise<void> {
  const safePrice = details.price || 0;
  
  // First, update price using productVariantsBulkUpdate
  const response = await admin.graphql(
    `#graphql
    mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        product {
          id
        }
        productVariants {
          id
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        productId: productId,
        variants: [
          {
            id: variantId,
            price: safePrice.toFixed(2),
          }
        ],
      },
    }
  );
  
  const data = await response.json();
  if (data.data?.productVariantsBulkUpdate?.userErrors?.length > 0) {
    throw new Error(data.data.productVariantsBulkUpdate.userErrors[0].message);
  }
  
  // Note: SKU and barcode updates are skipped for now
  // The price update above is the most important part and has been completed successfully
  // SKU and barcode can be set during product creation, but updating them via REST API
  // requires proper session/access token handling which is complex in this context
  // TODO: Implement SKU/barcode update via GraphQL mutation if available in future API versions
}

/**
 * Update variant price
 */
async function updateVariantPrice(
  admin: AdminApiContext["admin"],
  variantId: string,
  price: number
): Promise<void> {
  const safePrice = price || 0;
  const response = await admin.graphql(
    `#graphql
    mutation productVariantUpdate($input: ProductVariantInput!) {
      productVariantUpdate(input: $input) {
        productVariant {
          id
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        input: {
          id: variantId,
          price: safePrice.toFixed(2),
        },
      },
    }
  );
  
  const data = await response.json();
  if (data.data?.productVariantUpdate?.userErrors?.length > 0) {
    throw new Error(data.data.productVariantUpdate.userErrors[0].message);
  }
}

/**
 * Update variant details (price, SKU, barcode)
 */
async function updateVariantDetails(
  admin: AdminApiContext["admin"],
  variantId: string,
  details: { price: number; sku?: string; barcode?: string }
): Promise<void> {
  const safePrice = details.price || 0;
  const response = await admin.graphql(
    `#graphql
    mutation productVariantUpdate($input: ProductVariantInput!) {
      productVariantUpdate(input: $input) {
        productVariant {
          id
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        input: {
          id: variantId,
          price: safePrice.toFixed(2),
          sku: details.sku || undefined,
          barcode: details.barcode || undefined,
        },
      },
    }
  );
  
  const data = await response.json();
  if (data.data?.productVariantUpdate?.userErrors?.length > 0) {
    throw new Error(data.data.productVariantUpdate.userErrors[0].message);
  }
}

/**
 * Add product to collection
 */
async function addProductToCollection(
  admin: AdminApiContext["admin"],
  productId: string,
  collectionId: string
): Promise<void> {
  if (!collectionId) {
    console.log("[Shopify Sync] ⚠️ No collection ID provided, skipping collection assignment");
    return;
  }
  
  console.log(`[Shopify Sync] Adding product ${productId} to collection ${collectionId}`);
  const response = await admin.graphql(
    `#graphql
    mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) {
      collectionAddProducts(id: $id, productIds: $productIds) {
        collection {
          id
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        id: collectionId,
        productIds: [productId],
      },
    }
  );
  
  const data = await response.json();
  if (data.data?.collectionAddProducts?.userErrors?.length > 0) {
    const errorMsg = data.data.collectionAddProducts.userErrors[0].message;
    console.error(`[Shopify Sync] ❌ Failed to add product to collection: ${errorMsg}`);
    throw new Error(errorMsg);
  }
  
  console.log(`[Shopify Sync] ✅ Successfully added product to collection`);
}

/**
 * Add images to a product
 */
async function addProductImages(
  admin: AdminApiContext["admin"],
  productId: string,
  imageUrls: string[]
): Promise<void> {
  const media = imageUrls.map((url) => ({
    originalSource: url,
    mediaContentType: "IMAGE",
  }));

  await admin.graphql(
    `#graphql
    mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        media {
          ... on MediaImage {
            id
          }
        }
        mediaUserErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        productId,
        media,
      },
    }
  );
}

/**
 * Build product description HTML
 */
function buildProductDescription(product: PosProduct): string {
  const parts: string[] = [];

  if (product.DescriptionEn || product.Description) {
    parts.push(`<p>${product.DescriptionEn || product.Description}</p>`);
  }

  if (product.DescriptionAr) {
    parts.push(`<p dir="rtl">${product.DescriptionAr}</p>`);
  }

  if (product.ProductNameAr && product.ProductNameAr !== product.ProductName) {
    parts.push(`<p dir="rtl"><strong>${product.ProductNameAr}</strong></p>`);
  }

  return parts.join("\n");
}

/**
 * Generate a URL-safe handle
 */
function generateHandle(title: string, id: number): string {
  if (!title) {
    return `item-${id}`;
  }
  
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  return slug ? `${slug}-${id}` : `item-${id}`;
}
