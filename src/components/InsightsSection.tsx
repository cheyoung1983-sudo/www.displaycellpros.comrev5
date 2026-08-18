import React, { useState } from 'react';
import { Search, Clock, ArrowRight, X, BookOpen, Share2 } from 'lucide-react';
import { INSIGHTS_DATA } from '../data/companyData';
import { InsightPost, InsightCategory } from '../types';

interface InsightsSectionProps {
  onOpenContact: () => void;
}

export const InsightsSection: React.FC<InsightsSectionProps> = ({ onOpenContact }) => {
  const [activeCategory, setActiveCategory] = useState<InsightCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<InsightPost | null>(null);

  const categories: { label: string; value: InsightCategory }[] = [
    { label: "All Insights", value: "all" },
    { label: "Micro-Soldering Engineering", value: "technical-micro-soldering" },
    { label: "Tax Engineering & Sec 179", value: "tax-engineering" },
    { label: "Federal & SAM.gov Compliance", value: "federal-compliance" },
    { label: "Operational Strategy", value: "operational-strategy" },
  ];

  const filteredArticles = INSIGHTS_DATA.filter((post) => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="insights" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-xs font-bold text-cyan-300 uppercase tracking-widest">
              Technical Notes & Financial Strategy
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              D&CP Engineering Insights & Briefings
            </h2>
            <p className="text-slate-400 text-base">
              Original analysis on micro-soldering unit economics, OBBBA tax depreciation, and SAM.gov federal contracting.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search technical notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === cat.value
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="group cursor-pointer rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Image */}
                <div className="h-48 w-full overflow-hidden relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-mono text-cyan-400 border border-slate-800 uppercase">
                    {article.category.replace('-', ' ')}
                  </div>
                </div>

                <div className="px-5 space-y-2">
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>{article.date}</span> • <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              {/* Author & Read Action */}
              <div className="p-5 mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div className="text-[11px]">
                    <div className="font-semibold text-slate-200">{article.author.name}</div>
                    <div className="text-[9px] text-slate-400">{article.author.role}</div>
                  </div>
                </div>

                <span className="text-xs font-bold text-cyan-400 group-hover:underline flex items-center gap-1">
                  Read <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs font-mono text-cyan-400">
                <span>{selectedArticle.category.toUpperCase()}</span> • <span>{selectedArticle.date}</span> • <span>{selectedArticle.readTime}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                {selectedArticle.title}
              </h3>

              <div className="flex items-center gap-3 pt-2">
                <img
                  src={selectedArticle.author.avatar}
                  alt={selectedArticle.author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-sm font-semibold text-white">{selectedArticle.author.name}</div>
                  <div className="text-xs text-slate-400">{selectedArticle.author.role}</div>
                </div>
              </div>
            </div>

            <div className="h-64 w-full rounded-xl overflow-hidden">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line space-y-4 font-sans">
              {selectedArticle.content}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800">
              {selectedArticle.tags.map((tag, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded text-[11px] font-mono bg-slate-950 text-cyan-400 border border-slate-800">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-800">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedArticle(null);
                  onOpenContact();
                }}
                className="px-5 py-2.5 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
              >
                Discuss Technical Notes
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
