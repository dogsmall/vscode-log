import { getFunctionNodeJs } from "./handleJs";
import { getFunctionNodeVue } from "./handleVue";

export function getFunctionNode(index: number, code: string, type: string) {
  if (type === "vue") {
    return getFunctionNodeVue(index, code);
  } else {
    return getFunctionNodeJs(index, code);
  }
}
