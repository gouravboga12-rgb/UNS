import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  images: string[];
  price: number;
  discountPrice: number;
  stock: number;
  rating: number;
  specifications: Record<string, string>;
  benefits: string[];
  usageInstructions: string[];
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  reviews: Review[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
}

interface ProductsState {
  items: Product[];
  categories: Category[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "Home Cleaning Products",
    slug: "home-cleaning",
    description: "Highly effective formulations designed to keep your floors, tiles, bathroom, and glass sparkling clean.",
    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "cat-2",
    name: "Kitchen Cleaning Products",
    slug: "kitchen-cleaning",
    description: "Tough on grease and gentle on hands. Specialized dishwashing gels for a spotless and sanitary kitchen.",
    imageUrl: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "cat-3",
    name: "Personal Hygiene Products",
    slug: "personal-hygiene",
    description: "Gentle and moisturizing hand washes that fight germs while keeping your skin soft and hydrated.",
    imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "cat-4",
    name: "Laundry Care Products",
    slug: "laundry-care",
    description: "Advanced dirt-lifting technology in liquid detergents and soaps to keep your clothes looking like new.",
    imageUrl: "https://images.unsplash.com/photo-1610557892470-76d74022fa36?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "cat-5",
    name: "Vehicle Care Products",
    slug: "vehicle-care",
    description: "Premium pH-balanced car wash shampoo for an ultimate high-gloss shine without damaging the paintwork.",
    imageUrl: "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "cat-6",
    name: "Commercial Cleaning Products",
    slug: "commercial-cleaning",
    description: "Industrial strength bulk-sized cleaning chemicals tailored for offices, hotels, hospitals, and factories.",
    imageUrl: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "cat-7",
    name: "Herbal or Skincare Products",
    slug: "herbal-skincare",
    description: "Natural herbal shampoos and organic soaps enriched with active extracts for gentle care.",
    imageUrl: "http://localhost:5000/products/herbal-shampoo.png"
  }
];

const mockProducts: Product[] = [
  {
    id: "prod-1",
    name: "Toilet Cleaner Liquid",
    slug: "toilet-cleaner-liquid",
    category: "Home Cleaning Products",
    shortDescription: "Ultra-thick sanitizing formula that removes stubborn stains and kills 99.9% of germs.",
    fullDescription: "UNS Toilet Cleaner Liquid is formulated with an advanced thick active-gel technology that clings to the toilet bowl surface to provide a thorough, deep cleaning action. Its powerful disinfecting properties kill 99.9% of germs, bacteria, and viruses, leaving your toilet clean, deodorized, and completely hygienic.",
    images: [
      "http://localhost:5000/products/toilet-cleaner.png"
    ],
    price: 120.00,
    discountPrice: 99.00,
    stock: 150,
    rating: 4.8,
    specifications: {
      "Volume": "500ml",
      "Form": "Thick Liquid Gel",
      "Fragrance": "Fresh Lemon & Ocean",
      "Packaging": "Easy Squeeze Bottle with Nozzle"
    },
    benefits: [
      "Kills 99.9% of all disease-causing germs.",
      "Thick formula adheres to vertical surfaces for long-lasting cleaning.",
      "Removes yellow limescale, rust, and stubborn hard-water stains.",
      "Fights unpleasant odors, leaving a fresh citrus fragrance."
    ],
    usageInstructions: [
      "Squeeze the cap and twist counter-clockwise to open.",
      "Apply the liquid under the rim and all around the toilet bowl.",
      "Let the liquid spread and leave it for 15-20 minutes.",
      "Brush lightly to scrub off stubborn stains.",
      "Flush thoroughly for a sparkling clean toilet."
    ],
    featured: true,
    seoTitle: "Best Disinfectant Toilet Cleaner Liquid Online - UNS Cleaning",
    seoDescription: "Buy thick, disinfecting Toilet Cleaner Liquid from UNS Home Cleaning Products. Kills 99.9% germs, removes stubborn yellow stains, and leaves a fresh smell.",
    createdAt: "2026-06-10T12:00:00Z",
    reviews: [
      { id: "rev-1", productId: "prod-1", customerName: "Rajesh Kumar", rating: 5, comment: "Excellent stain remover. The nozzle design is very useful for reaching deep corners.", approved: true, createdAt: "2026-06-11T08:30:00Z" },
      { id: "rev-2", productId: "prod-1", customerName: "Saraswathi Reddy", rating: 4, comment: "Nice product, very thick compared to standard brands. Fresh scent is great.", approved: true, createdAt: "2026-06-11T14:20:00Z" }
    ]
  },
  {
    id: "prod-2",
    name: "Bathroom Cleaner Liquid",
    slug: "bathroom-cleaner-liquid",
    category: "Home Cleaning Products",
    shortDescription: "Multipurpose cleaner for tiles, taps, sinks, and bathroom floors.",
    fullDescription: "UNS Bathroom Cleaner Liquid is a premium heavy-duty bathroom cleaner. It cuts through tough soap scum, hard-water scaling, water marks, and grime on bathroom tiles, sinks, tubs, chrome fixtures, and floors, restoring their original shine and leaving a clean, fresh fragrance.",
    images: [
      "http://localhost:5000/products/bathroom-cleaner.png"
    ],
    price: 110.00,
    discountPrice: 89.00,
    stock: 120,
    rating: 4.6,
    specifications: {
      "Volume": "500ml",
      "Usage": "Tiles, Sinks, Fixtures, Floor",
      "Chemical Type": "Acid-safe sanitizing formula",
      "Fragrance": "Floral Breeze"
    },
    benefits: [
      "Dissolves soap scum, hard water marks, and rust instantly.",
      "Safe to use on ceramic tiles, chrome fittings, and porcelain sinks.",
      "Kills germs and eliminates damp mildew odors.",
      "Restores natural shine to shiny fixtures without scratching."
    ],
    usageInstructions: [
      "For general cleaning, dilute 1 capful in a half bucket of water.",
      "For stubborn stains, apply undiluted liquid directly on the dirty surface.",
      "Leave for 5-10 minutes.",
      "Scrub gently with a soft sponge or scrub pad.",
      "Rinse with clean water."
    ],
    featured: false,
    seoTitle: "Multipurpose Tiles & Bathroom Cleaner Liquid - UNS Cleaning",
    seoDescription: "Order UNS Bathroom Cleaner Liquid online. Perfect for removing tiles stains, soap scum, faucet scaling, and floor grime easily.",
    createdAt: "2026-06-10T12:05:00Z",
    reviews: [
      { id: "rev-3", productId: "prod-2", customerName: "Amit Sharma", rating: 4, comment: "Cleaned my bathroom wall tiles very well. Soap scum was removed in one scrub.", approved: true, createdAt: "2026-06-11T09:45:00Z" }
    ]
  },
  {
    id: "prod-3",
    name: "Floor Cleaner Liquid",
    slug: "floor-cleaner-liquid",
    category: "Home Cleaning Products",
    shortDescription: "Disinfectant surface cleaner that provides 99.9% germ protection and a glossy finish.",
    fullDescription: "UNS Floor Cleaner Liquid is your perfect companion for daily floor hygiene. Safe for marble, granite, mosaic, and ceramic tiles, this formulation removes tough food spills, oil, grease, and dirt, while providing complete disinfection and leaving a long-lasting pleasant fragrance.",
    images: [
      "http://localhost:5000/products/floor-cleaner.png"
    ],
    price: 180.00,
    discountPrice: 149.00,
    stock: 200,
    rating: 4.9,
    specifications: {
      "Volume": "1 Litre",
      "Form": "Concentrated Liquid",
      "Fragrance": "Pine & Jasmine",
      "Suitable Surfaces": "Marble, Tiles, Granite, Wood"
    },
    benefits: [
      "Leaves floors sparkling clean with zero streaks.",
      "Eliminates 99.9% of bacteria and household pathogens.",
      "Non-corrosive formula safe for all luxury flooring materials.",
      "Deodorizes home with a comforting floral fragrance."
    ],
    usageInstructions: [
      "Mix 15ml (one capful) of UNS Floor Cleaner in half a bucket (approx. 4 litres) of water.",
      "Mop the floor gently.",
      "No rinsing is required.",
      "For highly soiled areas, apply directly with a sponge and wipe clean."
    ],
    featured: true,
    seoTitle: "Disinfectant Surface & Floor Cleaner Liquid (1L) - UNS Products",
    seoDescription: "Keep your home hygienic with UNS Floor Cleaner Liquid. Effective on marble and tiles, kills germs, and provides a fresh scent.",
    createdAt: "2026-06-10T12:10:00Z",
    reviews: [
      { id: "rev-4", productId: "prod-3", customerName: "Geeta Patel", rating: 5, comment: "Wonderful pine fragrance! The shine it leaves on marble floors is brilliant.", approved: true, createdAt: "2026-06-11T10:15:00Z" }
    ]
  },
  {
    id: "prod-4",
    name: "Dish Wash Liquid",
    slug: "dish-wash-liquid",
    category: "Kitchen Cleaning Products",
    shortDescription: "Hyper-concentrated degreasing gel that cleans utensils squeaky clean.",
    fullDescription: "UNS Dish Wash Liquid Gel is designed to tackle tough grease and food odors on all types of utensils—from delicate glassware to heavy non-stick cookware. Its advanced pH-balanced, dermatologically tested formula is gentle on hands but ruthless on grease and oils, ensuring clean, fresh, and germ-free kitchenware.",
    images: [
      "http://localhost:5000/products/dish-wash.png"
    ],
    price: 105.00,
    discountPrice: 85.00,
    stock: 180,
    rating: 4.7,
    specifications: {
      "Volume": "500ml",
      "Ingredients": "Natural Lemon extract, active degreasers",
      "pH Level": "Neutral (Gentle on hands)",
      "Container": "Dispenser Bottle"
    },
    benefits: [
      "Cleans a whole sink full of dishes with just one spoonful.",
      "Removes strong food smells like egg, fish, and garlic.",
      "Leaves zero white residue on stainless steel and glass surfaces.",
      "Contains aloe extracts to protect skin from dryness."
    ],
    usageInstructions: [
      "Take 1 teaspoon of UNS Dish Wash Liquid in a small bowl.",
      "Mix with 40-50ml of water.",
      "Dip a scrub sponge into the diluted gel.",
      "Scrub the utensils thoroughly.",
      "Rinse with clean running water."
    ],
    featured: true,
    seoTitle: "Concentrated Dish Wash Liquid Gel - Gentle on Hands - UNS",
    seoDescription: "Buy UNS Dish Wash Liquid Gel with natural lemon extracts. Cuts grease easily, removes odor from utensils, and keeps hands soft.",
    createdAt: "2026-06-10T12:15:00Z",
    reviews: []
  },
  {
    id: "prod-5",
    name: "Hand Wash Liquid",
    slug: "hand-wash-liquid",
    category: "Personal Hygiene Products",
    shortDescription: "Germ-protecting liquid soap enriched with essential oils and moisturizer.",
    fullDescription: "Keep your family safe from infection with UNS Hand Wash Liquid. Featuring a clinically proven germ-defense system combined with natural moisturizers, this liquid hand soap forms a rich lather that lifts dirt and microbes while replenishing skin moisture to prevent dry hands.",
    images: [
      "http://localhost:5000/products/hand-wash.png"
    ],
    price: 90.00,
    discountPrice: 75.00,
    stock: 160,
    rating: 4.8,
    specifications: {
      "Volume": "250ml",
      "Active Defense": "Neem & Tulsi Extracts",
      "Moisturizers": "Glycerine & Vitamin E",
      "Fragrance": "Aqua Refresh"
    },
    benefits: [
      "Fights 99.9% of bacteria and germs in 20 seconds.",
      "Contains no parabens or harsh sulphates.",
      "Specially formulated with skin conditioners for soft hands.",
      "Pleasant aquatic scent keeps you feeling clean and fresh."
    ],
    usageInstructions: [
      "Press the pump to dispense a small amount of hand wash on wet hands.",
      "Rub palms, backs of hands, fingers, and nails thoroughly for 20 seconds.",
      "Rinse off completely with running water.",
      "Dry hands with a clean towel."
    ],
    featured: false,
    seoTitle: "Antibacterial Hand Wash Liquid Soap - UNS Hygiene",
    seoDescription: "Protect hands with UNS moisturizing Hand Wash Liquid. Enriched with neem, tulsi, and vitamin E. Tough on germs, soft on skin.",
    createdAt: "2026-06-10T12:20:00Z",
    reviews: []
  },
  {
    id: "prod-6",
    name: "Glass Cleaner Liquid",
    slug: "glass-cleaner-liquid",
    category: "Home Cleaning Products",
    shortDescription: "Streak-free spray cleaner for glass, mirrors, windscreens, and laminates.",
    fullDescription: "UNS Glass Cleaner Liquid provides professional-grade streak-free clarity on all glass and glossy surfaces. Formulated with fast-evaporating solvents, it lifts finger marks, grease, dust, oil, and insect spots effortlessly, leaving behind a spotless luster and a dust-repellent protective layer.",
    images: [
      "http://localhost:5000/products/glass-cleaner.png"
    ],
    price: 95.00,
    discountPrice: 79.00,
    stock: 140,
    rating: 4.5,
    specifications: {
      "Volume": "500ml",
      "Nozzle": "Dual Action Spray/Stream trigger",
      "Anti-Static": "Yes (Resists dust accumulation)",
      "Applicability": "Windows, Car Windshields, Mirrors, Laptops"
    },
    benefits: [
      "Leaves zero streaks, water marks, or cloudy haze.",
      "Dual action nozzle for broad spray or pinpoint stream.",
      "Anti-static agents prevent dust settling for days.",
      "Extremely safe on tinted car glass and mirror backings."
    ],
    usageInstructions: [
      "Turn nozzle to SPRAY or STREAM position.",
      "Hold bottle 15-20cm away from surface and spray a fine mist.",
      "Wipe clean immediately with a lint-free microfiber cloth or newspaper.",
      "For electronic screens, spray on cloth first, then wipe screen gently."
    ],
    featured: false,
    seoTitle: "Streak-free Glass & Mirror Cleaner Spray - UNS Cleaning",
    seoDescription: "Shop UNS Glass Cleaner Liquid online. Instant streak-free shine for home windows, car glass, tabletops, and TV screens.",
    createdAt: "2026-06-10T12:25:00Z",
    reviews: []
  },
  {
    id: "prod-7",
    name: "Detergent Liquid",
    slug: "detergent-liquid",
    category: "Laundry Care Products",
    shortDescription: "Premium liquid laundry detergent for front-load, top-load, and hand wash.",
    fullDescription: "UNS Detergent Liquid is an advanced low-foaming enzymatic formula designed for high-efficiency washing machines and hand laundering. It penetrates deep into fabric fibres to lift stains, preserve colors, and prevent fabric graying, ensuring your clothes remain bright and smelling fresh.",
    images: [
      "http://localhost:5000/products/detergent-liquid.png"
    ],
    price: 240.00,
    discountPrice: 199.00,
    stock: 220,
    rating: 4.8,
    specifications: {
      "Volume": "1 Litre",
      "Type": "High Efficiency (HE) Liquid",
      "Compatibility": "Front Load, Top Load, and Hand Wash",
      "Fragrance": "Lavender Fields"
    },
    benefits: [
      "Enzymatic dirt-buster targets oil, tea, chocolate, and mud stains.",
      "Color-lock technology prevents fading and dye transfers.",
      "Dissolves fully without leaving powdery white marks on dark fabrics.",
      "Softens fabric fibers and leaves a long-lasting floral smell."
    ],
    usageInstructions: [
      "For regular loads in washing machines, add 60ml of UNS Detergent Liquid to the tray.",
      "For heavily soiled loads, add 90ml.",
      "For hand wash, dilute 40ml in a tub of water, soak clothes for 20 minutes, scrub lightly and rinse."
    ],
    featured: true,
    seoTitle: "Liquid Laundry Detergent for Washing Machines - UNS",
    seoDescription: "Get UNS Detergent Liquid. Enzymatic stain removal, color-protection, and fresh fragrance for all machine types & hand wash.",
    createdAt: "2026-06-10T12:30:00Z",
    reviews: []
  },
  {
    id: "prod-8",
    name: "White Phenyl",
    slug: "white-phenyl",
    category: "Home Cleaning Products",
    shortDescription: "Pine-oil based disinfectant emulsion that keeps insects away and sanitizes floors.",
    fullDescription: "UNS White Phenyl is formulated with high-grade natural pine oil. It acts as an excellent sanitizer, disinfectant, and deodorant for sanitary utilities, drains, floors, and toilet bowls. Its milky white emulsion effectively repels flies, mosquitoes, and ants, keeping your home germ-free.",
    images: [
      "http://localhost:5000/products/white-phenyl.png"
    ],
    price: 80.00,
    discountPrice: 65.00,
    stock: 250,
    rating: 4.4,
    specifications: {
      "Volume": "1 Litre",
      "Base": "Pure Pine Oil",
      "Emulsion Class": "Grade-1 Disinfectant Phenyl",
      "Color": "Milky White (when diluted)"
    },
    benefits: [
      "Natural insect repellent action repels mosquitoes, flies, and ants.",
      "Highly effective in disinfecting bathrooms and wet floors.",
      "Cuts down damp floor odors and establishes a refreshing pine aroma.",
      "Economical daily sanitization for homes, hospitals, and schools."
    ],
    usageInstructions: [
      "Dilute UNS White Phenyl in a 1:50 ratio with clean water (approx. 20ml in a bucket of water).",
      "Mop floors or pour into toilets, drains, and kitchen sinks.",
      "Stir well to form the milky white emulsion before mopping."
    ],
    featured: false,
    seoTitle: "Pine Oil Disinfectant White Phenyl - UNS Cleaning Products",
    seoDescription: "Shop UNS White Phenyl online in India. Formulated with natural pine oil to repel insects, sanitize drains, and clean floors.",
    createdAt: "2026-06-10T12:35:00Z",
    reviews: []
  },
  {
    id: "prod-9",
    name: "Scented Phenyl",
    slug: "scented-phenyl",
    category: "Home Cleaning Products",
    shortDescription: "Perfumed disinfectant floor sanitizer available in Lavender, Rose, and Citrus.",
    fullDescription: "UNS Scented Phenyl blends the heavy-duty disinfecting power of traditional phenyl with the luxury of fine perfumes. It eliminates odors and kills germs on floors and tiled walls, filling your living rooms and offices with long-lasting floral notes.",
    images: [
      "http://localhost:5000/products/scented-phenyl.png"
    ],
    price: 90.00,
    discountPrice: 75.00,
    stock: 200,
    rating: 4.7,
    specifications: {
      "Volume": "1 Litre",
      "Fragrance Options": "Rose, Lavender, Lemon Fresh",
      "Sanitizing Agent": "Phenolic Disinfectant compound"
    },
    benefits: [
      "Combines dual action: high sanitization + premium room freshening.",
      "Leaves zero sticky residue on wooden or vitrified tile surfaces.",
      "Effectively drives away flies and small crawling insects.",
      "Suitable for large corporate offices, banquets, and residential homes."
    ],
    usageInstructions: [
      "Pour 1-2 caps of UNS Scented Phenyl into a bucket of water.",
      "Mop the surface gently.",
      "No rinsing required. Allow the floor to dry naturally to release fragrance."
    ],
    featured: false,
    seoTitle: "Scented Floor Phenyl with Premium Perfume - UNS",
    seoDescription: "Order UNS Scented Phenyl. Available in Rose and Lavender. Kills germs and fills your house or office with a delightful smell.",
    createdAt: "2026-06-10T12:40:00Z",
    reviews: []
  },
  {
    id: "prod-10",
    name: "Air Freshener",
    slug: "air-freshener",
    category: "Home Cleaning Products",
    shortDescription: "Aerosol-free room spray that instantly neutralizes odors and refreshes spaces.",
    fullDescription: "UNS Air Freshener spray uses an eco-conscious water-based room freshener formula. Unlike regular spray cans, it contains no compressed gases or CFCs. Its fine atomizing trigger spray disperses natural aroma oils that molecularly bind to bad odors and neutralize them, rather than just masking them.",
    images: [
      "http://localhost:5000/products/air-freshener.png"
    ],
    price: 150.00,
    discountPrice: 125.00,
    stock: 130,
    rating: 4.6,
    specifications: {
      "Volume": "250ml",
      "Delivery": "Trigger Spray Bottle (Aerosol-Free)",
      "Fragrances": "Sandalwood, Jasmine, Cool Menthol",
      "Safe for Fabrics": "Yes"
    },
    benefits: [
      "100% propellant-free, eco-friendly room spray.",
      "Instantly neutralizes toilet, food, and pet odors.",
      "Long-lasting fragrance stays active for up to 6 hours.",
      "Safe to spray on curtains, upholstery, and carpets."
    ],
    usageInstructions: [
      "Unlock the spray trigger safety latch.",
      "Hold the bottle upright and point towards the center of the room.",
      "Spray 3-4 times in an upward sweeping motion.",
      "Enjoy the refreshing ambiance."
    ],
    featured: false,
    seoTitle: "Propellant-Free Room Air Freshener Spray - UNS",
    seoDescription: "Refresh your spaces with UNS Air Freshener Spray. Propellant-free, water-based room spray that neutralizes odors instantly.",
    createdAt: "2026-06-10T12:45:00Z",
    reviews: []
  },
  {
    id: "prod-11",
    name: "Car Wash Shampoo",
    slug: "car-wash-shampoo",
    category: "Vehicle Care Products",
    shortDescription: "High-foaming shampoo with wax protectant for a showroom shine.",
    fullDescription: "Give your vehicle the care it deserves with UNS Car Wash Shampoo. Our pH-neutral, high-foam formulation cuts through tough road grime, mud, dust, and insects, without stripping existing wax or paint sealants. Enriched with gloss enhancers, it leaves a beautiful streak-free showroom shine.",
    images: [
      "http://localhost:5000/products/car-wash-shampoo.png"
    ],
    price: 160.00,
    discountPrice: 135.00,
    stock: 110,
    rating: 4.8,
    specifications: {
      "Volume": "500ml",
      "Concentration": "1:100 (Highly dilutable)",
      "pH Level": "7.0 (Neutral, paint-safe)",
      "Foam Yield": "Ultra-rich Snow Foam"
    },
    benefits: [
      "Super-slick lubrication prevents micro-scratches or swirl marks during washing.",
      "Contains carnauba wax elements to deposit a protective glossy shine.",
      "Cleans paint, rubber, chrome, and glass surfaces safely.",
      "Streak-free rinsing saves drying time."
    ],
    usageInstructions: [
      "Rinse your car with clean water to remove loose mud.",
      "Mix 10ml of UNS Car Wash Shampoo in a bucket of water (approx. 5 litres) and agitate to create rich suds.",
      "Apply the shampoo wash mitt/sponge starting from the roof down.",
      "Rinse the car thoroughly with clean water.",
      "Wipe dry using a soft microfiber towel."
    ],
    featured: true,
    seoTitle: "Premium Car Wash Shampoo with Wax - UNS Vehicle Care",
    seoDescription: "Get showroom shine with UNS Car Wash Shampoo. High-foaming, pH-neutral paint-safe formula with gloss enhancers.",
    createdAt: "2026-06-10T12:50:00Z",
    reviews: []
  },
  {
    id: "prod-12",
    name: "Detergent Soap",
    slug: "detergent-soap",
    category: "Laundry Care Products",
    shortDescription: "Active clean, gentle on fabric.",
    fullDescription: "UNS Detergent Soap is designed for active clean and gentle fabric care. Its powerful cleaning agents wash away tough stains without harming the fabric fibers, leaving clothes fresh and long-lasting.",
    images: [
      "http://localhost:5000/products/detergent-soap.png"
    ],
    price: 25.00,
    discountPrice: 25.00,
    stock: 400,
    rating: 4.5,
    specifications: {
      "Weight": "150g",
      "Form": "Solid Soap Bar",
      "Usage": "Hand Laundry Spot-treatment",
      "Optical Brightener": "Yes"
    },
    benefits: [
      "Powerful cleaning",
      "Removes tough stains",
      "Gentle on fabric",
      "Fresh fragrance",
      "Value for money"
    ],
    usageInstructions: [
      "Wet the stained garment area with water.",
      "Rub UNS Detergent Soap directly over the dirty patch.",
      "Scrub gently with hand or a laundry brush.",
      "Soak for 5 minutes for tough stains.",
      "Rinse clean with water and dry."
    ],
    featured: false,
    seoTitle: "UNS Detergent Soap Bar - Active Clean - UNS Products",
    seoDescription: "Buy UNS Detergent Soap Bar for manual laundry washing. Active clean, gentle on fabric, with a fresh fragrance at only 25 MRP.",
    createdAt: "2026-06-10T12:55:00Z",
    reviews: []
  },
  {
    id: "prod-15",
    name: "Detergent Powder",
    slug: "detergent-powder",
    category: "Laundry Care Products",
    shortDescription: "High-efficiency stain removing washing powder for laundry.",
    fullDescription: "UNS Detergent Powder is formulated with advanced dirt-blaster technology. It dissolves quickly to remove grease, grass, oil, and food stains from your fabrics while keeping whites bright and colors locked.",
    images: [
      "http://localhost:5000/products/detergent-powder.png"
    ],
    price: 150.00,
    discountPrice: 129.00,
    stock: 100,
    rating: 4.6,
    specifications: {
      "Volume": "1 kg",
      "Form": "Powder",
      "Fragrance": "Active Fresh",
      "Packaging": "Pouch"
    },
    benefits: [
      "Fast dissolution in water for quick action.",
      "Color-protect technology stops fading.",
      "Safe for washing machines and hand laundering."
    ],
    usageInstructions: [
      "Add 1 scoop of UNS Detergent Powder for regular laundry loads.",
      "Add 2 scoops for heavily soiled clothes.",
      "Scrub gently and rinse clean."
    ],
    featured: true,
    seoTitle: "UNS Detergent Washing Powder Online - Laundry Care",
    seoDescription: "Buy UNS Detergent Powder. Advanced stain-remover washing powder for brighter clothes and long-lasting freshness.",
    createdAt: "2026-06-10T13:10:00Z",
    reviews: []
  },

  {
    id: "prod-17",
    name: "Herbal Shampoo",
    slug: "herbal-shampoo",
    category: "Herbal or Skincare Products",
    shortDescription: "Natural hair wash shampoo enriched with Neem, Aloe Vera, and Amla.",
    fullDescription: "UNS Herbal Shampoo is a unique natural blend of traditional Indian herbs including neem, aloe vera, and amla. It nourishes hair roots, reduces dandruff, and promotes strong, shiny, healthy hair growth without any harsh chemicals.",
    images: [
      "http://localhost:5000/products/herbal-shampoo.png"
    ],
    price: 220.00,
    discountPrice: 180.00,
    stock: 120,
    rating: 4.8,
    specifications: {
      "Volume": "250ml",
      "Form": "Liquid",
      "Active Ingredients": "Neem, Aloe Vera, Amla",
      "Fragrance": "Natural Herbal"
    },
    benefits: [
      "Nourishes hair roots and prevents hair fall.",
      "Antibacterial neem cleanses scalp and drives dandruff away.",
      "Aloe vera keeps hair smooth and shiny."
    ],
    usageInstructions: [
      "Wet hair thoroughly with water.",
      "Apply a small amount of UNS Herbal Shampoo and massage into scalp to create lather.",
      "Leave for 1-2 minutes and rinse thoroughly with clean water."
    ],
    featured: true,
    seoTitle: "Natural Antibacterial Herbal Shampoo - UNS Skincare",
    seoDescription: "Buy UNS Herbal Shampoo online. Enriched with neem, aloe vera, and amla for strong, dandruff-free, and shiny hair.",
    createdAt: "2026-06-10T13:20:00Z",
    reviews: []
  },
  {
    id: "prod-18",
    name: "Herbal Soap",
    slug: "herbal-soap",
    category: "Herbal or Skincare Products",
    shortDescription: "Organic bathing bar soap enriched with natural essential oils and green leaf extracts.",
    fullDescription: "UNS Herbal Soap is an organic bathing bar hand-crafted with pure essential oils, tulsi, and aloe vera. It gently cleanses and moisturizes the skin, leaving a refreshing natural scent and providing daily skin protection.",
    images: [
      "http://localhost:5000/products/herbal-soap.png"
    ],
    price: 60.00,
    discountPrice: 49.00,
    stock: 200,
    rating: 4.9,
    specifications: {
      "Weight": "125g",
      "Form": "Solid Bar",
      "Key Extracts": "Tulsi & Aloe Vera",
      "Fragrance": "Natural Basil"
    },
    benefits: [
      "Antibacterial tulsi guards skin against germs.",
      "Aloe vera hydrates skin and retains natural moisture.",
      "100% vegan ingredients and cruelty-free."
    ],
    usageInstructions: [
      "Lather the UNS Herbal Soap bar on wet skin during bath.",
      "Massage gently to cleanse skin.",
      "Rinse off completely with clean water."
    ],
    featured: true,
    seoTitle: "Organic Antibacterial Herbal Bathing Soap - UNS Care",
    seoDescription: "Buy UNS Herbal Soap with tulsi and aloe vera. Gentle, antibacterial bathing bar for moisturized and healthy skin.",
    createdAt: "2026-06-10T13:25:00Z",
    reviews: []
  }
];

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: mockProducts as Product[],
    categories: mockCategories as Category[],
    status: 'succeeded',
  } as ProductsState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
    }
  }
});

export const { setProducts } = productsSlice.actions;
export default productsSlice.reducer;
