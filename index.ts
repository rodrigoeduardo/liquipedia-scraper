const puppeteer = require('puppeteer');
const fs = require('fs');

const liquipediaURL = 'https://liquipedia.net/counterstrike/Majors/players';

type Player = {
  id: number;
  name: String;
  link: String;
  nationality: String;
};

let players: Player[] = [];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(liquipediaURL);

  const playersName = await page.$$eval(
    '.wikitable > tbody > tr:first-child > th > span:last-child > a',
    (elements: any) => elements.map((element: any) => element.text)
  );

  const playersLink = await page.$$eval(
    '.wikitable > tbody > tr:first-child > th > span:last-child > a',
    (elements: any) => elements.map((element: any) => element.href)
  );

  const playersNationality = await page.$$eval(
    '.wikitable > tbody > tr:first-child > th > span:last-child > .flag > a',
    (elements: any) => elements.map((element: any) => element.title)
  );

  await browser.close();

  for (let i = 0; i < playersName.length; i++) {
    players.push({
      id: i,
      name: playersName[i],
      link: playersLink[i],
      nationality: playersNationality[i],
    });
  }

  fs.writeFile(
    './output/players.json',
    JSON.stringify(players, null, 2),
    (err: any) => {
      if (err) throw new Error('Ocorreu algum erro na escrita dos dados.');
      console.log('Os dados foram escritos para o arquivo players.json');
    }
  );
})();
