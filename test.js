const https = require('https');
https.get('https://unsplash.com/s/photos/cycling-race', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const matches = data.match(/images\.unsplash\.com\/photo-[a-zA-Z0-9-]+/g) || [];
    console.log([...new Set(matches)].slice(0, 20).join('\n'));
  });
});
