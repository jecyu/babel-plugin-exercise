const { transformFileSync } = require('@babel/core');
// const parser = require('@babel/parser');
const fs = require('fs');
const path = require('path');
const cdnPathPlugin = require('./plugin/babel-plugin-static-path-replace');

// 遍历 src 所有 tsx、scss 后缀文件
const config = {
    entry: 'sourceCode',
    tsxFileList: [],
    scssFileList: []
}


function fileFilter(sourcePath) {
    const sourceStandPath = path.resolve(__dirname, sourcePath);
    const fileStat = fs.statSync(sourceStandPath);
    if (fileStat.isDirectory()) {
        fs.readdirSync(sourceStandPath).forEach(file => {
            const fullFilePath = path.join(sourceStandPath, file);
            // 读取文件信息
            const fileStat = fs.statSync(fullFilePath);
            if (fileStat.isFile()) {
                handleFile(fullFilePath);
            } else  {
                // 递归处理
                fileFilter(fullFilePath);
            }
        });
    } else {
        handleFile(sourcePath);
    }
}

function handleFile(filePath) {
    const ext = path.extname(filePath);
    switch(ext) {
        case '.tsx':
        case '.ts':
            config.tsxFileList.push(filePath);
            break;
        case '.scss':
            config.scssFileList.push(filePath);
            break;
        default:
            break;
    }
}

function handleTsx(filePath) {
    // const sourceCode = fs.readFileSync(filePath, {
    //     encoding: 'utf-8'
    // });
    
    // const ast = parser.parse(sourceCode, {
    //     sourceType: 'unambiguous',
    //     plugins: ['jsx', 'typescript'],
    // });

    // 写法一
    // const { code } = transformFromAstSync(ast, sourceCode, {
    //     plugins: [[cdnPathPlugin, {
    //         hostModule: 'global-data'
    //     }]],
    //     // 需要配置，反正会提示读取 preset 错误 [BABEL] unknown: Preset /* your preset */ requires a filename to be set when babel is called directly
    //     configFile: false 
    // });

    // 写法二
    const { code } = transformFileSync(filePath, {
        plugins: [[cdnPathPlugin, {
            hostModule: 'global-data'
        }]],
        parserOpts: {
            sourceType: 'unambiguous',
            plugins: ['jsx', 'typescript']
        },
        configFile: false 
    });
    
    if (code) {
        // fs.writeFile(filePath, code, { encoding: 'utf-8'}, err => {
        //     if (err) return console.log(err);
        //     let log = '更新成功';
        //     log += `文件：${filePath}`;
        //     console.log(log);
        // });
        console.log(code)
    }
}

function handleScss(filePath) {
    fs.readFile(filePath, { encoding: 'utf-8' }, (readErr, content) => {
        if (readErr) return console.log(readErr);
        let log = '读取成功';
        log += `文件：${filePath}`;
        console.log(log);

        // 找到 url()，比如  url('../../../images/order/fragile-bg@2x.png') 
        // 替换为 url(`#{$host}images/order/fragile-bg@2x.png`)
        // console.log('content ->', content);
        const result = content.replace(/url\((\S*)\)/g, (match, s1) => {
            // console.log('match ->', match);
            // console.log('s1 ->', s1);
            if (s1) {
                const path = s1.replace(/(\.\.\/|\.\/)/g, '').replace(/\'|\"/g, '');
                return `url('#{$host}/freight-retail/ossimg/freight-weapp/${path}')`;
            }
            return match;
        })
        // console.log('result ->', result);
        // 重新更新覆盖文件
        fs.writeFile(filePath, result, { encoding: 'utf-8'}, err => {
            if (err) return console.log(err);
            let log = '更新成功';
            log += `文件：${filePath}`;
            console.log(log);
        })
    });
}


function init() {
    fileFilter(config.entry);
    // 处理文件
    config.tsxFileList.forEach(filePath => handleTsx(filePath));
    // config.scssFileList.forEach(filePath => handleScss(filePath));
}


init();