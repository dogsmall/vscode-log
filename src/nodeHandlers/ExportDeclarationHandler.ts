// ExportNamedDeclaration and ExportDefaultDeclaration
import { ExportDeclaration } from "@babel/types";
import { BaseNodeHandler } from "./BaseNodeHandler";
export class ExportDeclarationHandler extends BaseNodeHandler {
  isContain(): Boolean {
    return this._isContain(this.path.parentPath.node, this.index);
  }

  handle() {
    console.log("ExportDeclarationHandler",this.path);
    const funcName = (this.path as any).parentPath.isExportDefaultDeclaration()
    ? ""
    : (this.path as any).parentPath.node.declaration.id.name;

    // const funcName = (this.path as any).parentPath.node.declaration.id.name;
    const paramsTemp = this._paramsToTemp(this.path.node.params);
    let temp = this._tempToAst<ExportDeclaration>(funcName,paramsTemp);
    this.path.node.body.body.unshift(temp);
    const text = this._generate(this.path.node);
    return {
      name: funcName,
      start: { ...(this.path as any).parentPath.node.loc.start },
      end: { ...(this.path as any).parentPath.node.loc.end },
      text:text
    };
  }
}
