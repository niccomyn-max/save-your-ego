import { validateAllUSRegressionScenarios } from "../lib/assessment/usa/scenarios";

const results = validateAllUSRegressionScenarios();
let failed = false;

for (const result of results) {
  if (result.passed) {
    console.log(`PASS: ${result.name}`);
    continue;
  }

  failed = true;
  console.error(`FAIL: ${result.name}`);
  for (const failure of result.failures) {
    console.error(`  - ${failure}`);
  }
}

if (failed) {
  process.exit(1);
}

console.log(`All ${results.length} USA regression scenarios passed.`);
