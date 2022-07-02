const TelegramBot = require('node-telegram-bot-api');
const token = '5422997374:AAHq-2pGQ37tSd4KYQzZBXwO5mNKvBKpnGA';
const puppeteer = require('puppeteer');
const port = process.env.PORT || 8443;
const host = process.env.HOST;
const bot = new TelegramBot(token, { webHook: { port: port, host: host } });

const url = 'https://m.auto.ru/moskva/cars/all/?top_days=1&year_to=2000&price_from=150000&price_to=300000&exclude_catalog_filter=mark%3DVAZ&exclude_catalog_filter=mark%3DGAZ&year_from=1990&sort=cr_date-desc'

let timer = null;
let counter = 0;
let prevArr = [];

bot.onText(/\/start/, (msg) => {
	timer = setInterval(async () => {
		const randomDelay = Math.floor(Math.random() * (5 + 1));
		const currentMinute = new Date().getMinutes();
		console.log('минуты', currentMinute);
		console.log(randomDelay, 'задержка');
		console.log(counter, 'счетчик');
		if ((currentMinute % 10 === (5 - randomDelay) && counter > 4) || counter === 10) {
			console.log('обновление');
			const chatId = msg.chat.id;
			const results = await getLinksFromPage();
			if (prevArr.length === 0) {
				prevArr = [...results];
			} else {
				const newCars = results.filter(i => !prevArr.includes(i));
				console.log(newCars);
				newCars.forEach(el => bot.sendMessage(chatId, el));
				prevArr = [...results];
			}
			// bot.sendMessage(chatId, results[0]);
			counter = 0;
		} else {
			counter++;
		}
	}, 60000)
});

bot.onText(/\/stop/, () => {
	clearInterval(timer);
});

// bot.on('text', async (msg) => {
// 	const chatId = msg.chat.id;
// 	const res = await g();
// 	bot.sendMessage(chatId, res[0]);
// })


const getLinksFromPage = async () => {
	const browser = await puppeteer.launch({
		headless: true, // false: enables one to view the Chrome instance in action
		defaultViewport: null, // (optional) useful only in non-headless mode
	});
	const page = await browser.newPage();
	// await page.setUserAgent(userAgent.toString());
	await page.goto(url, { waitUntil: 'networkidle2' });
	// await page.waitForTimeout(2000);
	// console.log('-----');
	const result = await page.evaluate(() => {
		// return {
		// 	width: document.documentElement.clientWidth,
		// 	height: document.documentElement.clientHeight,
		// 	deviceScaleFactor: window.devicePixelRatio,
		// };
		// return document.querySelector('a').outerHTML;
		return [...document.querySelectorAll('.ListingItemRegular__container > div > .ListingItemRegular > .ListingItemHeader > .ListingItemHeader__left > .ListingItemHeader__title > a')]?.map(el => el.href);
	});
	//IndexInfinityListing__title
	// await page.screenshot({ path: 'example.png' });
	// bot.sendPhoto(chatId, 'example.png');
	await browser.close();

	console.log(result);

	return result;
}

// getLinksFromPage();
