const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// Load .env manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.substring(0, eqIdx);
  let val = trimmed.substring(eqIdx + 1);
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  process.env[key] = val;
}

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
  const dirs = fs.readdirSync(migrationsDir).filter(d => d !== 'migration_lock.toml').sort();

  for (const dir of dirs) {
    const sqlPath = path.join(migrationsDir, dir, 'migration.sql');
    if (!fs.existsSync(sqlPath)) continue;

    console.log(`Applying migration: ${dir}`);
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);

    for (const stmt of statements) {
      try {
        await client.execute(stmt);
        console.log('  OK:', stmt.substring(0, 70) + (stmt.length > 70 ? '...' : ''));
      } catch (err) {
        if (err.message && err.message.includes('already exists')) {
          console.log('  SKIP (exists):', stmt.substring(0, 70));
        } else {
          console.error('  ERROR:', err.message);
          process.exit(1);
        }
      }
    }
  }

  console.log('\nSchema pushed to Turso successfully!');
  client.close();
}

main();
