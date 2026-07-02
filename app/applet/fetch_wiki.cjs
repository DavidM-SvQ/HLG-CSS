const https = require('https');

const pages = [
  'Trou%C3%A9e_d%27Arenberg',
  'Muur_van_Geraardsbergen',
  'Madonna_del_Ghisallo',
  'Tour_of_Flanders',
  'Paris%E2%80%93Roubaix',
  'Milan%E2%80%93San_Remo',
  'Li%C3%A8ge%E2%80%93Bastogne%E2%80%93Li%C3%A8ge',
  'Giro_di_Lombardia',
  'Tour_de_France',
  'Giro_d%27Italia',
  'Vuelta_a_Espa%C3%B1a',
  'Col_du_Galibier',
  'Col_d%27Izoard',
  'Poggio_di_San_Remo',
  'Oude_Kwaremont',
  'Paterberg',
  'Cipressa',
  'Zoncolan',
  'Angliru',
  'Strade_Bianche',
  'Amstel_Gold_Race',
  'La_Fl%C3%A8che_Wallonne'
];

async function fetchImages() {
  let allImages = [];
  for (const page of pages) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${page}&prop=images&format=json`;
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
      for (const img of images.slice(0, 5)) {
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
