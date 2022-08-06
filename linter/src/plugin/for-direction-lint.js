const { declare } = require('@babel/helper-plugin-utils');


// 把错误信息收集到全局 file 对象中，在 post 阶段去集中打印错误
// 使用 path.buildCodeFrameError 构造 code frame，标记出当前 node 的位置 
const forDirectionLint = declare((api, options, dirname) => {
    api.assertVersion(7);
    
    return {
        pre(file) {
            file.set('errors', []);
        },
        visitor: {
            // 检查出遍历方法是否和终止条件的判断一致，也就是说当 update 为 ++ 时，test 应为 <、<=，
            // 当 update  为 -- 时，test 应为 >、>=
            ForStatement(path, state) {
                const errors = state.file.get('errors');
                const updateOperator = path.node.test.operator;
                let shouldUpdateOperator;
                if (['<', '<='].includes(updateOperator)) {
                    shouldUpdateOperator = '++';
                } else if (['>', '>='].includes(updateOperator)) {
                    shouldUpdateOperator = '--';
                }

                if (shouldUpdateOperator !== updateOperator) {
                    const tmp = Error.stackTraceLimit;
                    Error.stackTraceLimit = 0;
                    errors.push(path.get('update').buildCodeFrameError('for direction error', Error));
                    Error.stackTraceLimit = tmp;
                }
            }
        },
        post(file) {
            console.log(file.get('errors'));
        }
    }
});

module.exports = forDirectionLint;