import { describe, it, expect } from "vitest";
import { getFunctionNodeJs } from "../handlers/handleJs";
describe.skip("handle ts", () => {
  it("should delete function at index Position", () => {
    let index = 20;

    const code = `
    function getName ():string {
        return 'name'
    }
    `;

    const node = getFunctionNodeJs(index, code);
    console.log(node);
    // expect(node).toEqual({
    //   name: "getName",
    //   start: {
    //     line: 2,
    //     column: 4,
    //     index: 5,
    //   },
    //   end: {
    //     line: 4,
    //     column: 5,
    //     index: 61,
    //   },
    // });
  });
});
