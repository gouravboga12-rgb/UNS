import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { ProductCard } from '../components/ProductCard';
import { LayoutGrid, List, SlidersHorizontal, Search, RotateCcw } from 'lucide-react';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const allProducts = useSelector((state: RootState) => state.products.items);
  const categories = useSelector((state: RootState) => state.products.categories);

  // States
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState((searchParams.get('category') || 'all').replace(/_/g, '-'));
  const [sortBy, setSortBy] = useState('latest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync search parameters from URL
  useEffect(() => {
    const searchVal = searchParams.get('search');
    const catVal = searchParams.get('category');
    if (searchVal !== null) setSearchQuery(searchVal);
    if (catVal !== null) setSelectedCategory(catVal.replace(/_/g, '-'));
  }, [searchParams]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('latest');
    setSearchParams({});
    setShowMobileFilters(false);
  };

  // Filter and Sort Logic
  const filteredProducts = allProducts.filter(product => {
    // 1. Category Filter
    if (selectedCategory !== 'all') {
      const categoryObj = categories.find(c => c.slug === selectedCategory);
      if (categoryObj && product.category !== categoryObj.name) {
        return false;
      }
    }
    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchDesc = product.shortDescription.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    // Latest (default)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Handle category changes and update URL params
  const handleCategoryChange = (catSlug: string) => {
    setSelectedCategory(catSlug);
    const newParams: Record<string, string> = {};
    if (searchQuery) newParams.search = searchQuery;
    if (catSlug !== 'all') newParams.category = catSlug;
    setSearchParams(newParams);
    setShowMobileFilters(false);
  };

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading text-heading">UNS Cleaning Formulations</h1>
          <p className="text-muted text-xs mt-1">Showing {sortedProducts.length} of {allProducts.length} products</p>
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-center gap-2 bg-white border border-border text-heading text-xs font-bold py-3 px-4 rounded-xl shadow-soft hover:bg-slate-50 transition-colors"
          >
            <SlidersHorizontal size={14} className="text-primary" />
            <span>{showMobileFilters ? 'Hide Filters & Search' : 'Show Filters & Search'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* 1. Filters Sidebar */}
          <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block bg-white p-6 rounded-2xl border border-border shadow-soft space-y-6 h-fit lg:sticky lg:top-24`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="font-heading font-bold text-sm text-heading flex items-center gap-2">
                <SlidersHorizontal size={16} /> Filters
              </span>
              <button 
                onClick={handleResetFilters}
                className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Find products..."
                  className="w-full bg-slate-50 border border-border rounded-lg py-2 pl-3 pr-8 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value) {
                      setSearchParams({ search: e.target.value, ...(selectedCategory !== 'all' ? { category: selectedCategory } : {}) });
                    } else {
                      setSearchParams(selectedCategory !== 'all' ? { category: selectedCategory } : {});
                    }
                  }}
                />
                <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" size={14} />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Category</label>
              <div className="flex flex-col space-y-1.5">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`text-left text-xs py-1.5 px-3 rounded-lg font-semibold transition-all ${
                    selectedCategory === 'all' 
                      ? 'bg-primary text-white' 
                      : 'text-body hover:bg-slate-50'
                  }`}
                >
                  All Products
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`text-left text-xs py-1.5 px-3 rounded-lg font-semibold transition-all ${
                      selectedCategory === cat.slug 
                        ? 'bg-primary text-white' 
                        : 'text-body hover:bg-slate-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>


          </div>

          {/* 2. Products Grid */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Top Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-border shadow-soft flex items-center justify-between">
              
              {/* Sorting */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted font-medium">Sort By:</span>
                <select
                  className="bg-slate-50 border border-border rounded-lg text-xs py-1.5 px-2.5 font-semibold text-body focus:outline-none focus:border-primary"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="latest">Latest Arrivals</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

              {/* View toggle */}
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-primary' : 'bg-white text-muted hover:text-primary'}`}
                  title="Grid View"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-primary' : 'bg-white text-muted hover:text-primary'}`}
                  title="List View"
                >
                  <List size={16} />
                </button>
              </div>

            </div>

            {/* Catalog Grid */}
            {sortedProducts.length === 0 ? (
              <div className="bg-white border border-border rounded-2xl p-12 text-center shadow-soft">
                <p className="text-muted text-sm font-semibold">No products matches your search filter.</p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 bg-primary hover:bg-primary-light text-white text-xs font-semibold py-2 px-6 rounded-lg shadow transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                {sortedProducts.map(prod => (
                  <div key={prod.id} className="animate-fadeIn">
                    <ProductCard product={prod} />
                  </div>
                ))}
              </div>
            ) : (
              // List View Mode
              <div className="space-y-4">
                {sortedProducts.map(prod => {
                  const discountPercent = prod.discountPrice && prod.discountPrice < prod.price
                    ? Math.round(((prod.price - prod.discountPrice) / prod.price) * 100)
                    : 0;

                  return (
                    <div 
                      key={prod.id} 
                      className="bg-white rounded-xl border border-border shadow-soft p-4 flex flex-col sm:flex-row gap-5 hover:shadow-soft-lg transition-all animate-fadeIn"
                    >
                      <div className="w-full sm:w-40 aspect-square sm:h-40 rounded-lg overflow-hidden relative flex-shrink-0 bg-slate-50">
                        {discountPercent > 0 && (
                          <span className="absolute top-2 left-2 z-10 bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                            {discountPercent}% OFF
                          </span>
                        )}
                        <img 
                          src={prod.images[0]} 
                          alt={prod.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-primary font-bold uppercase tracking-wider block mb-1">
                            {prod.category}
                          </span>
                          <Link to={`/products/${prod.slug}`}>
                            <h3 className="font-heading font-bold text-base text-heading hover:text-primary transition-colors">
                              {prod.name}
                            </h3>
                          </Link>
                          <p className="text-xs text-muted mt-1.5 leading-relaxed line-clamp-2">
                            {prod.shortDescription}
                          </p>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-primary">₹{prod.discountPrice.toFixed(2)}</span>
                            {prod.discountPrice < prod.price && (
                              <span className="text-xs text-muted line-through">₹{prod.price.toFixed(2)}</span>
                            )}
                          </div>
                          
                          <Link 
                            to={`/products/${prod.slug}`}
                            className="bg-slate-100 hover:bg-primary hover:text-white text-primary text-xs font-bold py-2 px-5 rounded-lg transition-all shadow-sm"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
export default Products;
