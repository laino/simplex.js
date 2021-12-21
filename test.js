const Simplex = require('./simplex.js');

s = new Simplex();

s.addLowerConstraint(-10, 0, 1);

s.addUpperConstraint(10, 4, 5);

console.log(s.maximum(5, -3));

/*
s = new Simplex();

const tolerance = 0.001;
const desiredThrust = 0.9;

const xSum = [0, 0, 0];
const ySum = [0, 0, 0];
const zSum = [1, 1, 1];

const xT = [ 0.0 , 0.0 ,  0.0 ];
const yT = [ -0.5, -0.5,  2];
const zT = [ -2.5, 2.5,  0.0 ];

const energyUse = [1, 1, 1];

s.addLowerConstraint(0, 1, 0, 0);
s.addLowerConstraint(0, 0, 1, 0);
s.addLowerConstraint(0, 0, 0, 1);

s.addUpperConstraint(1, 1, 0, 0);
s.addUpperConstraint(1, 0, 1, 0);
s.addUpperConstraint(1, 0, 0, 1);

s.addRangeConstraint(-tolerance, tolerance, ... xSum);
s.addRangeConstraint(-tolerance, tolerance, ... ySum);

s.addRangeConstraint(-tolerance, tolerance, ... xT);
s.addRangeConstraint(-tolerance, tolerance, ... yT);
s.addRangeConstraint(-tolerance, tolerance, ... zT);

s.addLowerConstraint(2, ... zSum);

console.log(s.maximum(... zSum));
*/
