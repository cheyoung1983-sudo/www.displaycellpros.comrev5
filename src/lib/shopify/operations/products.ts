import { shopifyFetch } from '../../shopify.ts';

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  featuredImage?: {
    url: string;
    altText?: string;
  };
  images?: Array<{
    url: string;
    altText?: string;
  }>;
  priceRange?: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  variants?: Array<{
    id: string;
    title: string;
    price: {
      amount: string;
      currencyCode: string;
    };
  }>;
}

/**
 * Delegates to the single Storefront client in `src/lib/shopify.ts`. This file
 * used to carry its own copy of the credential resolution, hardcoded store
 * fallbacks, and an API-version pin that had drifted to an unsupported 2024-01
 * — three things to keep in sync instead of one.
 */

export async function getProduct(
  handle: string,
  _params?: any
): Promise<ShopifyProduct | null> {
  const query = `
    query getProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        handle
        title
        description
        descriptionHtml
        featuredImage {
          url
          altText
        }
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  let data: { product: any } | null = null;
  try {
    data = await shopifyFetch<{ product: any }>(query, { handle });
  } catch (error) {
    console.error('[shopify] getProduct failed:', error);
    return null;
  }

  if (!data || !data.product) {
    return null;
  }

  const p = data.product;
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description,
    descriptionHtml: p.descriptionHtml,
    featuredImage: p.featuredImage,
    images: p.images?.edges?.map((e: any) => e.node) || [],
    priceRange: p.priceRange,
    variants: p.variants?.edges?.map((e: any) => e.node) || [],
  };
}
