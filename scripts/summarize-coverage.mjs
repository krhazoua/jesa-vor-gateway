import fs from "node:fs";
import process from "node:process";

const coveragePath = process.argv[2] ?? "coverage/coverage-final.json";
const coverage = JSON.parse(fs.readFileSync(coveragePath, "utf8"));

const metric = values => {
  const counts = Object.values(values ?? {});
  const total = counts.length;
  const covered = counts.filter(count => count > 0).length;
  return {
    pct: total === 0 ? 100 : Number(((covered / total) * 100).toFixed(1)),
    total,
    covered,
    uncovered: total - covered,
  };
};

const rows = Object.entries(coverage)
  .map(([absolutePath, report]) => {
    const file = absolutePath.replace(`${process.cwd()}/`, "");
    const isApplicationFile =
      /^(client\/src\/(pages|lib|components\/(?!ui\/))|server\/(?!_core\/)|shared\/)/.test(
        file
      );
    if (!isApplicationFile) return null;
    const statements = metric(report.s);
    const functions = metric(report.f);
    const branches = metric(report.b);
    return {
      file,
      statements,
      functions,
      branches,
    };
  })
  .filter(Boolean)
  .sort(
    (a, b) =>
      a.statements.pct - b.statements.pct || a.branches.pct - b.branches.pct
  );

console.log(
  "Application-owned coverage (generated UI primitives and framework scaffolding excluded)"
);
for (const row of rows) {
  console.log(
    `${row.file}\tstatements=${row.statements.pct}% (${row.statements.uncovered} uncovered)\tfunctions=${row.functions.pct}% (${row.functions.uncovered} uncovered)\tbranches=${row.branches.pct}% (${row.branches.uncovered} uncovered)`
  );
}

const lowRisk = rows.filter(
  row => row.statements.pct < 80 || row.branches.pct < 70
);
const aggregate = list => {
  const totals = { statements: 0, functions: 0, branches: 0 };
  const covered = { statements: 0, functions: 0, branches: 0 };
  for (const row of list) {
    for (const key of Object.keys(totals)) {
      totals[key] += row[key].total;
      covered[key] += row[key].covered;
    }
  }
  return Object.fromEntries(
    Object.keys(totals).map(key => [
      key,
      {
        pct: Number(((covered[key] / totals[key]) * 100).toFixed(1)),
        covered: covered[key],
        total: totals[key],
        uncovered: totals[key] - covered[key],
      },
    ])
  );
};

console.log("\nAggregate application-owned coverage");
console.log(JSON.stringify(aggregate(rows)));
console.log("Critical server modules aggregate");
console.log(
  JSON.stringify(
    aggregate(
      rows.filter(
        row => row.file.startsWith("server/") && !row.file.includes("_core")
      )
    )
  )
);
console.log("Critical client logic aggregate");
console.log(
  JSON.stringify(
    aggregate(rows.filter(row => row.file.startsWith("client/src/lib/")))
  )
);

console.log(
  "\nPriority gaps (statement coverage below 80% or branch coverage below 70%)"
);
for (const row of lowRisk)
  console.log(
    `${row.file}\tstatements=${row.statements.pct}%\tfunctions=${row.functions.pct}%\tbranches=${row.branches.pct}%`
  );
