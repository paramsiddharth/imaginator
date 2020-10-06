const modifyResponse = require('./helper/modify-response');
const path = require('path');
const fs = require('fs');
const mimeTypes = require('mime-types');
const htmlParser = require('node-html-parser').parse;

/**
 * Converts image tags to use data URIs instead of image files an HTML document.
 * @param {String} publicDirectory - The path to the directory where the hosted public files (including the images) are stored. For a static server, the recommended value is path.join(__dirname, 'public').
 * @param {String} [selector='img'] - The CSS-style selector for the image tags to be affected.
 */
function imaginator(publicDirectory, selector = 'img') 
{
	return modifyResponse((req, res) => typeof res.getHeader('Content-Type') == 'string' && res.getHeader('Content-Type').startsWith('text/html'),
		(req, res, body) => {
		let htmlDom = htmlParser(body);
		if (htmlDom.valid) {
			let imgTags = htmlDom.querySelectorAll(selector);
			if (imgTags) {	
				for (let imgTag of imgTags) {
					if (!imgTag.getAttribute('src').startsWith('data:')) {
						let reqPath = req.path;
						while (reqPath[reqPath.length - 1] == '/')
							reqPath = reqPath.substr(0, reqPath.length - 1);
						reqPath = reqPath.substr(0, reqPath.lastIndexOf('/'))
						let data = fs.readFileSync(path.join(publicDirectory, reqPath, imgTag.getAttribute('src')));
						let fileType = mimeTypes.lookup(imgTag.getAttribute('src'));
						fileType = (/\//.test(fileType)) ? fileType : `image/${fileType}`;
						let dataB64 = (Buffer.isBuffer(data)) ? data.toString('base64') : Buffer.from(data).toString('base64');
						let imgB64 = `data:${fileType};base64,${dataB64}`;
						imgTag.setAttribute('src', imgB64);
					}
				}
				return htmlDom.toString();
			}
		}
		return body;
	});
}

module.exports = imaginator;