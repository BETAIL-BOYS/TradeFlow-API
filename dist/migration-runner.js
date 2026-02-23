"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const datasource_1 = require("./datasource");
async function runMigrations() {
    try {
        console.log('Connecting to database...');
        const dataSource = await datasource_1.AppDataSource.initialize();
        console.log('Running migrations...');
        const migrations = await dataSource.runMigrations();
        console.log('Migrations completed successfully!');
        console.log('Applied migrations:', migrations);
        const tableExists = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'migrations'
      );
    `);
        console.log('Schema migrations table exists:', tableExists[0].exists);
        await dataSource.destroy();
    }
    catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}
runMigrations();
//# sourceMappingURL=migration-runner.js.map