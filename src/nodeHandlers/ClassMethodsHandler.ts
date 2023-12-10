import { BaseNodeHandler } from './BaseNodeHandler';
import { ClassMethod } from '@babel/types';
export class ClassMethodsHandler extends BaseNodeHandler{
  isContain(): Boolean {
    return this._isContain(this.path.node, this.index);
  }
  handle () {
    //  TODO ast 转换成文本
    console.log("ClassMethodsHandler",this.path.node);
    const funcName = (this.path.node.key).name;
    const paramsTemp = this._paramsToTemp(this.path.node.params);
    let temp:ClassMethod ;
    if (paramsTemp) {
      temp = this._template(`console.info('${funcName}(${paramsTemp})',${paramsTemp})`);
    } else {
      temp = this._template(`console.info('${funcName}')`);
    }
    // console.log(temp);
    this.path.node.body.body.unshift(temp);
    const text = this._generate(this.path.node);
    return {
      name: funcName,
      start: { ...this.path.node.loc!.start },
      end: { ...this.path.node.loc!.end },
      text:text
    };
  }
}
