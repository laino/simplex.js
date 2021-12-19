class Simplex {

    constructor() {
        this.constraints = [];
        this.auxilaries = [];

        this.variables = 0;

        this.LFSRows = 0;
        this.LFSColumns = 0;
    }

    addLowerConstraint(bound, ... coefficients) {
        this.addUpperConstraint(-bound, ... coefficients.map(x => -x));
    }

    addUpperConstraint(bound, ... coefficients) {
        if (this.constraints.length === 0) {
            this.variables = coefficients.length;
            this.LFSColumns = this.variables + 2;
        } else if (coefficients.length !== this.variables) {
            throw new Error("Number of coefficients different to previous invocation");
        }


        this.LFSColumns++;

        if (bound < 0) {
            // artificial variable
            this.LFSColumns++;
        }

        const row = new Float64Array(this.LFSColumns);

        row[1] = bound;

        row.set(coefficients, 2);

        const column = this.variables + this.constraints.length + 2;

        row[column] = 1;

        if (bound < 0) {
            for (let i = 1; i < this.LFSColumns; i++) {
                row[i] *= -1;
            }

            this.auxilaries.push(this.constraints.length);

            row[0] = -1;
        } else {
            row[0] = column;
        }

        this.constraints.push(row);
        this.LFSRows++;
    }

    addEqualConstraint(bound, ... coefficients) {
        if (this.constraints.length === 0) {
            this.variables = coefficients.length;
            this.LFSColumns = this.variables + 2;
        } else if (coefficients.length !== this.variables) {
            throw new Error("Number of coefficients different to previous invocation");
        }

        this.LFSColumns++;

        const row = new Float64Array(this.LFSColumns);

        row[0] = -1;
        row[1] = bound;

        row.set(coefficients, 2);

        this.auxilaries.push(this.constraints.length);

        this.constraints.push(row);
        this.LFSRows++;
    }

    createSystem() {
        const {LFSRows, LFSColumns, constraints} = this;

        const system = [];

        for (let i = 0; i < constraints.length; i++) {
            const constraint = constraints[i];

            const row = new Float64Array(LFSColumns);

            row.set(constraint);

            system.push(row);
        }

        return system;
    }

    minimum(... coefficients) {
        const {max, result} = this.maximum(... coefficients.map(x => -x));

        return {
            result,
            min: -max
        };
    }

    maximum(... coefficients) {
        if (coefficients.length !== this.variables) {
            throw new Error("Number of coefficients different to previous invocation");
        }

        const {LFSRows, LFSColumns, variables, auxilaries, constraints} = this;

        const system = this.createSystem();

        const objective = new Float64Array(LFSColumns);

        for (let i = 0; i < variables; i++) {
            objective[i + 2] = coefficients[i];
        }

        system.push(objective);

        if (auxilaries.length > 0) {
            const auxObjective = new Float64Array(LFSColumns);

            for (let i = 0; i < auxilaries.length; i++) {
                const row = system[auxilaries[i]];
                const column = LFSColumns - auxilaries.length + i;

                for (let i = 1; i < LFSColumns; i++) {
                    auxObjective[i] += row[i];
                }

                row[0] = column;
                row[column] = 1;
            }

            system.push(auxObjective);

            while (true) {
                const {r, c} = this._pickPivot(system, LFSRows, LFSColumns, LFSRows + 1);

                if (r === -1) {
                    break;
                }

                if (r === -2) {
                    return {
                        max: NaN,
                        result: null
                    };
                }

                this._pivot(system, r, c, LFSRows + 2, LFSColumns);
            }

            if (auxObjective[1] > 0.000001) {
                return {
                    max: NaN,
                    result: null
                };
            }
        }

        const sLFSColumns = LFSColumns - auxilaries.length;

        while (true) {
            const {r, c} = this._pickPivot(system, LFSRows, sLFSColumns, LFSRows);

            if (r === -1) {
                break;
            }

            if (r === -2) {
                return {
                    max: Infinity,
                    result: null
                };
            }

            this._pivot(system, r, c, LFSRows + 1, sLFSColumns);
        }

        const result = new Float64Array(variables);

        for (let i = 0; i < LFSRows; i++) {
            const row = system[i];
            const k = row[0] - 2;

            if (k < variables) {
                result[k] = row[1];
            }
        }

        return {
            result,
            max: -objective[1]
        };
    }

    _pickPivot(system, maxRows, maxColumns, objectiveRow) {
        const objective = system[objectiveRow];

        let c = -1;

        for (let i = 2; i < maxColumns; i++) {
            if (objective[i] > 0 && (c === -1 || objective[i] > objective[c])) {
                c = i;
            }
        }

        if (c === -1) {
            return {
                r: -1,
                c: -1,
            };
        }

        let r = -1;
        let strictest = Number.MAX_VALUE;

        for (let i = 0; i < maxRows; i++) {
            const row = system[i];

            if (row[c] > 0) {
                const strictness = row[1] / row[c];

                if (strictness < strictest) {
                    strictest = strictness;
                    r = i;
                }
            }
        }

        if (r === -1) {
            // unbounded
            return {
                r: -2,
                c: -2,
            };
        }

        return {r, c};
    }

    _pivot(system, r, c, maxRows, maxColumns) {
        const row = system[r];
        const m = 1 / row[c];

        row[0] = c;

        for (let i = 1; i < maxColumns; i++) {
            row[i] *= m;
        }

        for (let i = 0; i < maxRows; i++) {
            if (i === r) {
                continue;
            }

            const subRow = system[i];
            const m = subRow[c];

            for (let k = 1; k < maxColumns; k++) {
                subRow[k] -= row[k] * m;
            }
        }
    }
}

module.exports = Simplex;
