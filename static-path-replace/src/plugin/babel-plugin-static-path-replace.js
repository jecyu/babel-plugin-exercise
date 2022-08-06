const { declare } = require('@babel/helper-plugin-utils');
const importModule = require('@babel/helper-module-imports');

// 1：判断文件是否有引入静态图片路径，有则进行替换，并标记 state.hasStaticImg 中
// 1.1 import、
// 1.2 require 方式，注意忽略动态绑定的部分
// 第二步：如果 state.hasStaticImg 存在，就判断是否引入 global-data，是否引入 host
const isRelative = path => !/^([a-z]+:)?[\\/]/i.test(path);
const cdnPathPlugin = declare((api, options, dirname) => {
    api.assertVersion(7);
    return {
        visitor: {
            Program: {
                enter(path, state) {
                    path.traverse({
                        // 针对 import 引入的图片替换处理
                        ImportDeclaration(curPath) {
                            const requireModulePath = curPath.get('source').node.value;
                            const specifierPath = curPath.get('specifiers.0');
                            if (specifierPath && specifierPath.isImportDefaultSpecifier()) {
                                if (!isRelative(requireModulePath.toString())) return;
                                const importModulePathList = requireModulePath.toString().split(path.sep); // path.sep 兼容 window 和 mac 的反斜杠
                                const ext = importModulePathList[importModulePathList.length - 1].split('.'); 
                                if (['png', 'jpg', 'jpeg', 'svg'].includes(ext[ext.length - 1])) {
                                    state.hasStaticImg = true;
                                    // 做替换
                                    const imgPath = requireModulePath.replace(/(\.\.\/|\.\/)/g, '').replace(/\'/g, '');
                                    const value = '`' + `\$\{host\}/freight-retail/ossimg/freight-weapp/${imgPath}` + '`';
                                    const declarationAst = api.template.ast(`const ${specifierPath.toString()} = ${value};`);
                                    curPath.replaceWith(declarationAst);
                                }
                            }
                        },
                        // 针对 require 动态引入的图片替换处理
                        CallExpression(curPath) {
                            const { callee, arguments: args } = curPath.node;
                            if (callee.name === 'require') {
                                if (args.length) {
                                    const requireModulePath = args[0].value.toString();
                                    if (!isRelative(requireModulePath)) return;
                                    const importModulePathList = requireModulePath.split(path.sep);
                                    const ext = importModulePathList[importModulePathList.length - 1].split('.'); 
                                    if (['png', 'jpg', 'jpeg', 'svg'].includes(ext[ext.length - 1])) {
                                        state.hasStaticImg = true;
                                        // 做替换
                                        const imgPath = requireModulePath.replace(/(\.\.\/|\.\/)/g, '').replace(/\'/g, '');
                                        const value = '`' + `\$\{host\}/freight-retail/ossimg/freight-weapp/${imgPath}` + '`';
                                        const declarationAst = api.template.ast(`${value}`);
                                        curPath.replaceWith(declarationAst);
                                    }
                                }
                            }
                        }
                    });
                    
                    if (!state.hasStaticImg) return;

                    // 引入 global-data 模块
                    path.traverse({
                        ImportDeclaration(curPath) {
                            const requireModulePath = curPath.get('source').node.value;
                            const importModulePathList = requireModulePath.toString().split('/');
                            const targetModule = importModulePathList[importModulePathList.length - 1];
                            if (targetModule === options.hostModule) {
                                state.globalModuePath = curPath;
                                const specifierPath = curPath.get('specifiers.0');
                                if (specifierPath.isImportDefaultSpecifier()) { 
                                    // import globalData from 'global-data'
                                    state.globalModueId = specifierPath.toString();
                                } else if (specifierPath.isImportSpecifier()){ 
                                    // import { globalData } from 'global-data'
                                    state.globalModueId = specifierPath.toString();
                                } else if (specifierPath.isImportNamespaceSecifier()) { 
                                     // import * as globalData  from 'global-data'
                                    state.globalModueId = specifierPath.get('local').toString();
                                }
                                
                                curPath.stop();
                            }
                        },
                    });
                    if (!state.globalModueId) {
                        state.globalModuePath = importModule.addDefault(path, '@/store/global-data', {
                            nameHint: path.scope.generateUid('globalData')
                        });
                        state.globalModueId = state.globalModuePath.name;
                    }

                    // 判断是否从 globalData 中引入 host
                    path.traverse({
                        VariableDeclarator(curPath) {
                            if (curPath.node.init.name === state.globalModueId) {
                                state.hasDestructureGlobalData = true;
                                // 是否有 host
                                const propertiesPath =  curPath.node.id.properties;
                                const hasHost = propertiesPath.find(property => property.key.name === 'host'); 
                                if (!hasHost) {
                                    curPath.node.id.properties.push( // 追加 host 属性
                                        api.types.objectProperty(
                                            api.types.identifier('host'), 
                                            api.types.identifier('host'),
                                            false,
                                            true
                                        )
                                    );
                                }
                                curPath.stop();
                            }
                        }
                    });

                    // 如果没有引入 globalData，则直接引入 host
                    if (!state.hasDestructureGlobalData) {
                        const ast = api.template.ast(`const { host } = ${state.globalModueId}`);
                        path.node.body.unshift(ast)
                    }
                }
            },
        }
    }
});

module.exports = cdnPathPlugin;