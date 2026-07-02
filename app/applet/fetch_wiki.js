import https from 'https';

const pages = [
  'Trouée d\'Arenberg',
  'Muur van Geraardsbergen',
  'Madonna del Ghisallo',
  'Tour of Flanders',
  'Paris-Roubaix',
  'Milan-San Remo',
  'Liège-Bastogne-Liège',
  'Giro di Lombardia',
  'Tour de France',
  'Giro d\'Italia',
  'Vuelta a España',
  'Col du Galibier',
  'Col d\'Izoard',
  'Poggio di San Remo',
  'Oude Kwaremont',
  'Paterberg',
  'Cipressa',
  'Zoncolan',
  'Angliru',
  'Strade Bianche',
  'Amstel Gold Race',
  'La Flèche Wallonne'
];

async function fetchImages() {
  let allImages = [];
  for (const page of pages) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(page)}&prop=images&format=json`;
    const data = await new Promise((resolve) => {
      https.get(url, (res) => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => resolve(JSON.parse(body)));
      });
    });
    
    const pagesData = data.query.pages;
    const pageId = Object.keys(pagesData)[0];
    const images = pagesData[pageId].images;
    
    if (images) {
      for (const img of images.slice(0, 3)) {
        if (!img.title.toLowerCase().endsWith('.jpg')) continue;
        
        const imgUrlData = await new Promise((resolve) => {
          https.get(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(img.title)}&prop=imageinfo&iiprop=url&format=json`, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve(JSON.parse(body)));
          });
        });
        
        const imgPagesData = imgUrlData.query.pages;
        const imgPageId = Object.keys(imgPagesData)[0];
        const url = imgPagesData[imgPageId].imageinfo?.[0]?.url;
        if (url) {
          allImages.push(url);
          console.log(url);
          if (allImages.length >= 25) return;
        }
      }
    }
  }
}

fetchImages();
