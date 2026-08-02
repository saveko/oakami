import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ConfigService {
  private config: Record<string, any>;

  constructor() {
    const env = process.env.NODE_ENV || 'development';
    const envPath = path.join(process.cwd(), `.env.${env}`);
    const defaultPath = path.join(process.cwd(), '.env');

    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
    } else if (fs.existsSync(defaultPath)) {
      dotenv.config({ path: defaultPath });
    }

    this.config = {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: parseInt(process.env.PORT, 10) || 3000,
      databaseUrl: process.env.DATABASE_URL,
      jwtSecret: process.env.JWT_SECRET || 'secret',
      jwtExpiration: process.env.JWT_EXPIRATION || '24h',
      jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
      corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',
      apiPrefix: process.env.API_PREFIX || 'api/v1',
      uploadDir: process.env.UPLOAD_DIR || '/tmp/uploads',
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760,
      logLevel: process.env.LOG_LEVEL || 'info',
    };
  }

  get<T = any>(key: string, defaultValue?: T): T {
    return this.config[key] ?? defaultValue;
  }

  getOrThrow<T = any>(key: string): T {
    const value = this.config[key];
    if (value === undefined) {
      throw new Error(`Configuration key "${key}" is required but not set`);
    }
    return value;
  }

  isDevelopment(): boolean {
    return this.config.nodeEnv === 'development';
  }

  isProduction(): boolean {
    return this.config.nodeEnv === 'production';
  }
}
