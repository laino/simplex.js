const FLOAT_ERROR = 1e-9;

class Simplex {

    constructor() {
        this.constraints = [];

        this.variables = 0;
        this.artificials = 0;

        this.LFSRows = 0;
        this.LFSColumns = 0;
    }

    setVariableCount(count) {
        if (this.constraints.length === 0) {
            this.variables = count;
            this.LFSColumns = this.variables * 2 + 2;
        } else if (count !== this.variables) {
            throw new Error("Number of coefficients different to previous invocation");
        }
    }

    addLowerConstraint(bound, ... coefficients) {
        this.addUpperConstraint(-bound, ... coefficients.map(x => -x));
    }

    addUpperConstraint(bound, ... coefficients) {
        this.setVariableCount(coefficients.length);

        const column = this.LFSColumns - this.artificials;

        if (bound < 0) {
            // artificial variable
            this.LFSColumns += 2;
            this.artificials++;
        } else {
            this.LFSColumns++;
        }

        const row = new Float64Array(this.LFSColumns);

        row[1] = bound;

        this._setVariables(row, coefficients);

        row[column] = 1;

        if (bound < 0) {
            for (let i = 1; i < this.LFSColumns; i++) {
                row[i] *= -1;
            }

            row[0] = -1;
        } else {
            row[0] = column;
        }

        this.constraints.push(row);
        this.LFSRows++;
    }

    addRangeConstraint(lower, upper, ... coefficients) {
        this.addLowerConstraint(lower, ... coefficients);
        this.addUpperConstraint(upper, ... coefficients);
    }

    addEqualConstraint(bound, ... coefficients) {
        this.setVariableCount(coefficients.length);

        if (bound < 0) {
            this._addEqualConstraint(-bound, ... coefficients.map(x => -x));
            return;
        }

        if (bound === 0) {
            this._addEqualConstraint(0, ... coefficients);
            this._addEqualConstraint(0, ... coefficients.map(x => -x));
            return;
        }

        this._addEqualConstraint(bound, ... coefficients);
    }

    _addEqualConstraint(bound, ... coefficients) {
        this.LFSColumns++;
        this.artificials++;

        const row = new Float64Array(this.LFSColumns);

        row[0] = -1;
        row[1] = bound;

        this._setVariables(row, coefficients);

        this.constraints.push(row);
        this.LFSRows++;
    }

    createSystem() {
        const {LFSRows, LFSColumns, constraints, artificials} = this;

        const system = [];

        let artificialColumn = LFSColumns - artificials;

        for (let i = 0; i < constraints.length; i++) {
            const constraint = constraints[i];

            const row = new Float64Array(LFSColumns);

            row.set(constraint);

            if (row[0] === -1) {
                row[artificialColumn] = 1;
                row[0] = artificialColumn;
                artificialColumn++;
            }

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
        this.setVariableCount(coefficients.length);

        const {LFSRows, LFSColumns, variables, artificials, constraints} = this;

        const system = this.createSystem();

        const objective = new Float64Array(LFSColumns);

        this._setVariables(objective, coefficients);

        system.push(objective);

        if (artificials > 0) {
            const auxObjective = new Float64Array(LFSColumns);

            for (let i = 0; i < LFSRows; i++) {
                const row = system[i];
                const column = row[0];

                if (column < LFSColumns - artificials || row[1] === 0) {
                    continue;
                }

                auxObjective[column] = -1;

                for (let i = 1; i < LFSColumns; i++) {
                    auxObjective[i] += row[i];
                }
            }

            system.push(auxObjective);

            if (!this._findBFS(system, LFSRows + 1)) {
                return {
                    max: NaN,
                    result: null
                }
            }
        }

        const sLFSColumns = LFSColumns - artificials;

        while (true) {
            const {c, r} = this._pickPivot(system, LFSRows, sLFSColumns, LFSRows);

            if (c < 0) {
                break;
            }

            if (r < 0) {
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

            if (k >= 0 && k < variables * 2) {
                result[Math.floor(k / 2)] += row[1] * (1 - k % 2 * 2);
            }
        }

        return {
            result,
            max: -objective[1]
        };
    }

    _setVariables(row, coefficients) {
        for (let i = 0; i < this.variables; i++) {
            row[i * 2 + 2] = coefficients[i];
            row[i * 2 + 3] = -coefficients[i];
        }
    }

    _findBFS(system, objectiveRow) {
        const { LFSRows, LFSColumns, artificials } = this;

        const objective = system[objectiveRow];

        while (true) {
            const {r, c} = this._pickPivot(system, LFSRows, LFSColumns, LFSRows + 1);

            if (c < 0) {
                break;
            }

            if (r < 0) {
                return false;
            }

            this._pivot(system, r, c, LFSRows + 2, LFSColumns);
        }

        return Math.abs(objective[1]) < FLOAT_ERROR;
    }

    _pickPivot(system, maxRows, maxColumns, objectiveRow) {
        const objective = system[objectiveRow];

        let c = 0;
        let r = -1;

        for (let i = 2; i < maxColumns; i++) {
            if (objective[i] > objective[c]) {
                c = i;
            }
        }

        if (objective[c] < FLOAT_ERROR) {
            return {c: -1, r: -1};
        }

        let strictest = Number.MAX_VALUE;

        for (let i = 0; i < maxRows; i++) {
            const row = system[i];

            if (row[c] > FLOAT_ERROR) {
                const strictness = row[1] / row[c];

                if (strictness < strictest) {
                    strictest = strictness;
                    r = i;
                }
            }
        }

        return {c, r};
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
