import { FunctionExpression } from "@babel/types";
import { BaseNodeHandler } from "./BaseNodeHandler";
export class FunctionDeclarationHandler extends BaseNodeHandler {
  isContain(): Boolean {
    return this._isContain(this.path.node, this.index);
  }

  handle() {
    console.log("FunctionDeclarationHandler",this.path.node);
    const funcName =  this.path.node.id.loc.identifierName;
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
  let temp: FunctionExpression;
  if (paramsStr) {
    temp = this._template(`console.info('${funcName}(${paramsStr})',${paramsStr})`);
  } else {
    temp = this._template(`console.info('${funcName}')`);
  }

  this.path.node.body.body.unshift(temp);
  const text = this._generate(this.path.node);
    return {
      name: this.path.node.id.loc.identifierName,
      start: { ...this.path.node.loc.start },
      end: { ...this.path.node.loc.end },
      text:text
    };
  }
}
