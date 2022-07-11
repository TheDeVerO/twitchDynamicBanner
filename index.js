const puppeteer = require('puppeteer');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const config = {
	1: {
		time: '7',
		file: '1.png',
		name: 'Morning',
	},
	2: {
		time: '13',
		file: '2.png',
		name: 'Afternoon',
	},
	3: {
		time: '18',
		file: '3.png',
		name: 'Evening',
	},
};

var count = 1;

main();

async function updateBanner(index) {
	// Initial set up.
	var browser = await puppeteer.launch({ headless: true, userDataDir: './user_data' });
	var page = await browser.newPage();
	page.setDefaultTimeout(0); // Setting defaultTimeout to 0, so that we won't be timed out while waiting for user to log in.
	await page.goto(`https://dashboard.twitch.tv/u/${login}/settings/channel`);

	// Checking if user needs to log in to access that page.
	const needLogin = await page.evaluate(async () => {
		return document.getElementById('modal-root-header')?.innerHTML === 'Log in to Twitch';
	});

	if (needLogin) {
		// Reopening browser with GUI so that user can type in login info.
		browser.close();
		browser = await puppeteer.launch({ headless: false, userDataDir: './user_data' });
		page = await browser.newPage();
		page.setDefaultTimeout(0);
		await page.goto(`https://dashboard.twitch.tv/u/${login}/settings/channel`);

		// Waiting for user to log in.
		await page.waitForFunction(() => {
			return document.getElementById('modal-root-header')?.innerHTML !== 'Log in to Twitch';
		});
	}

	// Checking if user has to complete a 2FA login.
	const needAuth = await page.evaluate(() => {
		return (
			document.querySelector('span[class="CoreText-sc-cpl358-0 bDGnvG"]')?.innerHTML ===
			'Enter the code found in your authenticator app, or you can request the code via SMS.'
		);
	});

	if (needAuth) {
		// Clicking the 'Remeber this pc for 30 days' checkbox
		await page.waitForSelector('label[class="ScCheckBoxLabelBase-sc-1wz0osy-2 ScCheckBoxLabel-sc-1qewoje-1 gilgNR iFEPJC tw-checkbox__label"]');
		page.click('label[class="ScCheckBoxLabelBase-sc-1wz0osy-2 ScCheckBoxLabel-sc-1qewoje-1 gilgNR iFEPJC tw-checkbox__label"]');

		// Waiting for user to complete 2FA.
		await page.waitForFunction(() => {
			return (
				document.querySelector('span[class="CoreText-sc-cpl358-0 bDGnvG"]')?.innerHTML !==
				'Enter the code found in your authenticator app, or you can request the code via SMS.'
			);
		});
	}
	console.log('On channel settings page.');

	// Moving to the "Brand" tab.
	await page.waitForSelector('a[title="brand"]');
	await page.click('a[title="brand"]');
	console.log('Pressed Brand button.');

	// Pressing the Upload button.
	await page.waitForSelector('button[data-test-selector="upload-video-player__banner"]');
	await page.click('button[data-test-selector="upload-video-player__banner"]');
	console.log('Pressed Upload button.');

	// Geting the opened file upload window.
	await page.waitForSelector('input[data-a-target="file-picker-input"]');
	const [fileChooser] = await Promise.all([page.waitForFileChooser(), page.click('input[data-a-target="file-picker-input"]')]);
	console.log('Got fileUpload');

	// Uploading the file.
	await fileChooser.accept([`./images/${config[index].file}`]);

	// Waiting for 10 seconds for upload to complete.
	await page.waitForTimeout(10000);

	// Closing the browser to prevent memory leaks.
	browser.close();
}

// async function createConfig() {
// 	const http = require('http');
// 	const fs = require('fs');
// 	const open = require('open');

// 	const PORT = 8080;

// 	fs.readFile('./index.html', function (err, html) {
// 		if (err) throw err;

// 		http.createServer(function (request, response) {
// 			response.writeHeader(200, { 'Content-Type': 'text/html' });
// 			response.write(html);
// 			response.end();
// 		}).listen(PORT);
// 	});

// 	open('http://localhost:8080');

// 	// const newConfig = {};

// 	// rl.question('Twitch Login:', (answer) => {
// 	// 	newConfig.login = answer;
// 	// });
// 	// rl.question();

// 	// fs.writeFileSync('./config.json', JSON.stringify(newConfig));
// }

function getTime(count) {
	console.log(`Counter: ${count}`);
	var now = new Date();
	var millsTillChange = new Date(now.getFullYear(), now.getMonth(), now.getDate(), config[count].time, 0, 0, 0) - now;

	while (millsTillChange <= 0) {
		if (count > 2) {
			console.log(count);
			count = 1;
			millsTillChange += 86400000;
		} else {
			console.log(count);
			count++;
			millsTillChange = getTime(count);
		}
	}
	return millsTillChange;
}

function updateHandler(millsTillChange) {
	setTimeout(function () {
		updateBanner(count);
		updateHandler(count, getTime(count));
	}, millsTillChange);
	// count = count > 2 ? 1 : +1;
}

async function main() {
	var currentBanner;
	if (!config || config === {}) {
		config = createConfig();
	}

	var millsTillChange = getTime(count);

	if (count - 1 === 0) {
		currentBanner = 3;
	} else {
		currentBanner = count - 1;
	}

	console.log(`Current banner should be ${config[currentBanner].name}`);

	updateHandler(millsTillChange);
}
