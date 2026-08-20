"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Star, 
  CheckCircle2, 
  ShieldCheck, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Plus, 
  Sparkles, 
  Filter, 
  X, 
  ChevronRight, 
  SlidersHorizontal,
  Code2,
  Copy,
  Check,
  Quote,
  ShoppingBag,
  Heart,
  TrendingUp,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils.ts';
import { useToast } from './Toast.tsx';

export interface Testimonial {
  id: string;
  user: string;
  location: string;
  rating: number;
  productPurchased: string;
  content: string;
  date: string;
  verifiedBuyer: boolean;
  helpfulCount: number;
  isHelpfulActive?: boolean;
  avatarColor: string;
}

export interface NichePreset {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  testimonials: Testimonial[];
}

const NICHE_PRESETS: NichePreset[] = [
  {
    id: 'electronics',
    name: 'Precision Electronics & Board Repair',
    tagline: 'Micro-soldering, board rework, and calibrated component restoration',
    badge: 'Lab Services',
    testimonials: [
      {
        id: 'el-1',
        user: 'Elena Rostova',
        location: 'Seattle, WA',
        rating: 5,
        productPurchased: 'iPhone 15 Pro Logic Board Short & Data Recovery',
        content: 'Two separate repair shops told me my water-damaged iPhone was a total loss and my unbacked-up family photos were gone forever. D&CP diagnosed the shorted VDD_MAIN line under thermal microscopy, replaced two micro-capacitors, and restored 100% of my data within 36 hours. Absolute masterclass in micro-soldering.',
        date: '2 days ago',
        verifiedBuyer: true,
        helpfulCount: 42,
        avatarColor: 'from-blue-600 to-indigo-700'
      },
      {
        id: 'el-2',
        user: 'Dr. Marcus Vance',
        location: 'Spokane, WA',
        rating: 5,
        productPurchased: 'MacBook Pro M2 Max PMIC Power Rail Repair',
        content: 'The level of engineering transparency is unheard of in retail repair. They provided high-resolution scope footage showing the burned PMIC trace and oscilloscope waveforms before and after reballing. The machine runs cooler than the day I unboxed it.',
        date: '5 days ago',
        verifiedBuyer: true,
        helpfulCount: 29,
        avatarColor: 'from-amber-500 to-orange-600'
      },
      {
        id: 'el-3',
        user: 'Claire Montgomery',
        location: 'Coeur d\'Alene, ID',
        rating: 5,
        productPurchased: 'Galaxy S24 Ultra Dynamic AMOLED 2X Assembly',
        content: 'OEM calibrated display renewal that passed all Samsung Knox hardware diagnostics with flying colors. The color depth, 120Hz refresh fluidity, and ultrasonic fingerprint scanner responsiveness are identical to factory fresh.',
        date: '1 week ago',
        verifiedBuyer: true,
        helpfulCount: 18,
        avatarColor: 'from-emerald-500 to-teal-700'
      },
      {
        id: 'el-4',
        user: 'Tyler Brooks',
        location: 'Portland, OR',
        rating: 5,
        productPurchased: 'iPad Pro 12.9" Digitizer FPC Connector Rework',
        content: 'Super fast turnaround. Dropped it off with a severed FPC connector ribbon pin, and had it shipped back with pristine touch response and Apple Pencil tilt recognition intact. Remarkable precision.',
        date: '2 weeks ago',
        verifiedBuyer: true,
        helpfulCount: 14,
        avatarColor: 'from-purple-600 to-pink-600'
      },
      {
        id: 'el-5',
        user: 'Amara Washington',
        location: 'Spokane Valley, WA',
        rating: 5,
        productPurchased: 'OEM High-Density Battery Refresh Pack',
        content: 'Saved me $900 over buying a new phone. Battery health telemetry shows 100% capacity and zero cycle degradation after 3 weeks of intensive fieldwork usage. Outstanding service and staff.',
        date: '3 weeks ago',
        verifiedBuyer: true,
        helpfulCount: 11,
        avatarColor: 'from-cyan-600 to-blue-700'
      }
    ]
  }
];

export default function Reviews() {
  const { showToast } = useToast();

  // Niche and custom niche state
  const [selectedNicheId, setSelectedNicheId] = useState<string>('electronics');
  const [customNicheInput, setCustomNicheInput] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Review storage mapped by niche ID (with state persistence during session)
  const [nicheDataMap, setNicheDataMap] = useState<Record<string, Testimonial[]>>(() => {
    const initialMap: Record<string, Testimonial[]> = {};
    NICHE_PRESETS.forEach(n => {
      initialMap[n.id] = n.testimonials;
    });
    return initialMap;
  });

  // Custom niche dynamically generated reviews
  const [customTestimonials, setCustomTestimonials] = useState<Testimonial[]>([
    {
      id: 'cust-1',
      user: 'Alexander Wright',
      location: 'New York, NY',
      rating: 5,
      productPurchased: 'Signature Product / Custom Order',
      content: 'The quality of materials and attention to detail exceeded all my expectations. The shipping was prompt, packaging was pristine, and customer support answered all my sizing and care questions in minutes.',
      date: 'Just now',
      verifiedBuyer: true,
      helpfulCount: 19,
      avatarColor: 'from-blue-600 to-indigo-800'
    },
    {
      id: 'cust-2',
      user: 'Maya Lin',
      location: 'San Francisco, CA',
      rating: 5,
      productPurchased: 'Pro Edition / Batch #01',
      content: 'I have tested numerous alternatives on the market, but nothing matches the ergonomic feel, durability, and refined aesthetic of this product. Truly top tier in its class.',
      date: '3 days ago',
      verifiedBuyer: true,
      helpfulCount: 14,
      avatarColor: 'from-emerald-600 to-teal-800'
    },
    {
      id: 'cust-3',
      user: 'Jordan Vance',
      location: 'London, UK',
      rating: 5,
      productPurchased: 'Complete Bundle & Accessories',
      content: 'Flawless user experience from checkout to unboxing. You can immediately feel the dedication and premium manufacturing standard. Will definitely be a repeat customer!',
      date: '1 week ago',
      verifiedBuyer: true,
      helpfulCount: 11,
      avatarColor: 'from-amber-600 to-orange-700'
    },
    {
      id: 'cust-4',
      user: 'Sophia Bennett',
      location: 'Sydney, AU',
      rating: 5,
      productPurchased: 'Collector\'s Edition',
      content: 'Remarkable craftsmanship and beautiful aesthetics. The customer service team kept me updated at every fulfillment stage. 5 stars all the way.',
      date: '2 weeks ago',
      verifiedBuyer: true,
      helpfulCount: 8,
      avatarColor: 'from-purple-600 to-rose-700'
    }
  ]);

  // Active reviews list
  const currentReviews = useMemo(() => {
    if (isCustomMode) {
      return customTestimonials;
    }
    return nicheDataMap[selectedNicheId] || NICHE_PRESETS[0].testimonials;
  }, [isCustomMode, selectedNicheId, nicheDataMap, customTestimonials]);

  // Filtering & Sorting State
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | 'verified'>('all');
  const [sortBy, setSortBy] = useState<'helpful' | 'newest' | 'rating'>('helpful');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isLiquidExportOpen, setIsLiquidExportOpen] = useState(false);
  const [hasCopiedLiquid, setHasCopiedLiquid] = useState(false);

  // New review form
  const [newReview, setNewReview] = useState({
    user: '',
    location: '',
    rating: 5,
    productPurchased: '',
    content: ''
  });

  // Calculate statistics
  const totalCount = currentReviews.length;
  const avgRating = totalCount > 0 
    ? (currentReviews.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1)
    : '5.0';
  const fiveStarPercent = totalCount > 0
    ? Math.round((currentReviews.filter(r => r.rating === 5).length / totalCount) * 100)
    : 100;
  const verifiedCount = currentReviews.filter(r => r.verifiedBuyer).length;

  // Filtered & sorted reviews
  const displayReviews = useMemo(() => {
    let list = [...currentReviews];
    if (ratingFilter === '5') {
      list = list.filter(r => r.rating === 5);
    } else if (ratingFilter === 'verified') {
      list = list.filter(r => r.verifiedBuyer);
    }

    if (sortBy === 'helpful') {
      list.sort((a, b) => b.helpfulCount - a.helpfulCount);
    } else if (sortBy === 'newest') {
      // maintain default reverse chronological
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [currentReviews, ratingFilter, sortBy]);

  // Toggle helpful button
  const handleToggleHelpful = (reviewId: string) => {
    if (isCustomMode) {
      setCustomTestimonials(prev => prev.map(r => {
        if (r.id === reviewId) {
          const wasActive = r.isHelpfulActive;
          return {
            ...r,
            helpfulCount: wasActive ? r.helpfulCount - 1 : r.helpfulCount + 1,
            isHelpfulActive: !wasActive
          };
        }
        return r;
      }));
    } else {
      setNicheDataMap(prev => {
        const updatedList = (prev[selectedNicheId] || []).map(r => {
          if (r.id === reviewId) {
            const wasActive = r.isHelpfulActive;
            return {
              ...r,
              helpfulCount: wasActive ? r.helpfulCount - 1 : r.helpfulCount + 1,
              isHelpfulActive: !wasActive
            };
          }
          return r;
        });
        return { ...prev, [selectedNicheId]: updatedList };
      });
    }
    showToast('Feedback recorded. Thank you!', 'info');
  };

  // Submit new review
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.user.trim() || !newReview.content.trim()) {
      showToast('Please enter your name and review experience.', 'info');
      return;
    }

    const created: Testimonial = {
      id: `rev-${Date.now()}`,
      user: newReview.user.trim(),
      location: newReview.location.trim() || 'Spokane, WA',
      rating: newReview.rating,
      productPurchased: newReview.productPurchased.trim() || (isCustomMode && customNicheInput ? `${customNicheInput} Order` : 'Store Order'),
      content: newReview.content.trim(),
      date: 'Just now',
      verifiedBuyer: true,
      helpfulCount: 1,
      isHelpfulActive: true,
      avatarColor: 'from-blue-600 to-indigo-700'
    };

    if (isCustomMode) {
      setCustomTestimonials([created, ...customTestimonials]);
    } else {
      setNicheDataMap(prev => ({
        ...prev,
        [selectedNicheId]: [created, ...(prev[selectedNicheId] || [])]
      }));
    }

    setNewReview({ user: '', location: '', rating: 5, productPurchased: '', content: '' });
    setIsWriteModalOpen(false);
    showToast('Review submitted and published successfully with Verified Buyer badge!', 'success');
  };

  // Apply custom niche input
  const handleApplyCustomNiche = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNiche = customNicheInput.trim();
    if (!cleanNiche) return;

    // Adapt custom testimonials with the niche title
    setCustomTestimonials([
      {
        id: `c-gen-1`,
        user: 'Eleanor Sterling',
        location: 'Seattle, WA',
        rating: 5,
        productPurchased: `${cleanNiche} — Premium Edition`,
        content: `I was searching everywhere for top-tier ${cleanNiche.toLowerCase()} and this store surpassed every single expectation. The build quality, packaging, and attention to detail are world-class.`,
        date: '2 days ago',
        verifiedBuyer: true,
        helpfulCount: 38,
        avatarColor: 'from-blue-600 to-indigo-700'
      },
      {
        id: `c-gen-2`,
        user: 'Marcus Vance',
        location: 'Austin, TX',
        rating: 5,
        productPurchased: `${cleanNiche} — Signature Model`,
        content: `Outstanding experience with our ${cleanNiche.toLowerCase()} purchase. Shipping was lightning fast, customer service was deeply knowledgeable, and the performance has been flawless.`,
        date: '5 days ago',
        verifiedBuyer: true,
        helpfulCount: 27,
        avatarColor: 'from-amber-600 to-orange-700'
      },
      {
        id: `c-gen-3`,
        user: 'Ryan Young',
        location: 'Chicago, IL',
        rating: 5,
        productPurchased: `${cleanNiche} — Pro Series`,
        content: `You can tell genuine engineering and passion went into this ${cleanNiche.toLowerCase()}. It performs exactly as advertised and has held up under rigorous daily use.`,
        date: '1 week ago',
        verifiedBuyer: true,
        helpfulCount: 19,
        avatarColor: 'from-emerald-600 to-teal-700'
      },
      {
        id: `c-gen-4`,
        user: 'Sophia Laurent',
        location: 'New York, NY',
        rating: 5,
        productPurchased: `${cleanNiche} — Complete Set`,
        content: `From the moment I unboxed it, I was blown away by the craftsmanship. Best investment I have made in ${cleanNiche.toLowerCase()} this year. Highly recommended!`,
        date: '2 weeks ago',
        verifiedBuyer: true,
        helpfulCount: 14,
        avatarColor: 'from-purple-600 to-pink-600'
      }
    ]);
    setIsCustomMode(true);
    showToast(`Loaded customer testimonials tailored for: "${cleanNiche}"`, 'success');
  };

  // Generate Shopify Liquid Snippet Code
  const shopifyLiquidSnippet = useMemo(() => {
    const currentNicheName = isCustomMode 
      ? (customNicheInput || 'Custom Store Niche') 
      : NICHE_PRESETS.find(n => n.id === selectedNicheId)?.name || 'Store';

    return `<!-- ============================================================
  SHOPIFY SECTION: sections/customer-testimonials.liquid
  Theme: Shopify Online Store 2.0 (Dawn, Prestige, Impulse compatible)
  Product Type / Niche: ${currentNicheName}
============================================================ -->

<section class="shopify-section customer-testimonials-section py-16 bg-slate-50 text-slate-900">
  <div class="max-w-7xl mx-auto px-6">
    <!-- Header -->
    <div class="text-center max-w-3xl mx-auto mb-12">
      <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
        ★ Verified Customer Reviews
      </span>
      <h2 class="text-4xl font-black text-slate-900 tracking-tight">
        Loved by Over 1,400+ Customers
      </h2>
      <p class="text-slate-600 mt-2 text-base">
        Real experiences from verified buyers of our ${currentNicheName.toLowerCase()}.
      </p>
    </div>

    <!-- Testimonials Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {% for block in section.blocks %}
        <div class="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <!-- Star Rating -->
            <div class="flex items-center gap-1 text-amber-500 mb-4">
              {% for i in (1..5) %}
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              {% endfor %}
              <span class="ml-2 text-xs font-bold text-slate-700">{{ block.settings.rating }}.0</span>
            </div>
            
            <!-- Quote -->
            <p class="text-slate-700 text-sm leading-relaxed italic mb-6">
              "{{ block.settings.quote | escape }}"
            </p>
          </div>

          <!-- Customer Meta -->
          <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <div class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                {{ block.settings.author_name | escape }}
                <span class="inline-flex items-center text-emerald-600 text-[11px] font-semibold" title="Verified Buyer">
                  ✓ Verified
                </span>
              </div>
              <div class="text-xs text-slate-500">{{ block.settings.product_purchased | escape }}</div>
            </div>
          </div>
        </div>
      {% endfor %}
    </div>
  </div>
</section>

{% schema %}
{
  "name": "Customer Testimonials",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Loved by Over 1,400+ Customers"
    }
  ],
  "blocks": [
    {
      "type": "testimonial",
      "name": "Customer Quote",
      "settings": [
        { "type": "text", "id": "author_name", "label": "Customer Name", "default": "Elena Rostova" },
        { "type": "range", "id": "rating", "min": 1, "max": 5, "step": 1, "label": "Star Rating", "default": 5 },
        { "type": "text", "id": "product_purchased", "label": "Purchased Item", "default": "Signature Series" },
        { "type": "textarea", "id": "quote", "label": "Customer Review Quote", "default": "Exceeded all expectations in quality and precision." }
      ]
    }
  ],
  "presets": [
    {
      "name": "Customer Testimonials Section",
      "category": "Social Proof"
    }
  ]
}
{% endschema %}`;
  }, [isCustomMode, customNicheInput, selectedNicheId]);

  const handleCopyLiquid = () => {
    navigator.clipboard.writeText(shopifyLiquidSnippet);
    setHasCopiedLiquid(true);
    showToast('Shopify Liquid snippet copied to clipboard!', 'success');
    setTimeout(() => setHasCopiedLiquid(false), 2500);
  };

  const activeNicheInfo = useMemo(() => {
    if (isCustomMode) {
      return {
        name: customNicheInput || 'Custom Store Niche',
        tagline: `Customer satisfaction quotes for ${customNicheInput || 'your custom product category'}`,
        badge: 'Custom Niche'
      };
    }
    return NICHE_PRESETS.find(n => n.id === selectedNicheId) || NICHE_PRESETS[0];
  }, [isCustomMode, customNicheInput, selectedNicheId]);

  return (
    <section id="customer-testimonials" className="py-24 bg-[#FAFAFA] relative overflow-hidden border-t border-slate-200/70">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">
        
        {/* ====================================================================
            TOP HEADER & STORE SOCIAL PROOF BANNER
        ==================================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-900 rounded-full text-xs font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Shopify Storefront • Verified Social Proof</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-playfair font-black text-slate-900 tracking-tight leading-tight">
              Customer Testimonials & <br />
              <span className="text-slate-400">Verified Satisfaction.</span>
            </h2>
            
            <p className="text-base text-slate-600 font-medium leading-relaxed">
              Read transparent feedback, verified star ratings, and real customer results. 
              Switch niches below or customize with your own product line.
            </p>
          </div>

          {/* Rating Summary Card */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-6 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="text-center sm:border-r sm:border-slate-100 sm:pr-6">
              <div className="text-4xl font-playfair font-black text-slate-900 flex items-center justify-center gap-1">
                <span>{avgRating}</span>
                <span className="text-sm font-sans font-bold text-slate-400">/ 5.0</span>
              </div>
              <div className="flex items-center justify-center gap-0.5 text-amber-500 my-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current text-amber-500" />
                ))}
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                {totalCount} Verified Reviews
              </span>
            </div>

            <div className="space-y-1.5 flex-1 min-w-[150px]">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{fiveStarPercent}% Satisfaction</span>
                </span>
                <span className="text-slate-400 font-mono text-[10px]">{verifiedCount} Verified</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${fiveStarPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 block">
                99.4% recommended repeat purchase rate
              </span>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <button 
                onClick={() => setIsWriteModalOpen(true)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md shadow-slate-900/10"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Write Review</span>
              </button>
              <button 
                onClick={() => setIsLiquidExportOpen(true)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-200"
                title="Export ready-to-paste Shopify Liquid section snippet"
              >
                <Code2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Liquid Snippet</span>
              </button>
            </div>
          </div>
        </div>

        {/* ====================================================================
            INTERACTIVE PRODUCT TYPE / NICHE SELECTOR & CUSTOMIZER
        ==================================================================== */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Select or Fill In Your Product Type / Niche
                </h3>
                <p className="text-xs text-slate-500">
                  Currently displaying: <strong className="text-slate-900">{activeNicheInfo.name}</strong>
                </p>
              </div>
            </div>

            {/* Quick Niche Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {NICHE_PRESETS.map((preset) => {
                const isSelected = !isCustomMode && selectedNicheId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedNicheId(preset.id);
                      setIsCustomMode(false);
                      showToast(`Switched to ${preset.name}`, 'info');
                    }}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                      isSelected
                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-102"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                    )}
                  >
                    <span>{preset.name.split('&')[0].trim()}</span>
                    {isSelected && <Check className="w-3 h-3 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Niche Text Input for "User to fill in product type/niche" */}
          <form onSubmit={handleApplyCustomNiche} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <ShoppingBag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                id="custom-niche-input"
                name="custom-niche-input"
                aria-label="Custom Shopify store product niche"
                value={customNicheInput}
                onChange={(e) => setCustomNicheInput(e.target.value)}
                placeholder="Type your custom Shopify store product niche (e.g. Custom Mechanical Keyboards, Organic Matcha, Scented Candles)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={!customNicheInput.trim()}
              className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply Custom Niche</span>
            </button>
          </form>
        </div>

        {/* ====================================================================
            FILTERING & SORTING CONTROLS
        ==================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setRatingFilter('all')}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                  ratingFilter === 'all' ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                )}
              >
                All ({currentReviews.length})
              </button>
              <button
                onClick={() => setRatingFilter('5')}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
                  ratingFilter === '5' ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                )}
              >
                <Star className="w-3 h-3 fill-current text-amber-500" />
                <span>5-Star Only</span>
              </button>
              <button
                onClick={() => setRatingFilter('verified')}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
                  ratingFilter === 'verified' ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                )}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Verified Buyers</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="testimonial-sort" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Sort:</label>
            <select
              id="testimonial-sort"
              name="testimonial-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-slate-900"
            >
              <option value="helpful">Most Helpful</option>
              <option value="newest">Most Recent</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* ====================================================================
            TESTIMONIALS CARDS GRID (3-5 Customer Quotes with Star Ratings)
        ==================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {displayReviews.map((testimonial) => {
              const initials = testimonial.user
                .split(' ')
                .map(n => n[0])
                .join('')
                .slice(0, 2);

              return (
                <motion.div
                  key={testimonial.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
                >
                  <div className="space-y-4">
                    {/* Top Row: Stars + Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={cn(
                              "w-4 h-4",
                              i < testimonial.rating ? "fill-current text-amber-500" : "text-slate-200"
                            )} 
                          />
                        ))}
                        <span className="text-xs font-bold font-mono text-slate-700 ml-1.5">
                          {testimonial.rating}.0
                        </span>
                      </div>

                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {testimonial.date}
                      </span>
                    </div>

                    {/* Product Tag Pill */}
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-700 rounded-lg text-[11px] font-bold max-w-full truncate">
                      <ShoppingBag className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{testimonial.productPurchased}</span>
                    </div>

                    {/* Quote Text */}
                    <div className="relative">
                      <Quote className="w-5 h-5 text-slate-200 absolute -top-1 -left-1 transform -scale-x-100 pointer-events-none opacity-40" />
                      <p className="text-slate-700 text-sm leading-relaxed relative z-10 pt-1">
                        "{testimonial.content}"
                      </p>
                    </div>
                  </div>

                  {/* Customer Info Footer */}
                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-xs shadow-xs",
                        testimonial.avatarColor
                      )}>
                        {initials}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>{testimonial.user}</span>
                          {testimonial.verifiedBuyer && (
                            <span 
                              className="inline-flex items-center gap-0.5 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold" 
                              title="Verified Storefront Purchase"
                            >
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          {testimonial.location}
                        </span>
                      </div>
                    </div>

                    {/* Helpful Upvote Button */}
                    <button
                      onClick={() => handleToggleHelpful(testimonial.id)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1",
                        testimonial.isHelpfulActive
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100"
                      )}
                      title="Mark review as helpful"
                    >
                      <ThumbsUp className={cn("w-3 h-3", testimonial.isHelpfulActive && "fill-current")} />
                      <span>{testimonial.helpfulCount}</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ====================================================================
            BOTTOM CALL-TO-ACTION BANNER
        ==================================================================== */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-slate-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-2 max-w-xl relative z-10">
            <h3 className="text-2xl font-playfair font-black tracking-tight">
              Share Your Experience With D&CP LLC
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every review helps fellow clients make informed decisions regarding logic board triage, screen renewals, and device longevity.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
            <button
              onClick={() => setIsWriteModalOpen(true)}
              className="flex-1 md:flex-none px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Submit a Testimonial</span>
            </button>
            <button
              onClick={() => setIsLiquidExportOpen(true)}
              className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all border border-slate-700 flex items-center gap-2"
            >
              <Code2 className="w-4 h-4 text-blue-400" />
              <span>Liquid Theme Code</span>
            </button>
          </div>
        </div>

      </div>

      {/* ====================================================================
          MODAL 1: WRITE A TESTIMONIAL MODAL
      ==================================================================== */}
      <AnimatePresence>
        {isWriteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6 relative"
            >
              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2">
                  Customer Review
                </div>
                <h3 className="text-2xl font-playfair font-black text-slate-900">
                  Write a Customer Testimonial
                </h3>
                <p className="text-xs text-slate-500">
                  Your feedback helps maintain our strict engineering and customer satisfaction standards.
                </p>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Your Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Rachel Adams"
                      value={newReview.user}
                      onChange={(e) => setNewReview({ ...newReview, user: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      City & State / Region
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Spokane, WA"
                      value={newReview.location}
                      onChange={(e) => setNewReview({ ...newReview, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Product / Service Purchased
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. iPhone 15 Pro Logic Board Triage or Custom Item"
                    value={newReview.productPurchased}
                    onChange={(e) => setNewReview({ ...newReview, productPurchased: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-slate-900 focus:outline-none"
                  />
                </div>

                {/* Star Rating Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Rating ({newReview.rating} Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          newReview.rating >= star
                            ? "bg-amber-100 text-amber-600 scale-105"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        )}
                      >
                        <Star className={cn("w-5 h-5", newReview.rating >= star && "fill-current")} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Text Area */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Your Testimonial Quote *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your satisfaction with the product craftsmanship, speed of delivery, or customer service..."
                    value={newReview.content}
                    onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-slate-900 focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-slate-900/10 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Publish Testimonial</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          MODAL 2: SHOPIFY LIQUID SECTION EXPORT MODAL
      ==================================================================== */}
      <AnimatePresence>
        {isLiquidExportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-800 space-y-6 relative max-h-[85vh] flex flex-col"
            >
              <button
                onClick={() => setIsLiquidExportOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Shopify Theme Section</span>
                </div>
                <h3 className="text-2xl font-playfair font-black text-white">
                  Shopify Liquid Testimonials Template
                </h3>
                <p className="text-xs text-slate-400">
                  Ready-to-use liquid section code for your Shopify store (`sections/customer-testimonials.liquid`).
                </p>
              </div>

              {/* Code Box */}
              <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed select-all">
                <pre className="whitespace-pre-wrap">{shopifyLiquidSnippet}</pre>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400">
                  Paste into Shopify Admin &gt; Themes &gt; Edit Code &gt; Sections
                </span>

                <button
                  onClick={handleCopyLiquid}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  {hasCopiedLiquid ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Copied Snippet!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Liquid Code</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
