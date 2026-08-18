"use client";

import React, { useEffect, useState } from "react";
import { ShoppingCart, ShoppingBag, Loader2 } from "lucide-react";
import { STORE_PRODUCTS } from "@/lib/ui-constants";
import { shopifyFetch } from "@/lib/shopify";
import { PRODUCTS_QUERY } from "@/lib/shopify-queries";
import type { Product } from "@/lib/shopify-types";
import AddToCartButton from "@/components/AddToCartButton";

export function StoreView() {
  const [shopifyProducts, setShopifyProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await shopifyFetch<{ products: { nodes: Product[] } }>(
          PRODUCTS_QUERY,
          { first: 12 }
        );
        if (data && data.products && data.products.nodes.length > 0) {
          setShopifyProducts(data.products.nodes);
        }
      } catch (err) {
        console.error("Failed to load Shopify products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 border-b border-slate-800 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Logistics & Storefront
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Shopify Storefront Integration — Certified Parts & Equipment
          </p>
        </div>

        <a
          href="#cart"
          className="flex items-center text-slate-200 bg-slate-800/80 hover:bg-slate-700 px-4 py-2.5 rounded-xl border border-slate-700 font-semibold text-sm transition-colors w-fit gap-2 shadow-md"
        >
          <ShoppingCart size={18} className="text-blue-400" />
          <span>View Shopping Cart</span>
        </a>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <p className="text-sm font-mono">Fetching Shopify Storefront catalog...</p>
        </div>
      ) : shopifyProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {shopifyProducts.map((product) => {
            const firstVariant = product.variants?.nodes?.[0];
            const priceAmount = parseFloat(
              product.priceRange?.minVariantPrice?.amount || "0"
            ).toFixed(2);
            const currency =
              product.priceRange?.minVariantPrice?.currencyCode || "USD";

            return (
              <div
                key={product.id}
                className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden group flex flex-col hover:border-slate-700 transition-all shadow-lg"
              >
                <div className="h-52 overflow-hidden relative bg-slate-950 block">
                  {product.featuredImage ? (
                    <img
                      src={product.featuredImage.url}
                      alt={product.featuredImage.altText || product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                      <ShoppingBag size={48} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-slate-900/90 backdrop-blur text-[10px] font-bold px-2 py-1 rounded text-emerald-400 border border-slate-700">
                    {product.availableForSale ? "In Stock" : "Sold Out"}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-grow space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white mb-1 leading-snug line-clamp-2 hover:text-blue-400 transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {product.description || "Certified component for store distribution."}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <div className="font-mono">
                      <span className="text-xs text-slate-400 block uppercase text-[10px]">Price</span>
                      <span className="text-lg font-extrabold text-emerald-400">
                        ${priceAmount} <span className="text-xs text-slate-500 font-normal">{currency}</span>
                      </span>
                    </div>

                    {firstVariant && (
                      <AddToCartButton
                        variantId={firstVariant.id}
                        availableForSale={product.availableForSale}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Fallback catalog display */
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 text-xs text-slate-400 flex items-center justify-between">
            <span>Displaying Local Backup Catalog (Shopify Storefront domain pending catalog items).</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STORE_PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden group flex flex-col"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur text-xs font-bold px-2 py-1 rounded text-slate-300 border border-slate-700">
                    {product.category}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-base font-bold text-white mb-2 leading-tight">
                    {product.name}
                  </h3>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-400 font-mono">
                      ${product.price.toFixed(2)}
                    </span>
                    <a
                      href="#cart"
                      className="bg-slate-800 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-slate-700"
                    >
                      Buy
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StoreView;
