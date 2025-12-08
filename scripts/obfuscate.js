const obfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const jsDir = path.join(__dirname, '../build/static/js');

fs.readdir(jsDir, (err, files) => {
    if (err) throw err;

    files.forEach(file => {
        const filePath = path.join(jsDir, file);
        if (path.extname(file) === '.js') {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) throw err;

                const obfuscationResult = obfuscator.obfuscate(data, {
                    compact: true,
                    controlFlowFlattening: false, // Disable this first
                    deadCodeInjection: false, // Disable this first
                    debugProtection: false, // Disable this first
                    disableConsoleOutput: true,
                    identifierNamesGenerator: 'mangled',
                    renameGlobals: false, // Disable this first
                    selfDefending: true,
                    stringArray: true,
                    stringArrayEncoding: ['base64'],
                    stringArrayThreshold: 0.75,
                    unicodeEscapeSequence: true,
                });

                fs.writeFile(filePath, obfuscationResult.getObfuscatedCode(), err => {
                    if (err) throw err;
                    console.log(`Obfuscated ${file}`);
                });
            });
        }
    });
});
