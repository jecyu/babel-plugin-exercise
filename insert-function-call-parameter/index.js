const { transformFileSync } = require('@babel/core');

const insertParameterPlugin = require('./plugins/babel-plugin-parameters-insert');
const path = require('path');

const { code } = transformFileSync(path.join(__dirname, './sourceCode.js'), {
    plugins: [insertParameterPlugin],
    parserOpts: {
        sourceType: 'unambiguous',
        plugins: ['jsx']
    }
});

console.log(code);

