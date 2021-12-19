const Simplex = require('./simplex.js');

/*

//http://www.maths.qmul.ac.uk/~ffischer/teaching/opt/notes/notes8.pdf

const s = new Simplex();

s.addLowerConstraint(1, 1, 1);
s.addLowerConstraint(1, 2, -1);
s.addUpperConstraint(2, 0, 3);

console.log(s.minimum(6, 3));


const s = new Simplex();

s.addLowerConstraint(3, 3, -1, -1);
s.addLowerConstraint(2, 1, -1,  1);

console.log(s.minimum(7.5, -3, 0)); // [ 1.25, 0, 0.75 ], min: 9.375


const s2 = new Simplex();

s2.addEqualConstraint(2, -2, 1, 3);
s2.addEqualConstraint(1, 2, 3, 4);

console.log(s2.minimum(1, -2, -3)); // no solution

const s3 = new Simplex();

s3.addEqualConstraint(3, 3, 1);
s3.addLowerConstraint(6, 4, 3);
s3.addUpperConstraint(4, 1, 2);

console.log(s3.minimum(4, 1)); // [ 0.4, 1.8 ], min: 3.4

const s4 = new Simplex();

s4.addUpperConstraint(8, 1, 4);
s4.addUpperConstraint(4, 1, 2);

console.log(s4.maximum(3, 9)); // Degenerate, [0, 2], max: 18

*/
const s = new Simplex();

const desiredThrust = 0.99;

const tolerance = 0.001;

const xSum = [0, 0, 0];
const ySum = [0, 0, 0];
const zSum = [1, 1, 1];

const xT = [ 0.0 , 0.0 ,  0.0 ];
const yT = [ 0.45, 0.45, -2.05];
const zT = [-2.5 , 2.5 ,  0.0 ];

const energy = [1, 1, 1];

s.addLowerConstraint(0, 1, 0, 0);
s.addLowerConstraint(0, 0, 1, 0);
s.addLowerConstraint(0, 0, 0, 1);

s.addUpperConstraint(1, 1, 0, 0);
s.addUpperConstraint(1, 0, 1, 0);
s.addUpperConstraint(1, 0, 0, 1);

s.addEqualConstraint(0, ... xT);
s.addEqualConstraint(0, ... yT);
s.addEqualConstraint(0, ... zT);

console.log(s.maximum(... zSum));

s.addLowerConstraint(s.maximum(... zSum).max * desiredThrust, ... zSum);

console.log(s.minimum(... energy));

/*
*/
