const calculator = require("./folder/calculator");
console.log(calculator.addition(4, 5));
const { addition, sub } = calculator;
console.log(addition(2, 3));
console.log(sub(2, 3));
/*const func1 = add.add;
const func2 = add.sub;
console.log(func1(2, 3));*/
