const puppeteer = require('puppeteer');
const fs = require('fs');

type Player = {
  id: number;
  name: String;
  link: String;
  nationality: String;
  photoURL: String;
  role: String;
  totalWinnings: String;
};

const liquipediaURL = 'https://liquipedia.net/counterstrike/Majors/players';

let players: Player[] = [];

let playerNames = [];

let playerLinks = [];

let playerNationalities = [];

let playerPhoto = '';
let playerPhotos = [];

let temporaryPlayerRole = [];
let playerRole = '';
let playerRoles = [];

let temporaryPlayerTotalWinnings = [];
let playerTotalWinnings = '';
let allPlayersTotalWinnings = [];

(async () => {
  console.log('Starting... 🚀');

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(liquipediaURL);

  playerNames = await page.$$eval(
    '.wikitable > tbody > tr:first-child > th > span:last-child > a',
    (elements: any) => elements.map((element: any) => element.text)
  );

  console.log('✅: Player names found.');

  playerLinks = await page.$$eval(
    '.wikitable > tbody > tr:first-child > th > span:last-child > a',
    (elements: any) => elements.map((element: any) => element.href)
  );

  console.log('✅: Player links found.');

  playerNationalities = await page.$$eval(
    '.wikitable > tbody > tr:first-child > th > span:last-child > .flag > a',
    (elements: any) => elements.map((element: any) => element.title)
  );

  console.log('✅: Player nationalities found.');

  console.log('🔄: Starting to get player photos, roles and total winnings...');

  const page2 = await browser.newPage();

  for (let i = 0; i < playerNames.length; i++) {
    await page2.goto(playerLinks[i]);

    // try to get player photo
    try {
      playerPhoto = await page2.$eval(
        '.infobox-image > .center > .floatnone > a > img',
        (element: any) => element.src
      );
    } catch (err) {
      console.log('❌: Player photo not found. Player: ' + playerNames[i]);
      playerPhoto = '';
    }

    playerPhotos.push(playerPhoto);

    // try to get player role
    try {
      temporaryPlayerRole = await page2.$$eval(
        '.infobox-cell-2 > a',
        (elements: any) =>
          elements.map((element: any) => {
            if (
              [
                'Rifler',
                'AWPer',
                'Coach',
                'Analyst',
                'In-game leader',
              ].includes(element.textContent)
            ) {
              return element.textContent;
            }
          })
      );

      playerRole = temporaryPlayerRole.find(
        (role: string) => typeof role === 'string'
      );
    } catch (err) {
      console.log('❌: Player role not found. Player: ' + playerNames[i]);
      playerRole = '';
    }

    playerRoles.push(playerRole);

    // try to get player total winnings
    try {
      temporaryPlayerTotalWinnings = await page2.$$eval(
        '.infobox-cell-2',
        (elements: any) =>
          elements.map((element: any) => {
            if (element.textContent.includes('$')) {
              return element.textContent;
            }
          })
      );

      playerTotalWinnings = temporaryPlayerTotalWinnings.find(
        (tw: string) => typeof tw === 'string'
      );
    } catch (err) {
      console.log(
        '❌: Player total winnings not found. Player: ' + playerNames[i]
      );
      playerTotalWinnings = '';
    }

    allPlayersTotalWinnings.push(playerTotalWinnings);
  }

  console.log('✅: Finished to get player photos, roles and total winnings.');

  await browser.close();

  for (let i = 0; i < playerNames.length; i++) {
    players.push({
      id: i,
      name: playerNames[i],
      link: playerLinks[i],
      nationality: playerNationalities[i],
      photoURL: playerPhotos[i],
      role: playerRoles[i],
      totalWinnings: allPlayersTotalWinnings[i],
    });
  }

  fs.writeFile(
    './output/players-v03.json',
    JSON.stringify(players, null, 2),
    (err: any) => {
      if (err) throw new Error('❌: Error writing file.');
      console.log('✅: Players file written.');
    }
  );

  console.log('Ending... 🛑');
})();
