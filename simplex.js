class Simplex {
    constructor() {
        this.constraints = [];
    }

    addUpperConstraint(bound, ... x) {
        this.constraints.push([
            bound,
            ... x.map(x => -x)
        ]);
    }

    addLowerConstraint(bound, ... x) {
        this.constraints.push([
            bound,
            ... x
        ]);
    }

    maximum(... objective) {
        const constraints = this.constraints;
        const variables = objective.length + constraints.length;

        const pad = Array(constraints.length).fill(0);
        const system = [];

        for (let i = 0; i < constraints.length; i++) {
            const constraint = constraints[i];
            system.push([i + objective.length + 2, ... constraint, ... pad]);
        }

        system.push([0, 0, ... objective, ... pad])

        while (true) {
            const obj = system[system.length - 1];

            let c = 2;
            for (; c < obj.length; c++) {
                if (obj[c] > 0) {
                    break;
                }
            }

            if (c === obj.length) {
                break;
            }

            let r = -1;
            let strictest = Number.MAX_VALUE;

            for (let i = 0; i < constraints.length; i++) {
                const row = system[i];

                if (row[c] >= 0) {
                    continue;
                }

                const strictness = -row[1] / row[c];

                if (strictness < strictest) {
                    strictest = strictness;
                    r = i;
                }
            }

            if (r === -1) {
                // unbounded
                return {
                    max: Infinity,
                    c: null
                };
            }

            const row = system[r];

            const m = row[c];

            row[row[0]] = -1;
            row[0] = c;
            row[c] = 0;
            row[1] = strictest;

            for (let i = 2; i < row.length; i++) {
                row[i] /= -m;
            }

            for (let i = 0; i < system.length; i++) {
                const subRow = system[i];
                const m = subRow[c];
                for (let k = 1; k < subRow.length; k++) {
                    subRow[k] += row[k] * m;
                }
                subRow[c] = 0;
            }
        }

        const co = Array(objective.length).fill(0);

        for (let i = 0; i < system.length - 1; i++) {
            const row = system[i];
            if (row[0] - 2 < objective.length) {
                co[row[0] - 2] = row[1];
            }
        }

        return {
            co,
            max: system[system.length - 1][1]
        }
    }
}

const s = new Simplex();

s.addUpperConstraint(5, 2, 1);

console.log(s.maximum(1, 1));
