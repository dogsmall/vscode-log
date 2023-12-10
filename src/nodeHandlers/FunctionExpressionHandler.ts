import { BaseNodeHandler } from "./BaseNodeHandler";
export class FunctionExpressionHandler extends BaseNodeHandler {
  isContain(): Boolean {
    return this._isContain(this.path.parentPath.parentPath.node, this.index);
  }
  handle() {
    console.log("FunctionExpressionHandler",this.path.node);

    const funcName = this.path.parentPath.node.id.name;
    console.log("funcName",funcName);
    const paramsTemp = this._paramsToTemp(this.path.node.params);
    let temp = this._tempToAst(funcName,paramsTemp);

    if(this.path.node.body.type==='StringLiteral'){
      console.log("isStringLiteral",this.path.node.body.value);
      return
    }else{
      this.path.node.body.body.unshift(temp);
      const text = this._generate(this.path.node);
      return {
        name: funcName,
        start: { ...this.path.parentPath.parentPath.node.loc.start },
        end: { ...this.path.parentPath.parentPath.node.loc.end },
        text:text
      };
    }

  }
}
