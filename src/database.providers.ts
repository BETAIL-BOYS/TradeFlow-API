import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_DATABASE || 'tradeflow',
        entities: [`${__dirname}/**/*.entity{.ts,.js}`],
        migrations: [`${__dirname}/migrations/*.ts`],
        synchronize: false, // Important: disable synchronize for production
      });

      try {
        const connection = await dataSource.initialize();
        console.log('Database connected successfully');
        return connection;
      } catch (error) {
        console.warn('Database connection failed - continuing without DB connection');
        return dataSource;
      }
    },
  },
];
