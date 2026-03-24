import fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { appRoutes } from './modules';
import { env } from './lib/env';

export async function buildApp() {
  const app = fastify({
    logger: env.NODE_ENV === 'development',
  }).withTypeProvider();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(cors, {
    origin: env.CORS_ORIGINS.split(','),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  app.register(swagger, {
    openapi: {
      info: {
        title: 'Ninco API',
        description: 'API for Ninco application',
        version: '1.1.0',
      },
    },
    transform: jsonSchemaTransform,
  });

  app.register(swaggerUi, {
    routePrefix: '/docs',
  });

  // Global error handler — prevents raw error leaks to clients
  app.setErrorHandler((error: Error & { validation?: unknown }, request, reply) => {
    if (error.validation) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: error.validation,
      });
    }

    request.log.error(error);
    reply.status(500).send({ 
      message: 'Internal server error',
      details: env.NODE_ENV === 'development' ? error.message : undefined
    });
  });

  app.register(appRoutes);

  await app.ready();
  return app;
}

// Only start listening when not in test mode
if (process.env.NODE_ENV !== 'test') {
  buildApp().then(app => {
    app.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
      console.log(`HTTP Server Running on http://localhost:${env.PORT}`);
    });
  });
}
