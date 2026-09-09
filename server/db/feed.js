// ============================================================================
// TAMIL NADU HEALTH CARE - PATIENT DATA SQL FEEDER SCRIPT (feed.js)
// Ready to execute whenever the user instructs "feed into sql"
// Usage: node server/db/feed.js
// ============================================================================

const path = require('path');
const { feedDatabase, getStats } = require('./database');

console.log('===================================================================');
console.log(' TAMIL NADU HEALTH CARE & PAN-INDIA MEDICAL CENTRE');
console.log(' RELATIONAL SQL DATABASE FEEDER (SQLite3 / SQL)');
console.log('===================================================================');
console.log('[1/3] Connecting to SQLite database at server/db/hospital.db ...');

const result = feedDatabase();

if (result.success) {
  const s = result.stats;
  console.log('[2/3] Executing schema.sql and seed_data.sql transactions ... SUCCESS');
  console.log('[3/3] VERIFICATION OF LOADED CLINICAL RECORDS:');
  console.log(`      ✓ Registered Patients   : ${s.patients}`);
  console.log(`      ✓ Patient Vitals Records : ${s.vitals}`);
  console.log(`      ✓ Clinical Summaries     : ${s.summaries}`);
  console.log(`      ✓ Active Prescriptions   : ${s.prescriptions}`);
  console.log(`      ✓ Diagnostic Lab Reports : ${s.labReports}`);
  console.log(`      ✓ CMCHIS Billing Records : ${s.billings}`);
  console.log(`      ✓ Medical Council Doctors: ${s.doctors}`);
  console.log(`      ✓ Active OPD Queue Tokens: ${s.opdQueue}`);
  console.log('-------------------------------------------------------------------');
  console.log(' STATUS: ALL PATIENT RECORDS SUCCESSFULLY FED INTO SQL DATABASE!');
  console.log(' Database File: server/db/hospital.db');
  console.log('===================================================================');
  process.exit(0);
} else {
  console.error('[ERROR] Failed to feed SQL database:', result.error);
  process.exit(1);
}
