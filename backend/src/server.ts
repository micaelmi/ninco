import fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { appRoutes } from './modules';

const app = fastify().withTypeProvider();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(cors, {
  origin: '*',
});

app.register(swagger, {
  openapi: {
    info: {
      title: 'Cockatiel Finances API',
      description: 'API for Cockatiel Finances application',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
});

app.register(swaggerUi, {
  routePrefix: '/docs',
});

app.register(appRoutes);

app.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log('HTTP Server Running on http://localhost:3333');
});
