const { transformFromAstAsync } = require('@babel/core');
const parser = require('@babel/parser');
const noFuncAssignLint = require('./plugin/no-func-assign-lint');

const sourceCode = `
    function foo() {
        foo = bar;
    }

    var a = function hello() {
    hello = 123;
    };
`;

const ast = parser.parse(sourceCode, {
    sourceType: 'unambiguous'
});

const { code } = transformFromAstAsync(ast, sourceCode, {
    plugins: [noFuncAssignLint],
});

console.log(code)