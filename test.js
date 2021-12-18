
const Simplex = require('./simplex.js');
const s = new Simplex();

// Thruster 1: Thrust
s.addLowerConstraint(0, 1);
s.addUpperConstraint(1, 1);

s.addLowerConstraint(-0.001, -0.000001);
s.addUpperConstraint(0.001, -0.000001);

console.log(s.maximum(1));
