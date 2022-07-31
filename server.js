const http = require('http');
const fs = require('fs');
const open = require('open');

const PORT = 8080;

fs.readFile('./index.html', function (err, html) {
	if (err) console.log(err);
	http.createServer(function (req, res) {
		console.log('got a request');
		console.log(req.url);
		if (req.url === '/') {
			console.log(`it's a home url`);
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.write(html);

			res.end();
		} else if (req.url === '/config.json') {
			console.log(`it's a config file`);
			if (req.method === 'GET') {
				if (fs.existsSync(__dirname + '/config.json')) {
					const readStream = fs.createReadStream(__dirname + '/config.json');
					res.writeHead(200, { 'Content-Type': 'application/json' });
					readStream.pipe(res);
				} else {
					res.writeHead(200, { 'Content-Type': 'application/json' });
					res.end(JSON.stringify({}));
				}
			} else if (req.method === 'POST') {
				let data = '';
				req.on('data', (chunk) => {
					data += chunk;
				});
				req.on('end', () => {
					console.log(JSON.parse(data));
					fs.writeFileSync(__dirname + '/config.json', data);
					res.end();
				});
			}
		} else if (req.url === '/index.css') {
			const readStream = fs.createReadStream(__dirname + '/index.css');
			res.writeHead(200, { 'Content-Type': 'text/css' });
			readStream.pipe(res);
		} else if (req.url === '/getfiles') {
			fs.readdir(__dirname + '/images', (err, list) => {
				err && console.log(err);
				// let config;
				// try {
				// 	config = require('./config');
				// } catch (err) {
				// 	config = {};
				// }

				const json = {};
				list.forEach((file) => (json[file] = file));
				// list.forEach((file) => {
				// 	Object.keys(config).find((key) => {
				// 		if (config[key].file === file) {
				// 			json[file] = key;
				// 			return true;
				// 		}
				// 		json[file] = '0';
				// 	});
				// });
				res.writeHead(200, { 'Content-Type': 'application/json' });
				console.log(json);
				res.write(JSON.stringify(json));
				res.end();
			});
		}
	}).listen(PORT, () => {
		console.log('Server running on ' + PORT);
	});
});
