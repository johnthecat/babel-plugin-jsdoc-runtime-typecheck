const fs = require('fs');

const FILE_ENCODING = 'utf8';

/**
 * @param {String} src
 * @returns {Promise<Array<String>>}
 */
module.exports.readDirectory = (src) => {
    return new Promise((resolve, reject) => {
        fs.readdir(src, {}, (err, files) => {
            if (err) {
                return reject(`Failed to read data from ${src} -> ${err}`);
            }

            resolve(files);
        });
    });
};

module.exports.readFile = (src) => {
    return new Promise((resolve, reject) => {
        fs.readFile(src, {encoding: FILE_ENCODING}, (err, file) => {
            if (err) {
                return reject(`Failed to read data from ${src} -> ${err}`);
            }

            resolve(file);
        });
    });
};
