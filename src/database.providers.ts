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
        synchronize: process.env.NODE_ENV === 'development',
      });

      return dataSource.initialize();
    },
  },
];
