import template from "@babel/template";
import generate from "@babel/generator";

interface Node {
  name: string;
  start: {
    line: number;
    column: number;
    index: number;
  };
  end: {
    line: number;
    column: number;
    index: number;
  };
  text: string;
}

interface IBaseNodeHandler {
  handle(): Node | undefined;
  isContain(): Boolean;
}

export class BaseNodeHandler implements IBaseNodeHandler {
  protected path: any;
  protected index: any;
  constructor(path, index) {
    this.path = path;
    this.index = index;
  }

  _isContain(node, index) {
    // 也可以通过 工具类实现
    return index >= node.start && index <= node.end;
  }

  isContain(): Boolean {
    throw new Error("must write isContain");
  }

  handle(): Node | undefined {
    throw new Error("must write handle");
  }
  _template(codeString: String) {
    return template(codeString)();
  }
  _generate(node) {
    return generate(node).code;
  }
  _paramsToTemp(params:Array<any>):string {
    return params
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
    .flat().join(", ");
  }
  _tempToAst<T>(funcName:String,paramsTemp: String):T {
    let temp: T;
    if (paramsTemp) {
      temp = this._template(`console.info('${funcName}(${paramsTemp})',${paramsTemp})`);
    } else {
      temp = this._template(`console.info('${funcName}')`);
    }
    return temp;
  }
}
