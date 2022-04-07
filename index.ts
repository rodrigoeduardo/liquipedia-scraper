const puppeteer = require('puppeteer');
const fs = require('fs');

type Player = {
  id: number;
  name: String;
  link: String;
  nationality: String;
  photoURL: String;
};

const liquipediaURL = 'https://liquipedia.net/counterstrike/Majors/players';
let players: Player[] = [];
let playerPhoto = '';
let playersPhoto: any[] = [];

(async () => {
  console.log('Starting... 🚀');

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(liquipediaURL);

  const playersName = await page.$$eval(
    '.wikitable > tbody > tr:first-child > th > span:last-child > a',
    (elements: any) => elements.map((element: any) => element.text)
  );

  console.log('✅: Player names found.');

  const playersLink = await page.$$eval(
    '.wikitable > tbody > tr:first-child > th > span:last-child > a',
    (elements: any) => elements.map((element: any) => element.href)
  );

  console.log('✅: Player links found.');

  const playersNationality = await page.$$eval(
    '.wikitable > tbody > tr:first-child > th > span:last-child > .flag > a',
    (elements: any) => elements.map((element: any) => element.title)
  );

  console.log('✅: Player nationalities found.');

  console.log('✅: Starting to get player photos...');

  const page2 = await browser.newPage();

  for (let i = 0; i < playersName.length; i++) {
    await page2.goto(playersLink[i]);

    try {
      playerPhoto = await page2.$eval(
        '.infobox-image > .center > .floatnone > a > img',
        (element: any) => element.src
      );
    } catch (err) {
      console.log('❌: Player photo not found. Player: ' + playersName[i]);
      playerPhoto = '';
    }

    playersPhoto.push(playerPhoto);
  }

  console.log('✅: Player photos found.');

  await browser.close();

  for (let i = 0; i < playersName.length; i++) {
    players.push({
      id: i,
      name: playersName[i],
      link: playersLink[i],
      nationality: playersNationality[i],
      photoURL: playersPhoto[i],
    });
  }

  fs.writeFile(
    './output/players-v02.json',
    JSON.stringify(players, null, 2),
    (err: any) => {
      if (err) throw new Error('❌: Error writing file.');
      console.log('✅: Players file written.');
    }
  );

  console.log('Ending... 🛑');
})();
