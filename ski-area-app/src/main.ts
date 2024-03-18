import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  /*
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  */
  const app = await NestFactory.create(AppModule);
app.enableCors({
  origin: 'http://localhost:3000', // Allow only your frontend to access the backend
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Specify HTTP methods allowed
  allowedHeaders: 'Content-Type, Accept', // Specify HTTP headers allowed
});
await app.listen(3028);

}
bootstrap();
