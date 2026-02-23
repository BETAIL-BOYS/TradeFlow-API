"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseProviders = void 0;
const typeorm_1 = require("typeorm");
exports.databaseProviders = [
    {
        provide: 'DATA_SOURCE',
        useFactory: async () => {
            const dataSource = new typeorm_1.DataSource({
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT) || 5432,
                username: process.env.DB_USERNAME || 'postgres',
                password: process.env.DB_PASSWORD || 'password',
                database: process.env.DB_DATABASE || 'tradeflow',
                entities: [`${__dirname}/**/*.entity{.ts,.js}`],
                migrations: [`${__dirname}/migrations/*.ts`],
                synchronize: false,
            });
            try {
                const connection = await dataSource.initialize();
                console.log('Database connected successfully');
                return connection;
            }
            catch (error) {
                console.warn('Database connection failed - continuing without DB connection');
                return dataSource;
            }
        },
    },
];
//# sourceMappingURL=database.providers.js.map