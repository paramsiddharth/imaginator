# Imaginator
An Express middleware that converts image tags to use data URIs instead of image files an HTML document.

## Installation
```
> npm install --save imaginator
```

## Usage
``` javascript
const express = require('express');
const path = require('path');
const imaginator = require('imaginator');

const app = express();

app.use(imaginator(path.join(__dirname, 'public'), 'img.datauri'));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000);
```

**`imaginator(publicDirectory, selector = 'img')`**

- `publicDirectory` : The path to the directory where the hosted public files (including the images) are stored. In most cases, it should be set to `path.join(__dirname, 'public')`.
 - _`selector`_ : The CSS-style selector for the tags to be affected. Its default value is `'img'` i. e. All `img` tags will be affected.

## Example

`index.html` before applying Imaginator:
``` html
<!DOCTYPE html>
<html>
	<head>
		<title>Hi</title>
	</head>
	<body>
		Hello world! <br/>
		<img src='images/image1.png'>
		<img src='images/image2.png'>
		<img class='datauri' src='images/image3.png'>
	</body>
</html>
```

`index.html` after applying Imaginator:
``` html
<!DOCTYPE html>
<html>
	<head>
		<title>Hi</title>
	</head>
	<body>
		Hello world! <br/>
		<img src='images/image1.png'>
		<img src='images/image2.png'>
		<img class='datauri' src='data:image/png;base64,...=='>
	</body>
</html>
```

Made with ❤ by [Param](http://www.paramsid.com).