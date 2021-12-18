const Simplex = require('./simplex.js');

const s = new Simplex();

s.addUpperConstraint(5, 2, 1);
s.addUpperConstraint(4, 1, 2);

s.addUpperConstraint(0, 1, -1);
s.addLowerConstraint(0, 1, -1);

console.log(s.maximum(1, 1));
