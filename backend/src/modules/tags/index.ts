import { FastifyInstance } from 'fastify';
import { listTags } from './list-tags';
import { createTag } from './create-tag';
import { updateTag } from './update-tag';
import { deleteTag } from './delete-tag';

export async function tagRoutes(app: FastifyInstance) {
  app.register(listTags);
  app.register(createTag);
  app.register(updateTag);
  app.register(deleteTag);
}
