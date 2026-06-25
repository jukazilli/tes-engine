import { DynamicModule, FactoryProvider, Global, Module, Provider } from '@nestjs/common';
import { DATABASE_OPTIONS } from './database.constants';
import { DatabaseOptions } from './database.types';
import { DatabaseHealthService } from './connection/database.health';
import { DatabaseLifecycle } from './connection/database.lifecycle';
import { databaseProvider, databasePoolProvider } from './connection/database.provider';
import { TenantTransactionService } from './tenant/tenant-transaction';

export interface DatabaseModuleAsyncOptions {
  inject?: FactoryProvider<DatabaseOptions>['inject'];
  useFactory: (...args: unknown[]) => DatabaseOptions | Promise<DatabaseOptions>;
}

@Global()
@Module({})
export class DatabaseModule {
  static forRoot(options: DatabaseOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: DATABASE_OPTIONS,
      useValue: options,
    };

    return {
      module: DatabaseModule,
      providers: [
        optionsProvider,
        databasePoolProvider,
        databaseProvider,
        DatabaseHealthService,
        DatabaseLifecycle,
        TenantTransactionService,
      ],
      exports: [
        databasePoolProvider,
        databaseProvider,
        DatabaseHealthService,
        TenantTransactionService,
      ],
    };
  }

  static forRootAsync(options: DatabaseModuleAsyncOptions): DynamicModule {
    const optionsProvider: FactoryProvider<DatabaseOptions> = {
      provide: DATABASE_OPTIONS,
      inject: options.inject ?? [],
      useFactory: options.useFactory,
    };

    return {
      module: DatabaseModule,
      providers: [
        optionsProvider,
        databasePoolProvider,
        databaseProvider,
        DatabaseHealthService,
        DatabaseLifecycle,
        TenantTransactionService,
      ],
      exports: [
        databasePoolProvider,
        databaseProvider,
        DatabaseHealthService,
        TenantTransactionService,
      ],
    };
  }
}
