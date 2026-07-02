const https = require('https');
const fs = require('fs');

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

async function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  let finalUrls = [];
  
  for (const page of pages) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${page}&prop=images&imlimit=10&format=json`;
    const data = await getJson(url);
    const pagesObj = data.query.pages;
    const pageId = Object.keys(pagesObj)[0];
    const images = pagesObj[pageId].images;
    
    if (images) {
      let fileTitles = images
        .map(i => i.title)
        .filter(title => title.toLowerCase().endsWith('.jpg') || title.toLowerCase().endsWith('.png'))
        .slice(0, 3)
        .map(encodeURIComponent)
        .join('|');
        
      if (fileTitles.length > 0) {
        const infoUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${fileTitles}&prop=imageinfo&iiprop=url&format=json`;
        const infoData = await getJson(infoUrl);
        const infoPages = infoData.query.pages;
        for (const id in infoPages) {
          if (infoPages[id].imageinfo && infoPages[id].imageinfo[0]) {
            let imgUrl = infoPages[id].imageinfo[0].url;
            if (imgUrl.includes('/commons/')) {
              // Convert to thumb
              const thumbUrl = imgUrl.replace('/commons/', '/commons/thumb/') + '/1280px-' + imgUrl.split('/').pop();
              finalUrls.push(thumbUrl);
            }
          }
        }
      }
    }
  }
  
  fs.writeFileSync('urls.txt', finalUrls.slice(0, 25).join('\n'));
}
run();
