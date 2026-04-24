const { Sequelize } = require('sequelize');

const localDb = new Sequelize('ecommerce_db', 'postgres', 'zed12345', {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: false,
});

const supabaseUrl = 'postgresql://postgres.ylrcjlhiveipytyiwbms:ZemzemMoh2026@aws-1-eu-north-1.pooler.supabase.com:6543/postgres';
const remoteDb = new Sequelize(supabaseUrl, {
    dialect: 'postgres',
    logging: false,
});

async function migrate() {
    try {
        console.log('Connecting to databases...');
        await localDb.authenticate();
        await remoteDb.authenticate();
        console.log('Connected.');

        const tables = ['Users', 'Products', 'Orders', 'OrderItems', 'SystemSettings'];

        // Disable triggers/FK checks on remote
        await remoteDb.query("SET session_replication_role = 'replica';");

        for (const table of tables) {
            console.log(`Migrating ${table}...`);
            const [rows] = await localDb.query(`SELECT * FROM "${table}"`);
            console.log(`Found ${rows.length} rows in local ${table}.`);

            if (rows.length > 0) {
                // Clear remote table
                await remoteDb.query(`TRUNCATE TABLE "${table}" CASCADE`);
                
                // Get columns
                const columns = Object.keys(rows[0]).map(c => `"${c}"`).join(', ');
                
                for (const row of rows) {
                    const values = Object.values(row).map(v => {
                        if (v === null) return 'NULL';
                        if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
                        if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
                        return v;
                    }).join(', ');
                    
                    await remoteDb.query(`INSERT INTO "${table}" (${columns}) VALUES (${values})`);
                }
                console.log(`Successfully migrated ${table}.`);
            } else {
                console.log(`No data to migrate for ${table}.`);
            }
        }

        // Re-enable triggers/FK checks
        await remoteDb.query("SET session_replication_role = 'origin';");
        console.log('Migration completed successfully! ✅');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
