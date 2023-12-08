import traverse from "@babel/traverse";
import type { NodePath } from "@babel/traverse";
import { FunctionDeclaration } from "@babel/types";
import { parse } from "../parse";
import {
  createNodeFunctionDeclarationHandler,
  createNodeFunctionExpressionHandler,
  createNodeObjectMethodHandler,
  createNodeClassMethodHandler,
} from "../nodeHandlers";

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

/**
 * return function node by index on documentText
 */
export function getFunctionNodeJs(
  index: number,
  code: string
): Node | undefined {
  let node;

  const ast = parse(code);

  traverse(ast, {
    FunctionDeclaration: handleFunctionDeclaration,
    FunctionExpression: hanldeFunctionExpression,
    ArrowFunctionExpression: hanldeFunctionExpression,
    ClassMethod: (path) => {
      console.log("ClassMethod");
      const nodeHandler = createNodeClassMethodHandler(path, index);
      if (nodeHandler?.isContain()) {
        console.log("ClassMethod isContain");
        node = nodeHandler?.handle();
      }
    },
    ObjectMethod: (path) => {
      console.log("ObjectMethod");
      const nodeHandler = createNodeObjectMethodHandler(path, index);
      if (nodeHandler?.isContain()) {
        console.log("ObjectMethod isContain");
        node = nodeHandler?.handle();
      }
    },
  });

  function handleFunctionDeclaration(path: NodePath<FunctionDeclaration>) {
    console.log("handleFunctionDeclaration");
    const nodeHandler = createNodeFunctionDeclarationHandler(path, index);
    if (nodeHandler?.isContain()) {
      console.log("handleFunctionDeclaration isContain");
      node = nodeHandler?.handle();
    }
  }

  function hanldeFunctionExpression(path) {
    console.log("hanldeFunctionExpression");
    const nodeHandler = createNodeFunctionExpressionHandler(path, index);
    if (nodeHandler?.isContain()) {
      console.log("hanldeFunctionExpression isContain");
      node = nodeHandler?.handle();
    }
  }

  return node;
}
