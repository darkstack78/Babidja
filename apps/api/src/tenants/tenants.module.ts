import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { EmployeesController } from './employees.controller';
import { TenantsService } from './tenants.service';
import { EmployeesService } from './employees.service';

@Module({
  controllers: [TenantsController, EmployeesController],
  providers: [TenantsService, EmployeesService],
  exports: [TenantsService, EmployeesService],
})
export class TenantsModule {}
