import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RouteModule } from './route/route.module';
import { RouteService } from './route/route.service';


@Module({
  imports: [RouteModule],
  controllers: [AppController],
  providers: [AppService, RouteService],
})
export class AppModule {}
