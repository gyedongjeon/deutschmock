import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EvaluationModule } from './evaluation/evaluation.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Explicitly specify path
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = {
          type: 'postgres' as const,
          host: configService.get<string>('POSTGRES_HOST') ?? 'localhost',
          port: configService.get<number>('POSTGRES_PORT') ?? 5432,
          username: configService.get<string>('POSTGRES_USER') ?? 'myuser',
          password:
            configService.get<string>('POSTGRES_PASSWORD') ?? 'mypassword',
          database: configService.get<string>('POSTGRES_DB') ?? 'deutschmock',
          ssl:
            configService.get<string>('POSTGRES_HOST') !== 'localhost'
              ? { rejectUnauthorized: false }
              : false,
          autoLoadEntities: true,
          synchronize: true, // Auto-create tables (careful in prod, but ok for MVP)
        };
        console.log('🔗 DB Config Check:', { ...dbConfig, password: '****' });
        return dbConfig;
      },
    }),
    EvaluationModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
