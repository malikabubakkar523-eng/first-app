const http = require('http');

const endpoints = [
  '/',
  '/shop',
  '/gallery',
  '/manifest.webmanifest',
  '/login',
  '/register',
  '/api/products',
  '/images/veloce-logo.svg',
  '/images/veloce-logo-dark.svg',
  '/images/veloce-logo-icon.svg',
  '/manifest.json',
  '/sw.js',
];

async function checkRoute(path) {
  return new Promise((resolve) => {
    const start = Date.now();
    http.get(`http://localhost:3000${path}`, (res) => {
      const duration = Date.now() - start;
      console.log(`[${res.statusCode}] ${path} (${duration}ms)`);
      resolve(res.statusCode);
    }).on('error', (err) => {
      console.error(`[ERR] ${path}: ${err.message}`);
      resolve(500);
    });
  });
}

async function run() {
  console.log('Testing VELOCE routes...');
  for (const ep of endpoints) {
    await checkRoute(ep);
  }
}

run();
