import { BaseNodeHandler } from "./BaseNodeHandler";
import template from "@babel/template";
import generate from "@babel/generator";
import {  ExpressionStatement } from "@babel/types";

export class ObjectMethodHandler extends BaseNodeHandler {
  isContain(): Boolean {
    return this._isContain(this.path.node, this.index);
  }
  handle() {
    console.log(this.path);

    let funcName = this.path.node.key.name;


    const paramsTemp = this._paramsToTemp(this.path.node.params);
    let temp:ExpressionStatement ;

    if (paramsTemp) {
      temp = template(`console.info('${funcName}(${paramsTemp})',${paramsTemp})`)();
    } else {
      temp = template(`console.info('${funcName}')`)();
    }
    // console.log(temp);
    this.path.node.body.body.unshift(temp);
    const text = generate(this.path.node).code;
    return {
      name: this.path.node.key.name,
      start: { ...this.path.node.loc.start },
      end: { ...this.path.node.loc.end },
      text:text
    };
  }
}
