const { declare } = require('@babel/helper-plugin-utils');

// 思路分析
// 处理的目标是 BinaryExpression，当 operator 为 == 或 != 的时候，进行报错并自动修复
// 要排除左右都为字面量且值的类型一样，不需要进行转换 'jecyu' == 'guang'
const EqLint = declare((api, options, dirname) => {
    api.assertVersion(7);
    
    return {
        pre(file) {
            // 把错误信息收集到全局 file 对象中，在 post 阶段去集中打印错误
            // 使用 path.buildCodeFrameError 构造 code frame，标记出当前 node 的位置 
            file.set('errors', []); 
        },
        visitor: {
            BinaryExpression(path, state) {
                const errors = state.file.get('errors');
                if (['==', '!='].includes(path.node.operator)) {
                    const left = path.get('left');
                    const right = path.get('right');
                    // 如果两边都是字面量且值的类型一样
                    if (
                        !(
                            left.isLiteral() && right.isLiteral() &&
                            typeof left.node.value === typeof right.node.value
                        ) 
                    ) {
                        const tmp = Error.stackTraceLimit;
                        Error.stackTraceLimit = 0;
                        errors.push(path.buildCodeFrameError(`please replace ${path.node.operator} with ${path.node.operator + '='}`, Error));
                        Error.stackTraceLimit = tmp;
                        
                        // 自动修复
                        if (state.opts.fix) {
                            path.node.operator = path.node.operator + '=';
                        }
                    }
                }
            }
        },
        post(file) {
            console.log(file.get('errors'));
        }
    }
});

module.exports = EqLint;