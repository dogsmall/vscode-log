import { BaseNodeHandler } from "./BaseNodeHandler";
import template from "@babel/template";
import generate from "@babel/generator";
import {  ExpressionStatement } from "@babel/types";

export class ObjectMethodHandler extends BaseNodeHandler {
  isContain(): Boolean {
    return this._isContain(this.path.node, this.index);
  }
  handle() {
    console.log("ObjectMethdHandler",this.path);

    const funcName = this.path.node.key.name;
    const paramsTemp = this._paramsToTemp(this.path.node.params);
    const temp = this._tempToAst(funcName,paramsTemp);
    if(this.path.node.body.type==='StringLiteral'){
      return;
    }
    this.path.node.body.body.unshift(temp);
    const text = this._generate(this.path.node);
    return {
      name: this.path.node.key.name,
      start: { ...this.path.node.loc.start },
      end: { ...this.path.node.loc.end },
      text:text
    };
  }
}
