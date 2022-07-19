const http = require('http');
const fs = require('fs');
const open = require('open');
const config = require('./config1');

const PORT = 8080;

fs.readFile('./index.html', function (err, html) {
	if (err) console.log(err);
	http.createServer(function (req, res) {
		console.log('got a request');
		if (req.url === '/') {
			console.log(`it's a home url`);
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.write(html);

			res.end();
		} else if (req.url === '/config.json') {
			console.log(`it's a config file`);
			if (req.method === 'GET') {
				const readStream = fs.createReadStream(__dirname + '/config1.json');
				res.writeHead(200, { 'Content-Type': 'application/json' });
				readStream.pipe(res);
			} else if (req.method === 'POST') {
				const entry = {};
				// console.log(req.body);
				// entry.time = req.body.time

				let data = '';
				req.on('data', (chunk) => {
					data += chunk;
				});
				req.on('end', () => {
					console.log(JSON.parse(data));
					res.end();
				});
			}
		}
	}).listen(PORT, () => {
		console.log('Server running on ' + PORT);
	});
});
