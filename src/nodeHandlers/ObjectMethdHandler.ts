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

    let paramsArr = this.path.node.params
      .map((param) => {
        if (param.name) {
          return param.name;
        }
        if (!param.name && param.left) {
          return param.left.name;
        }
        if (!param.name && param.properties) {
          return param.properties.map((node) => node.key.name);
        }
        if (!param.name && param.elements) {
          return param.elements.map((node) => node.name);
        }
        if (param.type === "RestElement") {
          return param.argument.name;
        }
      })
      .flat();
    let paramsStr = paramsArr.join(", ");

    let temp:ExpressionStatement ;

    if (paramsStr) {
      temp = template(`console.info('${funcName}(${paramsStr})',${paramsStr})`)();
    } else {
      temp = template(`console.info('${funcName}')`)();
    }
    // console.log(temp);
    this.path.node.body.body.unshift(temp);
    const text = generate(this.path.node).code;
    console.log(text);
    return {
      name: this.path.node.key.name,
      start: { ...this.path.node.loc.start },
      end: { ...this.path.node.loc.end },
      text:text
    };
  }
}
