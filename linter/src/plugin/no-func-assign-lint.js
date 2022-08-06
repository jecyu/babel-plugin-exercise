const { declare } = require('@babel/helper-plugin-utils');

// 思路分析
// 赋值表达式 AssignmentExpression，要判断 left 属性是否引用的是一个函数
const noFuncAssignLint = declare((api, options, dirname) => {
    api.assertVersion(7);
    
    return {
        pre(file) {
            // 把错误信息收集到全局 file 对象中，在 post 阶段去集中打印错误
            // 使用 path.buildCodeFrameError 构造 code frame，标记出当前 node 的位置 
            file.set('errors', []); 
        },
        visitor: {
            AssignmentExpression(path, state) {
                const errors = state.file.get('errors');

                const assignTarget = path.get('left').toString();
                const binding = path.scope.getBinding(assignTarget); // 获取变量的引用
                if (binding) {
                    // 查找到了左值对应的声明，是函数声明
                    if (binding.path.isFunctionDeclaration() || binding.path.isFunctionExpression()) {
                        const tmp = Error.stackTraceLimit;
                        Error.stackTraceLimit = 0;
                        errors.push(path.buildCodeFrameError('can not reassign to function', Error));
                        Error.stackTraceLimit = tmp;
                    }
                }
            }
        },
        post(file) {
            console.log(file.get('errors'));
        }
    }
});

module.exports = noFuncAssignLint;