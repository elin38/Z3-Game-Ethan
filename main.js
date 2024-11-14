import './style.css';
import { init } from 'z3-solver';

const { Context } = await init();
const { Solver, Int, And, Or, Not, Distinct } = new Context("main");
let solver = new Solver();

const bob = Int.const('bob');
const mary = Int.const('mary');
const cathy = Int.const('cathy');
const sue = Int.const('sue');

const petIndex = [null, "Cat", "Dog", "Bird", "Fish"];

// Function to add text to the #app div
function appendToApp(text) {
    const p = document.createElement('p');
    p.textContent = text;
    document.querySelector('#app').appendChild(p);
}

// Function to format arrays nicely with bullet points
function appendArrayToApp(arrayTitle, array) {
    const container = document.createElement('div');
    const title = document.createElement('p');
    title.textContent = arrayTitle;
    container.appendChild(title);

    const list = document.createElement('ul');
    array.forEach((item) => {
        const listItem = document.createElement('span');
        listItem.textContent = `(x: ${item.x}, y: ${item.y}) `;
        list.appendChild(listItem);
    });
    container.appendChild(list);

    document.querySelector('#app').appendChild(container);
}

// Add constraints for the pet problem
solver.add(
    And(bob.ge(1), bob.le(4)),
    And(mary.ge(1), mary.le(4)),
    And(cathy.ge(1), cathy.le(4)),
    And(sue.ge(1), sue.le(4)),
    bob.eq(2),
    sue.eq(3),
    Not(mary.eq(4)),
    Distinct(bob, mary, cathy, sue)
);

const petCheck = await solver.check();
if (petCheck.toString() === 'sat') {
    const model = solver.model();
    const bobPet = `Bob's pet: ${petIndex[model.eval(bob)]}`;
    const maryPet = `Mary's pet: ${petIndex[model.eval(mary)]}`;
    const cathyPet = `Cathy's pet: ${petIndex[model.eval(cathy)]}`;
    const suePet = `Sue's pet: ${petIndex[model.eval(sue)]}`;
    
    console.log(bobPet);
    console.log(maryPet);
    console.log(cathyPet);
    console.log(suePet);

    appendToApp(bobPet);
    appendToApp(maryPet);
    appendToApp(cathyPet);
    appendToApp(suePet);
} else {
    const noSolutionText = "No solution for the children's problem.";
    console.log(noSolutionText);
    appendToApp(noSolutionText);
}

solver.reset();

async function findAllSolutions(solver, constraint, array) {
    solver.add(constraint);
    while ((await solver.check()).toString() === 'sat') {
        const model = solver.model();
        const xVal = model.eval(x).value();
        const yVal = model.eval(y).value();
        array.push({ x: Number(xVal), y: Number(yVal) });

        solver.add(Or(x.neq(xVal), y.neq(yVal)));
    }
    solver.reset();
}

// Inside Fence
const x = Int.const('x');
const y = Int.const('y');
const insideFenceArray = [];
await findAllSolutions(
    new Solver(),
    And(x.gt(5), x.lt(10), y.gt(15), y.lt(25)),
    insideFenceArray
);
console.log("Inside the fence:", insideFenceArray);
appendArrayToApp("Inside the fence:", insideFenceArray);

// On the Fence
const onFenceArray = [];
await findAllSolutions(
    new Solver(),
    Or(
        And(x.eq(5), y.ge(15), y.le(25)),
        And(x.eq(10), y.ge(15), y.le(25)),
        And(y.eq(15), x.ge(5), x.le(10)),
        And(y.eq(25), x.ge(5), x.le(10))
    ),
    onFenceArray
);
console.log("On the fence:", onFenceArray);
appendArrayToApp("On the fence:", onFenceArray);

// Outside the Fence
const outFenceArray = [];
await findAllSolutions(
    new Solver(),
    And(
      Or(x.lt(5), x.gt(10)),
      Or(y.lt(15), y.gt(25)),
      x.ge(0), x.lt(15),
      y.ge(0), y.lt(30)
    ),
    outFenceArray
);
console.log("Outside the fence:", outFenceArray);
appendArrayToApp("Outside the fence:", outFenceArray);

// document.querySelector('#app').innerHTML += `
//   <div>
//     <p>Check the console for more details.</p>
//   </div>
// `;
