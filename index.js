const puppeteer = require('puppeteer');
const fs = require('fs');

const serverHandler = require('./server')();

const login = 'the_devero';

var config;

const confExists = fs.existsSync('./config.json');
const systrayConfig = require('./systray-config.json');

var count = 1;

updateConfig();
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

async function createConfig() {
	const http = require('http');
	const fs = require('fs');
	const open = require('open');

	const PORT = 8083;

	fs.readFile('./index.html', function (err, html) {
		if (err) throw err;

		http.createServer(function (req, res) {
			if (req.url === '/') {
				res.writeHeader(200, { 'Content-Type': 'text/html' });
				res.write(html);
				res.end();
			} else if (req.url === '/config') {
				if (req.method === 'GET') {
					res.write(config);
					req.end();
				}
			}
		}).listen(PORT);
	});

	open(`http://localhost:${PORT}`);
}

function updateConfig() {
	config = require('./config').config;
}

function getTime(index) {
	var now = new Date();
	console.log(config);
	var millsTillChange = new Date(now.getFullYear(), now.getMonth(), now.getDate(), config[count].time, 0, 0, 0) - now;
	console.log(millsTillChange);

	console.log(config[count].time);

	// while (millsTillChange <= 0) {
	// 	console.log(`getTime() count: ${count}`);
	// 	if (count > 3) {
	// 		count = 1;
	// 		millsTillChange += 86400000;
	// 		console.log('bruh');
	// 	} else {
	// 		count++;
	// 		millsTillChange = getTime(count);
	// 	}
	// }
	return millsTillChange;
}

function updateHandler(millsTillChange) {
	setTimeout(function () {
		updateBanner(count);
		updateHandler(getTime(count));
	}, millsTillChange);
	// count = count > 2 ? 1 : +1;
}

async function main() {
	var CW;
	try {
		CW = require('node-hide-console-window');
		// CW.hideConsole();
	} catch (e) {
		console.warn(`Can't hide window, missing hide-console-window`);
	}
	const SysTray = require('systray').default;

	const systray = new SysTray(systrayConfig);

	if (confExists) {
		// config = require('./config');
	} else {
		// config = createConfig();
	}

	var toggle = true;

	systray.onClick((action) => {
		if (action.seq_id === 0) {
			try {
				if (toggle) {
					CW.showConsole();
					systray.sendAction({
						type: 'update-item',
						item: {
							...action.item,
							title: 'Hide Console',
							seq_id: action.seq_id,
						},
					});
					toggle = !toggle;
				} else {
					CW.hideConsole();
					systray.sendAction({
						type: 'update-item',
						item: {
							...action.item,
							title: 'Show Console',
							seq_id: action.seq_id,
						},
					});
					toggle = !toggle;
				}
			} catch (e) {
				console.log(`Can't toggle console.`);
			}
		} else if (action.seq_id === 1) {
			process.exit();
		}
	});

	var currentBanner;
	var millsTillChange = getTime(count);

	while (millsTillChange <= 0) {
		if (count > 3) {
			count = 1;
			millsTillChange += 86400000;
		} else {
			count++;
			millsTillChange = getTime(count);
		}
	}

	if (count - 1 === 0) {
		currentBanner = 3;
	} else {
		currentBanner = count - 1;
	}

	console.log(`Count: ${count}`);
	console.log(`Current banner should be ${config[currentBanner].name}`);

	!confExists && updateBanner(currentBanner);

	updateHandler(millsTillChange);
}
