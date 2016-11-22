const config = require('./config.json');
const fs = require('fs');
const path = require('path');
const Mocha = require('mocha');

let mocha = new Mocha();

mocha.addFile(config.path.testsInitialization);

addFilesFrom(mocha, config.path.tests);

// Run the tests.
mocha.run((failures) => {
    process.on('exit', () => {
        process.exit(failures);  // exit with non-zero status if there were failures
    });
});

/**
 * @param {Mocha} mocha
 * @param {String} directory
 */
function addFilesFrom(mocha, directory) {
    fs.readdirSync(directory)
        .filter((file) => file.substr(-3) === '.js')
        .forEach((file) => {
            mocha.addFile(
                path.join(directory, file)
            );
        });
}
