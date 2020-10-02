module.exports = function(checkCallback, modifyCallback) {
    return function(req, res, next) {
        let _end = res.end;
        let _write = res.write;
        let checked = false;
        let buffers = [];
        let addBuffer = (chunk, encoding) => {
            if (chunk === undefined) return;
            if (typeof chunk === 'string') {
                chunk = Buffer.from(chunk, encoding);
            }
            buffers.push(chunk);
        };
        res.write = function write(chunk, encoding) {
            if (!checked) {
                checked = true;
                let hook = checkCallback(req, res);
                if (!hook) {
                    res.end = _end;
                    res.write = _write;
                    return res.write(chunk, encoding);
                } else {
                    addBuffer(chunk, encoding);
                }
            } else {
                addBuffer(chunk, encoding);
            }
        };
        res.end = function end(chunk, encoding) {
            if (!checked) {
                checked = true;
                let hook = checkCallback(req, res);
                if (!hook) {
                    res.end = _end;
                    res.write = _write;
                    return res.end(chunk, encoding);
                } else {
                    addBuffer(chunk, encoding);
                }
            } else {
                addBuffer(chunk, encoding);
            }
            let buffer = Buffer.concat(buffers);
            Promise.resolve(modifyCallback(req, res, buffer)).then((result) => {
                if (typeof result === 'string') {
                    result = Buffer.from(result, 'utf-8');
                }
                if (res.getHeader('Content-Length'))
                    res.setHeader('Content-Length', String(result.length));
                res.end = _end;
                res.write = _write;
                res.write(result);
                res.end();
            }).catch((e) => {
                throw new Error('Unable to modify response.');
            });
        };
        next();
    };
}