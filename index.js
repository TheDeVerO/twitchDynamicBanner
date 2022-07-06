function updateBanner() {
	const button = document.querySelector(`data-test-selector="upload-video-player__banner"`);
	button.click();

	var upload;

	setTimeout(() => {
		upload = document.querySelector(`data-a-target="file-picker-input"`);
		simulateDrop();
	}, 200);

	upload.ondrop = function (e) {
		this.className = '';
		e.preventDefault();
		readfiles(e.dataTransfer.files);
	};

	function simulateDrop() {
		const fileInput = require('./images/japan.png');
		holder.ondrop({
			dataTransfer: { files: [fileInput] },
			preventDefault: function () {},
		});
	}
}
