import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { LayoutGrid } from 'lucide-react';

interface CategoryConfig {
  displayName: string;
  bgColor: string;
  borderColor: string;
  hoverBgColor: string;
  images: string[];
}

const CATEGORY_MAP: Record<string, CategoryConfig> = {
  'home-cleaning': {
    displayName: 'Home Care',
    bgColor: 'bg-[#FEF9C3]', // Soft yellow
    borderColor: 'border-yellow-200',
    hoverBgColor: 'hover:bg-[#FEF3C7]',
    images: ['/products/floor-cleaner.png'],
  },
  'kitchen-cleaning': {
    displayName: 'Kitchen',
    bgColor: 'bg-[#D1FAE5]', // Soft emerald
    borderColor: 'border-emerald-200',
    hoverBgColor: 'hover:bg-[#A7F3D0]',
    images: ['/products/dish-wash.png'],
  },
  'personal-hygiene': {
    displayName: 'Hygiene',
    bgColor: 'bg-[#F3E8FF]', // Soft purple
    borderColor: 'border-purple-200',
    hoverBgColor: 'hover:bg-[#E9D5FF]',
    images: ['/products/hand-wash.png'],
  },
  'laundry-care': {
    displayName: 'Laundry',
    bgColor: 'bg-[#FCE8E6]', // Soft light red/pink
    borderColor: 'border-red-200',
    hoverBgColor: 'hover:bg-[#FCD5D2]',
    images: ['/products/detergent-liquid.png'],
  },
  'vehicle-care': {
    displayName: 'Vehicle',
    bgColor: 'bg-[#E8F0FE]', // Soft light blue
    borderColor: 'border-blue-200',
    hoverBgColor: 'hover:bg-[#D2E3FC]',
    images: ['/products/car-wash-shampoo.png'],
  },
  'commercial-cleaning': {
    displayName: 'Commercial',
    bgColor: 'bg-[#CCFBF1]', // Soft teal
    borderColor: 'border-teal-200',
    hoverBgColor: 'hover:bg-[#99F6E4]',
    images: ['/products/white-phenyl.png'],
  },
  'herbal-skincare': {
    displayName: 'Herbal',
    bgColor: 'bg-[#FFEDD5]', // Soft orange
    borderColor: 'border-orange-200',
    hoverBgColor: 'hover:bg-[#FED7AA]',
    images: ['/products/herbal-shampoo.png'],
  },
};

const defaultCategoryConfig: CategoryConfig = {
  displayName: '',
  bgColor: 'bg-slate-50',
  borderColor: 'border-slate-200',
  hoverBgColor: 'hover:bg-slate-100',
  images: [],
};

interface CompactCategoriesGridProps {
  selectedCategory: string;
  onCategorySelect: (slug: string) => void;
}

export const CompactCategoriesGrid: React.FC<CompactCategoriesGridProps> = ({
  selectedCategory,
  onCategorySelect,
}) => {
  const categories = useSelector((state: RootState) => state.products.categories);

  return (
    <div className="w-full py-4 px-2 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm">
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 justify-items-center">
        {/* All Products Button */}
        <button
          onClick={() => onCategorySelect('all')}
          className="flex flex-col items-center group focus:outline-none rounded-xl"
        >
          <div
            className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border bg-slate-50 border-slate-200 hover:bg-slate-100 transition-all duration-200 ease-out flex items-center justify-center p-1.5 ${
              selectedCategory === 'all'
                ? 'ring-2 ring-primary ring-offset-2 scale-105 border-primary-light shadow-sm'
                : 'border-slate-100 hover:shadow-sm'
            }`}
          >
            <LayoutGrid className="h-6 w-6 text-primary transition-transform duration-200 group-hover:scale-110" />
          </div>
          <span
            className={`mt-1.5 text-[10px] sm:text-xs font-heading font-semibold text-center tracking-tight leading-tight transition-colors duration-200 line-clamp-1 max-w-[60px] sm:max-w-[70px] ${
              selectedCategory === 'all' ? 'text-primary font-bold' : 'text-slate-650 group-hover:text-primary'
            }`}
          >
            All Products
          </span>
        </button>

        {categories.map((cat) => {
          const config = CATEGORY_MAP[cat.slug] || {
            ...defaultCategoryConfig,
            displayName: cat.name,
          };
          const isSelected = selectedCategory === cat.slug;

          return (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(cat.slug)}
              className="flex flex-col items-center group focus:outline-none rounded-xl"
            >
              {/* Compact Visual Block */}
              <div
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border ${
                  config.bgColor
                } ${config.borderColor} ${config.hoverBgColor} ${
                  isSelected
                    ? 'ring-2 ring-primary ring-offset-2 scale-105 border-primary-light shadow-sm'
                    : 'border-slate-100 hover:shadow-sm'
                } transition-all duration-200 ease-out flex items-center justify-center p-1.5`}
              >
                {config.images.length > 0 ? (
                  <img
                    src={config.images[0]}
                    alt={cat.name}
                    className="h-full w-full object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-110"
                  />
                ) : (
                  <span className="text-[8px] text-muted font-bold text-center leading-none">
                    {cat.name.substring(0, 3)}
                  </span>
                )}
              </div>

              {/* Compact Name */}
              <span
                className={`mt-1.5 text-[10px] sm:text-xs font-heading font-semibold text-center tracking-tight leading-tight transition-colors duration-200 line-clamp-1 max-w-[60px] sm:max-w-[70px] ${
                  isSelected ? 'text-primary font-bold' : 'text-slate-650 group-hover:text-primary'
                }`}
              >
                {config.displayName || cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
