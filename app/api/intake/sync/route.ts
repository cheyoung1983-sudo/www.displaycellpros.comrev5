import { NextRequest, NextResponse } from 'next/server';
import { formRateLimiterNext } from '../../../../src/lib/serverSecurity.ts';
import { IntakeFormSchema } from '../../../../src/types.ts';
import { shopifyFetch, isShopifyConfigured } from '../../../../src/lib/shopify.ts';
import { PRODUCTS_QUERY, CREATE_CART_WITH_INPUT_MUTATION } from '../../../../src/lib/shopify-queries.ts';
import type { Product, Cart } from '../../../../src/lib/shopify-types.ts';

// Repair-tier → catalog category keywords. TIER_3_BOARD (logic board / micro-soldering)
// has no matching product category in the catalog today, so it never auto-matches.
const TIER_CATEGORY_KEYWORDS: Record<string, string[]> = {
  TIER_1_POWER: ['battery', 'charging'],
  TIER_2_DISPLAY: ['screen'],
  TIER_3_BOARD: [],
};

function normalizeTokens(text: string): string[] {
  return (text.toLowerCase().match(/[a-z]+|\d+/g) || []);
}

async function findMatchingVariant(deviceManufacturer: string, deviceModel: string, serviceTier: string) {
  const keywords = TIER_CATEGORY_KEYWORDS[serviceTier] || [];
  if (keywords.length === 0) return null;

  const data = await shopifyFetch<{ products: { nodes: Product[] } }>(PRODUCTS_QUERY, { first: 50 });
  const products = data.products.nodes;

  const deviceTokens = new Set(normalizeTokens(`${deviceManufacturer} ${deviceModel}`));

  let best: { product: Product; score: number } | null = null;
  for (const product of products) {
    const titleLower = product.title.toLowerCase();
    if (!keywords.some((k) => titleLower.includes(k))) continue;

    const deviceSegment = product.title.split(',')[0];
    const productTokens = normalizeTokens(deviceSegment);
    const overlap = productTokens.filter((t) => deviceTokens.has(t));
    const numericOverlap = overlap.filter((t) => /^\d+$/.test(t));
    if (numericOverlap.length === 0) continue; // require a model-number match, not just "iphone"

    const score = overlap.length - productTokens.length * 0.1; // prefer more specific listings
    if (!best || score > best.score) best = { product, score };
  }

  if (!best) return null;
  const variant = best.product.variants.nodes[0];
  return variant ? { variant, product: best.product } : null;
}

async function createShopifyCart(data: any, devicePhotos: any[], photoMetadata: any) {
  const match = await findMatchingVariant(data.deviceManufacturer, data.deviceModel, data.serviceTier);
  if (!match) return { cart: null, matched: false };

  const note = [
    `Device: ${data.deviceManufacturer} ${data.deviceModel} (IMEI: ${data.imei})`,
    `Reported Issue: ${data.customerReportedIssue}`,
    `Telemetry: battery ${data.telemetry.batteryHealthPercentage}%, ${data.telemetry.batteryTempCelsius}C, ${data.telemetry.ammeterDrawAmps}A draw${data.telemetry.isShortToGround ? ', SHORT TO GROUND' : ''}`,
    devicePhotos.length ? `Attached Photos: ${devicePhotos.length} (${(photoMetadata.categories || []).join(', ')})` : null,
  ].filter(Boolean).join('\n');

  const input = {
    lines: [{ merchandiseId: match.variant.id, quantity: 1 }],
    buyerIdentity: { email: data.customerEmail, phone: data.customerPhone },
    note,
    attributes: [
      { key: 'IMEI', value: data.imei },
      { key: 'Service Tier', value: data.serviceTier },
      { key: 'Photo Count', value: String(devicePhotos.length) },
    ],
  };

  const json = await shopifyFetch<{ cartCreate: { cart: Cart; userErrors: { field: string[]; message: string }[] } }>(
    CREATE_CART_WITH_INPUT_MUTATION,
    { input }
  );

  const userErrors = json?.cartCreate?.userErrors;
  if (userErrors?.length) {
    throw new Error(`Shopify cart rejected: ${userErrors.map((e) => e.message).join('; ')}`);
  }

  const cart = json?.cartCreate?.cart;
  if (!cart?.id) {
    throw new Error('Shopify cart creation returned no cart.');
  }

  return { cart, matched: true, matchedProductTitle: match.product.title };
}

export async function POST(req: NextRequest) {
  const limited = formRateLimiterNext.check(req);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));

  const parsed = IntakeFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid intake submission.', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = { ...body, ...parsed.data };
  const devicePhotos = data.devicePhotos || [];
  const photoMetadata = data.photoMetadata || {
    totalCount: devicePhotos.length,
    categories: Array.isArray(devicePhotos)
      ? Array.from(new Set(devicePhotos.map((p: any) => p?.category || 'General Condition')))
      : [],
  };

  console.log('Syncing intake with Spokane Lab & Shopify:', {
    deviceManufacturer: data.deviceManufacturer,
    deviceModel: data.deviceModel,
    imei: data.imei,
    attachedPhotosCount: devicePhotos.length,
    photoCategories: photoMetadata.categories,
  });

  // Ask the Shopify client itself whether it can make a call, rather than
  // re-deriving it from environment variables here. When this check and the
  // client's own credential resolution drift apart, they disagree about which
  // store is in play — and the customer is the one who finds out.
  if (!isShopifyConfigured()) {
    // The placeholder below hands back a checkout URL that goes nowhere. That
    // is a reasonable stand-in for local development, but in production it
    // would tell a real customer their order was provisioned when no order
    // exists, so fail loudly there instead.
    if (process.env.NODE_ENV === 'production') {
      console.error(
        'Intake sync reached production without Shopify credentials — ' +
          'set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN.'
      );
      return NextResponse.json(
        {
          success: false,
          error:
            'Online checkout is temporarily unavailable. Your intake has not been submitted — please contact the Spokane Lab directly.',
        },
        { status: 503 }
      );
    }

    const draftOrderId = `gid://shopify/DraftOrder/${Math.floor(100000000 + Math.random() * 900000000)}`;
    return NextResponse.json({
      success: true,
      mocked: true,
      draftOrderId,
      invoiceUrl: 'https://checkout.shopify.com/mock-invoice',
      attachedPhotoCount: devicePhotos.length,
      attachedCategories: photoMetadata.categories || [],
      labTicketCreated: true,
    });
  }

  try {
    const result = await createShopifyCart(data, devicePhotos, photoMetadata);

    if (!result.matched || !result.cart) {
      // No catalog product matches this device/tier combo (e.g. Tier 3 board work,
      // or a device model not yet stocked) — the Storefront Cart API can only check
      // out real products, so this can't be automated. Record the intake honestly
      // instead of faking a checkout link.
      return NextResponse.json({
        success: true,
        mocked: false,
        matched: false,
        draftOrderId: null,
        invoiceUrl: null,
        attachedPhotoCount: devicePhotos.length,
        attachedCategories: photoMetadata.categories || [],
        labTicketCreated: true,
        message: 'This repair type isn’t available for instant online checkout yet. A Spokane Lab technician will contact you directly to arrange payment.',
      });
    }

    return NextResponse.json({
      success: true,
      mocked: false,
      matched: true,
      draftOrderId: result.cart.id,
      invoiceUrl: result.cart.checkoutUrl,
      matchedProduct: result.matchedProductTitle,
      attachedPhotoCount: devicePhotos.length,
      attachedCategories: photoMetadata.categories || [],
      labTicketCreated: true,
    });
  } catch (error: any) {
    console.error('Shopify cart creation failed:', error);
    return NextResponse.json(
      { success: false, error: 'Could not create Shopify checkout. Please try again or contact support.' },
      { status: 502 }
    );
  }
}
