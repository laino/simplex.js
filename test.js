const Simplex = require('./simplex.js');

s = new Simplex();

s.addLowerConstraint(5, 1, 0);
s.addUpperConstraint(10, 1, 0);
s.addEqualConstraint(0, 1, -1);

console.log(s.maximum(0, -1));
