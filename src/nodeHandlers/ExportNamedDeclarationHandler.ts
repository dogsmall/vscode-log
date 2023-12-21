import { BaseNodeHandler } from "./BaseNodeHandler";
export class ExportNamedDeclarationHandler extends BaseNodeHandler {
  isContain(): boolean {
    return this._isContain(
      this.path.parentPath.parentPath.parentPath.node,
      this.index
    );
  }

  handle() {
    console.log("ExportNamedDeclarationHandler", this.path);
    const getName = () => {
      return Object.keys(this.path.parentPath.getBindingIdentifiers())[0];
    };
    const funcName = getName();
    const paramsTemp = this._paramsToTemp(this.path.node.params);
    let temp = this._tempToAst(funcName, paramsTemp);
    if(this.path.node.body.type==='StringLiteral'){

      return;
    }
    this.path.node.body.body.unshift(temp);
    const text = this._generate(this.path.node);

    return {
      name: getName(),
      start: { ...this.path.node.loc.start },
      end: { ...this.path.node.loc.end },
      text:text
    };
  }
}
