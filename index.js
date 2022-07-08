const puppeteer = require('puppeteer');

updateBanner();

async function updateBanner() {
	// Initial set up.
	// First we are launching puppeteer module and assigning it to the browser variable.
	// Headless means that we do not need browser Graphical User Interface (GUI) to open. So we are operating without so-called 'head'.
	// UserDataDir defines where we will be storing our session data. (This is needed so that the user doesn't have to log in every time').
	var browser = await puppeteer.launch({ headless: false, userDataDir: './user_data' });
	
	// Opening new page in the browser and assigning it to page variable. We will be using page as our starting point.
	var page = await browser.newPage();
	// Setting defaultTimeout to 0, so that we won't be timed out while waiting for user to log in.
	page.setDefaultTimeout(0);
	// Going to a link
	await page.goto(`https://dashboard.twitch.tv/u/${login}/settings/channel`);

	const needLogin = await page.evaluate(async () => {
		return document.getElementById('modal-root-header')?.innerHTML === 'Log in to Twitch';
	});

	if (needLogin) {
		browser.close();
		browser = await puppeteer.launch({ headless: false, userDataDir: './user_data' });
		page = await browser.newPage();
		page.setDefaultTimeout(0);the_devero
		the_devero

		await page.goto(`https://dashboard.twitch.tv/u/${login}/settings/channel`);

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

	if (needAuth) {
		await page.waitForSelector('label[class="ScCheckBoxLabelBase-sc-1wz0osy-2 ScCheckBoxLabel-sc-1qewoje-1 gilgNR iFEPJC tw-checkbox__label"]');
		page.click('label[class="ScCheckBoxLabelBase-sc-1wz0osy-2 ScCheckBoxLabel-sc-1qewoje-1 gilgNR iFEPJC tw-checkbox__label"]');
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
