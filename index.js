const puppeteer = require('puppeteer');

updateBanner();

async function updateBanner() {
	var browser = await puppeteer.launch({ headless: true, userDataDir: './user_data' });
	const page = await browser.newPage();
	page.setDefaultTimeout(0);
	await page.goto('https://dashboard.twitch.tv/u/the_devero/settings/channel');

	const needLogin = await page.evaluate(async () => {
		return document.getElementById('modal-root-header')?.innerHTML === 'Log in to Twitch';
	});

	if (needLogin) {
		browser.close();
		browser = await puppeteer.launch({ headless: false, userDataDir: './user_data' });
		page = await browser.newPage();
		page.setDefaultTimeout(0);
		await page.goto('https://dashboard.twitch.tv/u/the_devero/settings/channel');

		await page.waitForFunction(() => {
			return document.getElementById('modal-root-header')?.innerHTML !== 'Log in to Twitch';
		});
	}

	await page.waitForSelector('a[title="brand"]');

	await page.click('a[title="brand"]');

	console.log('On needed page.');

	await page.waitForSelector('button[data-test-selector="upload-video-player__banner"]');

	await page.click('button[data-test-selector="upload-video-player__banner"]');
	console.log('Pushed upload button.');

	await page.waitForSelector('input[data-a-target="file-picker-input"]');

	const [fileChooser] = await Promise.all([page.waitForFileChooser(), page.click('input[data-a-target="file-picker-input"]')]);
	console.log('Got fileUpload');

	await fileChooser.accept(['./images/japan.png']);

	await new Promise((resolve) => setTimeout(resolve, 10000));
	browser.close();
}
