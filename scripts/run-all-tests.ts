import { calculateDynamicCompletionDate } from '../src/utils/completionCalculator';
import { SUPPORTED_DEVICES_DATABASE } from '../src/data/supportedDevicesData';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
    failed++;
  }
}

console.log("==================================================");
console.log("🧪 RUNNING SUITE: Unit & Logic Tests");
console.log("==================================================");

// Suite 1: Dynamic Completion Calculator Tests
console.log("\n[Suite: Completion Calculator]");
try {
  const tier1 = calculateDynamicCompletionDate({
    deviceModel: 'iPhone 13',
    serviceTier: 'Tier 1 (Power/Port Refresh)',
    currentStage: 1,
    queuePosition: 1,
    totalQueueJobs: 4,
    activeTechnicians: 2,
    partsInStock: true,
    priorityExpress: 'standard'
  });
  assert(tier1.complexityCategory.includes('Tier 1'), 'Tier 1 category correct');
  assert(tier1.workloadTrafficLevel === 'Low Traffic', 'Traffic level calculated as Low');
  assert(tier1.partsDelayHours === 0, 'No parts delay when in stock');
  assert(tier1.confidenceScorePercentage >= 90, 'High confidence score (>=90%)');

  const outOfStock = calculateDynamicCompletionDate({
    deviceModel: 'Samsung Galaxy S24',
    serviceTier: 'Tier 2 (Display Renewal)',
    currentStage: 1,
    partsInStock: false
  });
  assert(outOfStock.partsDelayHours === 24, '24h delay applied when out of stock');
  assert(outOfStock.totalCalculatedHours > 24, 'Total calculated hours > 24');

  const standardResult = calculateDynamicCompletionDate({
    deviceModel: 'iPad Pro',
    serviceTier: 'Tier 3 (Board Rework)',
    currentStage: 1,
    queuePosition: 5,
    priorityExpress: 'standard'
  });
  const emergencyResult = calculateDynamicCompletionDate({
    deviceModel: 'iPad Pro',
    serviceTier: 'Tier 3 (Board Rework)',
    currentStage: 1,
    queuePosition: 5,
    priorityExpress: 'emergency'
  });
  assert(emergencyResult.totalCalculatedHours < standardResult.totalCalculatedHours, 'Emergency express reduces estimated hours');
} catch (e: any) {
  assert(false, 'Completion Calculator suite', e.message);
}

// Suite 2: Supported Devices Database Tests
console.log("\n[Suite: Supported Devices Database]");
try {
  assert(SUPPORTED_DEVICES_DATABASE.length > 0, 'Database contains device records');

  const query = '15 pro';
  const matches = SUPPORTED_DEVICES_DATABASE.filter(d => 
    d.modelName.toLowerCase().includes(query) ||
    d.boardId.toLowerCase().includes(query)
  );
  assert(matches.length > 0 && matches.some(m => m.modelName.includes('iPhone 15 Pro')), 'Fuzzy query filters "15 pro" accurately');

  const queryModel = 'a2849';
  const modelMatches = SUPPORTED_DEVICES_DATABASE.filter(d => 
    d.modelNumbers.some(num => num.toLowerCase().includes(queryModel))
  );
  assert(modelMatches.length === 1 && modelMatches[0].modelName === 'iPhone 15 Pro Max', 'Model number lookup resolves to iPhone 15 Pro Max');
} catch (e: any) {
  assert(false, 'Supported Devices Database suite', e.message);
}

console.log("\n==================================================");
console.log(`📊 UNIT TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log("==================================================");

if (failed > 0) {
  process.exit(1);
}
