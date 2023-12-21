import { BaseNodeHandler } from "./BaseNodeHandler";
export class ExportDefaultDeclarationHandler extends BaseNodeHandler {
  isContain(): Boolean {
    return this._isContain(this.path.parentPath.node, this.index);
  }

  handle() {
    console.log("ExportDefaultDeclarationHandler", this.path);
    if(this.path.node.body.type==='StringLiteral'){
      console.log("isStringLiteral",this.path.node.body.value);
      return;
    }
    const funcName = "export default";
    const paramsTemp = this._paramsToTemp(this.path.node.params);
    let temp = this._tempToAst(funcName, paramsTemp);
    if(this.path.node.body.type==='StringLiteral'){

      return;
    }
    this.path.node.body.body.unshift(temp);
    const text = this._generate(this.path.node);
    return {
      name: funcName,
      start: { ...this.path.node.loc.start },
      end: { ...this.path.node.loc.end },
      text:text
    };
  }
}
