import { BaseNodeHandler } from './BaseNodeHandler';
export class ClassMethodsHandler extends BaseNodeHandler{
  isContain(): Boolean {
    return this._isContain(this.path.node, this.index);
  }
  handle () {
    //  TODO ast 转换成文本
    return {
      name: (this.path.node.key).name,
      start: { ...this.path.node.loc!.start },
      end: { ...this.path.node.loc!.end },
      text:''
    };
  }
}
