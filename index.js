const puppeteer = require('puppeteer');

updateBanner();

async function updateBanner() {
	const browser = await puppeteer.launch({ headless: false, userDataDir: './user_data' });
	const page = await browser.newPage();
	await page.goto('https://dashboard.twitch.tv/u/the_devero/settings/channel');

	const needLogin = page.evaluate(async () => {
		document.getElementById('modal-root-header').innerHTML === 'Log in to Twitch' ? true : false;
	});

	if (needLogin) {
		await page.waitForFunction(() => {
			// Waits for user to input username and password storing it in scoped variable.
			// It can't be accessed outside of this module.
			let username = document.getElementById('login-username').value;
			let password = document.getElementById('login-username').value;

			// As a reprecaution - we don't return login values but instead a boolean if they are empty or not.
			// Values aren't stored or sent anywhere and are erased as soon as this function ends.
			return username.length !== 0 && password.length !== 0;
		});
	}

	// await page.click('div[class="ScTextWrapper-sc-18v7095-1 eKkyLe"]');
	console.log('On needed page.');

	await page.click('button[class="ScCoreButton-sc-1qn4ixc-0 ScCoreButtonSecondary-sc-1qn4ixc-2 ffyxRu kgzEiA"]');
	console.log('Pushed upload button.');

	const [fileChooser] = await Promise.all([page.waitForFileChooser(), page.click('input[data-a-target="file-picker-input"]')]);
	console.log('Got fileUpload');

	await fileChooser.accept(['./images/japan.png']);

	console.log('Accepted.');

	console.log('Click!');
}
