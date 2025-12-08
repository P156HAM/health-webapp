const TerserPlugin = require('terser-webpack-plugin');
const JavaScriptObfuscator = require('javascript-obfuscator');

module.exports = {
    mode: 'production',
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
    plugins: [
        new JavaScriptObfuscator({
            rotateStringArray: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.75,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.4,
            debugProtection: true,
            disableConsoleOutput: true,
            identifierNamesGenerator: 'mangled',
            renameGlobals: true,
            selfDefending: true,
            stringArray: true,
            stringArrayEncoding: ['base64'],
            stringArrayThreshold: 0.75,
            unicodeEscapeSequence: true,
        }, ['excluded_bundle_name.js']),
    ],
};
