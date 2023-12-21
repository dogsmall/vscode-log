import { FunctionExpression } from "@babel/types";
import { BaseNodeHandler } from "./BaseNodeHandler";
export class FunctionDeclarationHandler extends BaseNodeHandler {
  isContain(): Boolean {
    return this._isContain(this.path.node, this.index);
  }

  handle() {
    console.log("FunctionDeclarationHandler", this.path.node);
    const funcName = this.path.node.id.loc.identifierName;
    const paramsTemp = this._paramsToTemp(this.path.node.params);
    const temp = this._tempToAst(funcName, paramsTemp);
    if (this.path.node.body.type === "StringLiteral") {
      return;
    }
    this.path.node.body.body.unshift(temp);
    const text = this._generate(this.path.node);
    return {
      name: this.path.node.id.loc.identifierName,
      start: { ...this.path.node.loc.start },
      end: { ...this.path.node.loc.end },
      text: text,
    };
  }
}
