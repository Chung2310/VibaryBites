import { config } from 'dotenv';
import { initializeAdminFromEnv, ensureAuthIndexes } from '../src/lib/backend/admin-accounts';
import { getMongoClient } from '../src/lib/backend/mongodb';
config({ path: '.env' });
async function main() {
  try {
    await ensureAuthIndexes();
    const result = await initializeAdminFromEnv();
    if (result === 'not-configured') {
      console.error('Set ADMIN_USERNAME and ADMIN_PASSWORD (at least 12 characters) in .env first.');
      process.exitCode = 1;
    } else if (result === 'migrated') console.log('Initial administrator now uses ADMIN_USERNAME. Existing password was preserved.');
    else console.log(result === 'created' ? 'Initial MongoDB administrator created from .env. Password was stored as a scrypt hash.' : 'An administrator already exists. Existing account and password were preserved.');
  } finally { await (await getMongoClient()).close(); }
}
main().catch(error => {
  console.error(error.name === 'ZodError' ? 'Invalid ADMIN_USERNAME, ADMIN_PASSWORD or ADMIN_NAME configuration.' : 'Could not initialize administrator: ' + error.name);
  process.exitCode = 1;
});
