const config = require('./config.json').config;

getTime();

function getTime() {
	index = config.findIndex(({ time }) => new Date().getHours < time);

	if (index !== -1) {
		// var millsTillChange = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, config[index].time, 0, 0, 0) - now;
        
	} else {
	}
}
