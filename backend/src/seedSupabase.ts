import { createClient } from '@supabase/supabase-js';
import { mockCategories, mockProducts } from './mockData';

const supabaseUrl = 'https://mzhrpafgsevjyifduncz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aHJwYWZnc2V2anlpZmR1bmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjM4MjMsImV4cCI6MjA5NzA5OTgyM30.JnCJudrbA9ZiD8Jdi6PTj6oCHBX4qhnuw6yNulzOP8E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Starting seed...');

  // 1. Seed Categories
  console.log('Seeding categories...');
  for (const cat of mockCategories) {
    const { error } = await supabase.from('categories').upsert({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      imageUrl: cat.imageUrl
    });
    if (error) {
      console.error(`Error inserting category ${cat.name}:`, error.message);
    } else {
      console.log(`Inserted category: ${cat.name}`);
    }
  }

  // 2. Seed Products
  console.log('Seeding products...');
  for (const prod of mockProducts) {
    // Separate reviews out since they go in reviews table
    const { reviews, ...prodData } = prod;
    
    const { error } = await supabase.from('products').upsert({
      id: prodData.id,
      name: prodData.name,
      slug: prodData.slug,
      category: prodData.category,
      shortDescription: prodData.shortDescription,
      fullDescription: prodData.fullDescription,
      images: prodData.images,
      price: prodData.price,
      discountPrice: prodData.discountPrice,
      stock: prodData.stock,
      rating: prodData.rating,
      specifications: prodData.specifications,
      benefits: prodData.benefits,
      usageInstructions: prodData.usageInstructions,
      featured: prodData.featured,
      seoTitle: prodData.seoTitle,
      seoDescription: prodData.seoDescription,
      createdAt: prodData.createdAt
    });

    if (error) {
      console.error(`Error inserting product ${prodData.name}:`, error.message);
    } else {
      console.log(`Inserted product: ${prodData.name}`);
      
      // Seed product reviews if any
      if (reviews && reviews.length) {
        console.log(`Seeding ${reviews.length} reviews for ${prodData.name}...`);
        for (const rev of reviews) {
          const { error: revErr } = await supabase.from('reviews').upsert({
            id: rev.id,
            productId: rev.productId,
            customerName: rev.customerName,
            rating: rev.rating,
            comment: rev.comment,
            approved: rev.approved,
            createdAt: rev.createdAt
          });
          if (revErr) {
            console.error(`Error inserting review for ${prodData.name}:`, revErr.message);
          }
        }
      }
    }
  }

  console.log('Seeding completed!');
}

seed();
