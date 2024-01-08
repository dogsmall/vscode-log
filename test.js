function addNum(a, b) {
    // @log-ignore
    console.info('addNum(a, b)', a, b);
    return a + b;
  }
  
  const addNum2 = (a, b) => {
    // @log-ignore
    console.info('addNum2(a, b)', a, b);
    return a + b;
  };
  export default function addNum3(a, b) {
    console.info('(a, b)', a, b);
    return a + b;
  }
  
  export const addNum4 = (a, b) => {
    console.info('addNum4(a, b)', a, b);
    return a + b;
  };
  const addNum5 = function (a, b) {
    console.info('addNum5(a, b)', a, b);
    return a + b;
  };
  
  class Dog {
    getName() {
      console.info('getName');
      return 'name';
    }
  
    setName() {
      console.info('setName');
      return 'name';
    }
  }
  
  export { addNum, addNum2, addNum5, Dog };
  