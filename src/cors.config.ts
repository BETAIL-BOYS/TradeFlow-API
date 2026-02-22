import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const corsConfig: CorsOptions = {
  origin: ['http://localhost:3000', 'https://tradeflow-web.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'PATCH'],
  credentials: true,
};
