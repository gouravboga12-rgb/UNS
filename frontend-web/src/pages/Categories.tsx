import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Sparkles } from 'lucide-react';

export const Categories: React.FC = () => {
  const categories = useSelector((state: RootState) => state.products.categories);
  const navigate = useNavigate();

  const handleCategoryChange = (slug: string) => {
    navigate(`/products?category=${slug}`);
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen flex flex-col justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12" data-aos="fade-up">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-600 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={12} /> Product Explorer
          </span>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-heading">
            Explore UNS Products by Category
          </h1>
          <p className="text-muted text-sm mt-3 leading-relaxed">
            Choose a category from the list to explore our premium formulations designed for commercial, industrial, and household cleanliness.
          </p>
        </div>

        {/* Category List View (matching reference image) */}
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-soft" data-aos="fade-up">
          <div className="flex flex-col space-y-6 md:space-y-8 pl-4 border-l-2 border-slate-200">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className="text-left font-heading font-semibold text-slate-650 hover:text-primary text-xl sm:text-2xl transition-all duration-300 transform hover:translate-x-2 focus:outline-none"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Categories;
