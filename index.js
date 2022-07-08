const puppeteer = require('puppeteer');

updateBanner();

async function updateBanner() {
	var browser = await puppeteer.launch({ headless: false, userDataDir: './user_data' });
	var page = await browser.newPage();
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

	const needAuth = await page.evaluate(() => {
		return (
			document.querySelector('span[class="CoreText-sc-cpl358-0 bDGnvG"]')?.innerHTML ===
			'Enter the code found in your authenticator app, or you can request the code via SMS.'
		);
	});

	console.log(needAuth);

	if (needAuth) {
		await page.waitForSelector('label[class="ScCheckBoxLabelBase-sc-1wz0osy-2 ScCheckBoxLabel-sc-1qewoje-1 gilgNR iFEPJC tw-checkbox__label"]');
		page.click('label[class="ScCheckBoxLabelBase-sc-1wz0osy-2 ScCheckBoxLabel-sc-1qewoje-1 gilgNR iFEPJC tw-checkbox__label"]');
		// page.click('input[type="checkbox"]');
		console.log('click');
		await page.waitForFunction(() => {
			return (
				document.querySelector('span[class="CoreText-sc-cpl358-0 bDGnvG"]')?.innerHTML !==
				'Enter the code found in your authenticator app, or you can request the code via SMS.'
			);
		});
	}
	console.log('On channel settings page.');

	await page.waitForSelector('a[title="brand"]');

	await page.click('a[title="brand"]');
	console.log('Pressed Brand button.');

	await page.waitForSelector('button[data-test-selector="upload-video-player__banner"]');

	await page.click('button[data-test-selector="upload-video-player__banner"]');
	console.log('Pressed Upload button.');

	await page.waitForSelector('input[data-a-target="file-picker-input"]');

	const [fileChooser] = await Promise.all([page.waitForFileChooser(), page.click('input[data-a-target="file-picker-input"]')]);
	console.log('Got fileUpload');

	await fileChooser.accept(['./images/japan.png']);

	// await new Promise((resolve) => setTimeout(resolve, 10000));
	await page.waitForTimeout(10000);

	browser.close();
}
