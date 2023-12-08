import { parse, compileScript } from "@vue/compiler-sfc";
import { getFunctionNodeJs } from "./handleJs";

interface ResuleNode {
  name: string;
  start: {
    line: number;
    column: number;
  };
  end: {
    line: number;
    column: number;
  };
  text:string;
}


export function getFunctionNodeVue(index: number, code: string): ResuleNode[] {
  const { descriptor } = parse(code);

  if (!descriptor.scriptSetup && !descriptor.script) {
    // no write scriptSetup and  no write script
    return [];
  }

  const sfcNode = descriptor.scriptSetup
    ? descriptor.scriptSetup.loc
    : descriptor.script!.loc;

  const { loc } = compileScript(descriptor, {
    id: "delete-function",
  });

  const nodeList = getFunctionNodeJs(
    index - loc.start.offset,
    loc.source
  );

  if (nodeList.length===0) {
    // not found node by index
    return [];
  }

  return nodeList.map((node) => {
      return {
        name: node.name,
        start: {
          line: sfcNode.start.line + (node.start.line - 1),
          column: node.start.column,
        },
        end: {
          line: sfcNode.start.line + (node.end.line - 1),
          column: node.end.column,
        },
        text: node.text,
      };
    });
}
