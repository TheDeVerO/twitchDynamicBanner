const puppeteer = require("puppeteer")

updateBanner();

async function updateBanner() {

	const browser = await puppeteer.launch({headless: false, slowMo: 1000, userDataDir: "./user_data"});
	const page = await browser.newPage();
	await page.goto('https://dashboard.twitch.tv/u/the_devero/settings/channel');
	await page.click('div[class="ScTextWrapper-sc-18v7095-1 eKkyLe"]');
	console.log('On needed page.');

	await page.click('button[class="ScCoreButton-sc-1qn4ixc-0 ScCoreButtonSecondary-sc-1qn4ixc-2 ffyxRu kgzEiA"]');
	console.log('Pushed upload button.');

    const [fileChooser] = await Promise.all([
        page.waitForFileChooser(),
		page.click('input[data-a-target="file-picker-input"]')
    ]);
	console.log('Got fileUpload');
	

	await fileChooser.accept(['./images/japan.png']);

	console.log('Accepted.');
	
	console.log('Click!');

}