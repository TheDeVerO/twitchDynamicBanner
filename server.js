const http = require('http');
const fs = require('fs');
const formidable = require('formidable');
const open = require('open');
const config = require('./config1');

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
				const readStream = fs.createReadStream(__dirname + '/config1.json');
				res.writeHead(200, { 'Content-Type': 'application/json' });
				readStream.pipe(res);
			} else if (req.method === 'POST') {
				let data = '';
				req.on('data', (chunk) => {
					data += chunk;
				});
				req.on('end', () => {
					console.log(JSON.parse(data));
					fs.writeFileSync(__dirname + '/config1.json', data);
					res.end();
				});
			}
		} else if (req.url === '/index.css') {
			const readStream = fs.createReadStream(__dirname + '/index.css');
			res.writeHead(200, { 'Content-Type': 'text/css' });
			readStream.pipe(res);
		} else if (req.url === '/fileUpload') {
			console.log('fileupload');
			// const form = new formidable.IncomingForm();
			// form.parse(req, (err, fields, files) => {
			// 	console.log(files);
			// });
			// console.log(req.files);
			let data = '';
			// req.on('data', (chunk) => {
			// 	console.log(chunk);
			// 	data += chunk;
			// });
			req.on('file', file => {
				
			})
			req.on('end', () => {
				fs.writeFileSync(__dirname + `/images/2.png`, JSON.parse(data).file);
			});
			// const file = req.files.file;
			// fs.writeFileSync(__dirname + `/images/${file.name}`);
			// res.json({ fileName: file.name, filePath: `/images/${file.name}` });
			// res.end();
			// console.log(file);
			// req.on('end', () => {});
		}
	}).listen(PORT, () => {
		console.log('Server running on ' + PORT);
	});
});
