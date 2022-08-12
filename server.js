const http = require('http');
const fs = require('fs');
const open = require('open');

const PORT = 8083;

var httpServer;

function createServer() {
	fs.readFile('./nIndex.html', function (err, html) {
		if (err) console.log(err);
		httpServer = http.createServer(function (req, res) {
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

					const json = {};
					list.forEach((file) => (json[file] = file));

					res.writeHead(200, { 'Content-Type': 'application/json' });

					console.log(json);
					res.write(JSON.stringify(json));
					res.end();
				});
			}
		});

		httpServer.listen(PORT, () => {
			console.log('Server running on ' + PORT);
		});
		return httpServer;
	});
}

module.exports = createServer;
