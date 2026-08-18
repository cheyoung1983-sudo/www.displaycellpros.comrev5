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

const DEFAULT_STORE_DOMAIN =
  process.env.SHOPIFY_STORE_DOMAIN ||
  process.env.DCP_SANDBOX_SHOPIFY_STORE_DOMAIN ||
  "vercel-store-34d604b7-q6ui4f53.myshopify.com";
const DEFAULT_STOREFRONT_TOKEN =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
  process.env.DCP_SANDBOX_SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
  "cda195dfcf9e55984c840562aaeafa85";

export async function shopifyFetch<T>({
  query,
  variables,
}: {
  query: string;
  variables?: Record<string, any>;
}): Promise<T | null> {
  const domain =
    process.env.SHOPIFY_STORE_DOMAIN ||
    process.env.DCP_SANDBOX_SHOPIFY_STORE_DOMAIN ||
    DEFAULT_STORE_DOMAIN;
  const token =
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
    process.env.DCP_SANDBOX_SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
    DEFAULT_STOREFRONT_TOKEN;

  const endpoint = `https://${domain.replace(/^https?:\/\//, '')}/api/2024-01/graphql.json`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 60 },
    } as any);

    if (!res.ok) {
      console.error(`Shopify API error: ${res.status} ${res.statusText}`);
      return null;
    }

    const json = await res.json();
    if (json.errors) {
      console.error("Shopify GraphQL errors:", json.errors);
      return null;
    }

    return json.data as T;
  } catch (error) {
    console.error("Error fetching from Shopify Storefront API:", error);
    return null;
  }
}

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

  const data = await shopifyFetch<{ product: any }>({
    query,
    variables: { handle },
  });

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
