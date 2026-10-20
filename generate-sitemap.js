// Dynamic Sitemap Generator for Histeria Store
// Run this script to generate sitemap.xml with all products and categories
// Usage: node generate-sitemap.js

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const SITE_URL = 'https://hysteria.store';

async function generateSitemap() {
  console.log('🗺️  Generating sitemap...\n');

  // Fetch all active products and categories
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      select: { id: true, updated_at: true },
      orderBy: { updated_at: 'desc' },
    }),
    prisma.category.findMany({
      where: { is_active: true },
      select: { id: true, updated_at: true },
    }),
  ]);

  console.log(`📦 Found ${products.length} products`);
  console.log(`📁 Found ${categories.length} categories\n`);

  // Build sitemap XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  
  <!-- Homepage -->
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${SITE_URL}/?lang=ar" />
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/?lang=en" />
    <xhtml:link rel="alternate" hreflang="he" href="${SITE_URL}/?lang=he" />
  </url>
  
  <!-- Products Listing Page -->
  <url>
    <loc>${SITE_URL}/products</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${SITE_URL}/products?lang=ar" />
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/products?lang=en" />
    <xhtml:link rel="alternate" hreflang="he" href="${SITE_URL}/products?lang=he" />
  </url>
  
  <!-- Wishlist -->
  <url>
    <loc>${SITE_URL}/wishlist</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
  
`;

  // Add all products
  products.forEach((product) => {
    const lastmod = product.updated_at.toISOString().split('T')[0];
    xml += `  <!-- Product: ${product.id} -->
  <url>
    <loc>${SITE_URL}/products/${product.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${SITE_URL}/products/${product.id}?lang=ar" />
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/products/${product.id}?lang=en" />
    <xhtml:link rel="alternate" hreflang="he" href="${SITE_URL}/products/${product.id}?lang=he" />
  </url>
  
`;
  });

  // Add all categories
  categories.forEach((category) => {
    const lastmod = category.updated_at.toISOString().split('T')[0];
    xml += `  <!-- Category: ${category.id} -->
  <url>
    <loc>${SITE_URL}/products?category=${category.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
`;
  });

  xml += `</urlset>`;

  // Write to file
  const outputPath = path.join(__dirname, 'frontend', 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf-8');

  console.log(`✅ Sitemap generated successfully!`);
  console.log(`📍 Location: ${outputPath}`);
  console.log(`🔗 URL: ${SITE_URL}/sitemap.xml\n`);
}

generateSitemap()
  .catch((e) => {
    console.error('❌ Error generating sitemap:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
