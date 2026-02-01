#!/usr/bin/env node
/**
 * PWA Verification Script
 * Checks that all required PWA files exist and are valid
 */

const fs = require('fs');
const path = require('path');

const UI_DIR = path.join(__dirname, '..', 'graceguide-ui');
const PUBLIC_DIR = path.join(UI_DIR, 'public');
const DIST_DIR = path.join(UI_DIR, 'dist');

const requiredIcons = [
  'icon-72x72.svg',
  'icon-96x96.svg',
  'icon-128x128.svg',
  'icon-144x144.svg',
  'icon-152x152.svg',
  'icon-192x192.svg',
  'icon-384x384.svg',
  'icon-512x512.svg'
];

let errors = [];
let warnings = [];

console.log('🔍 PWA Verification Report');
console.log('==========================\n');

// Check manifest.json
console.log('📋 Checking manifest.json...');
const manifestPath = path.join(PUBLIC_DIR, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  errors.push('manifest.json not found in public/');
} else {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const required = ['name', 'short_name', 'start_url', 'display', 'icons'];
    for (const field of required) {
      if (!manifest[field]) {
        errors.push(`manifest.json missing required field: ${field}`);
      }
    }
    if (manifest.icons) {
      console.log(`  ✓ Found ${manifest.icons.length} icons in manifest`);
    }
  } catch (e) {
    errors.push('manifest.json is not valid JSON');
  }
}

// Check service worker
console.log('🔧 Checking service worker...');
const swPath = path.join(PUBLIC_DIR, 'service-worker.js');
if (!fs.existsSync(swPath)) {
  errors.push('service-worker.js not found in public/');
} else {
  const swContent = fs.readFileSync(swPath, 'utf8');
  if (!swContent.includes('fetch')) {
    warnings.push('Service worker may not handle fetch events');
  }
  if (!swContent.includes('install')) {
    warnings.push('Service worker may not handle install event');
  }
  console.log('  ✓ Service worker found');
}

// Check icons
console.log('🎨 Checking icons...');
const iconsDir = path.join(PUBLIC_DIR, 'icons');
if (!fs.existsSync(iconsDir)) {
  errors.push('icons/ directory not found in public/');
} else {
  for (const icon of requiredIcons) {
    const iconPath = path.join(iconsDir, icon);
    if (!fs.existsSync(iconPath)) {
      errors.push(`Missing icon: icons/${icon}`);
    }
  }
  const foundIcons = fs.readdirSync(iconsDir).filter(f => f.endsWith('.svg') || f.endsWith('.png'));
  console.log(`  ✓ Found ${foundIcons.length} icons`);
}

// Check index.html for PWA meta tags
console.log('📄 Checking index.html...');
const indexPath = path.join(UI_DIR, 'index.html');
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  const requiredMeta = [
    { name: 'theme-color', pattern: /theme-color/i },
    { name: 'manifest', pattern: /manifest\.json/i },
    { name: 'apple-mobile-web-app-capable', pattern: /apple-mobile-web-app-capable/i },
    { name: 'viewport', pattern: /viewport/i }
  ];
  
  for (const meta of requiredMeta) {
    if (!meta.pattern.test(indexContent)) {
      warnings.push(`index.html missing recommended meta tag: ${meta.name}`);
    }
  }
  console.log('  ✓ index.html has PWA meta tags');
}

// Check dist folder (if built)
console.log('📦 Checking build output...');
if (fs.existsSync(DIST_DIR)) {
  const manifestInDist = fs.existsSync(path.join(DIST_DIR, 'manifest.json'));
  const swInDist = fs.existsSync(path.join(DIST_DIR, 'service-worker.js'));
  
  if (!manifestInDist) {
    warnings.push('manifest.json not in dist/ (may need to copy public/ files)');
  }
  if (!swInDist) {
    warnings.push('service-worker.js not in dist/ (may need to copy public/ files)');
  }
  
  if (manifestInDist && swInDist) {
    console.log('  ✓ PWA files in dist/');
  }
} else {
  warnings.push('dist/ not found - run npm run build first');
}

// Report
console.log('\n==========================');
console.log('📊 Verification Results');
console.log('==========================');

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All PWA checks passed!');
  process.exit(0);
} else {
  if (errors.length > 0) {
    console.log(`\n❌ Errors (${errors.length}):`);
    errors.forEach(e => console.log(`  • ${e}`));
  }
  if (warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${warnings.length}):`);
    warnings.forEach(w => console.log(`  • ${w}`));
  }
  
  if (errors.length > 0) {
    process.exit(1);
  } else {
    console.log('\n✅ No critical errors, but warnings should be addressed.');
    process.exit(0);
  }
}
