import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const APP_URL = process.env.APP_URL || 'https://www.displaycellpros.com';
const lastMod = new Date().toISOString().split('T')[0];

interface Route {
  path: string;
  priority: string;
  changefreq: string;
}

const routes: Route[] = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/services', priority: '0.8', changefreq: 'monthly' },
  { path: '/b2b', priority: '0.8', changefreq: 'monthly' },
  { path: '/store', priority: '0.7', changefreq: 'weekly' },
  { path: '/privacy', priority: '0.5', changefreq: 'monthly' },
  { path: '/lab', priority: '0.9', changefreq: 'weekly' },
];

const generateSitemap = () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${APP_URL}${route.path}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  const outputPath = path.resolve(process.cwd(), 'public/sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf-8');
  console.log(`✅ Sitemap successfully generated at: ${outputPath}`);
  console.log(`🔗 Base URL: ${APP_URL}`);
};

generateSitemap();
