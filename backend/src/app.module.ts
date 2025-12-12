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
          host: 'localhost',
          port: 5432,
          username: 'myuser',
          password: 'mypassword',
          database: 'deutschmock',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
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
export class AppModule { }
