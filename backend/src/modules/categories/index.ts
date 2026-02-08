import { FastifyInstance } from 'fastify';
import { listCategories } from './list-categories';
import { createCategory } from './create-category';
import { updateCategory } from './update-category';
import { deleteCategory } from './delete-category';

export async function categoryRoutes(app: FastifyInstance) {
  app.register(listCategories);
  app.register(createCategory);
  app.register(updateCategory);
  app.register(deleteCategory);
}
