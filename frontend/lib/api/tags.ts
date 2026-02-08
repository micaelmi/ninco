import { apiClient } from './client';
import type { Tag, CreateTagInput, UpdateTagInput } from './types';

export async function getTags(): Promise<Tag[]> {
  const response = await apiClient.get<Tag[]>('/tags');
  return response.data;
}

export async function getTag(id: string): Promise<Tag> {
  const response = await apiClient.get<Tag>(`/tags/${id}`);
  return response.data;
}

export async function createTag(data: CreateTagInput): Promise<Tag> {
  const response = await apiClient.post<Tag>('/tags', data);
  return response.data;
}

export async function updateTag(
  id: string,
  data: UpdateTagInput
): Promise<Tag> {
  const response = await apiClient.put<Tag>(`/tags/${id}`, data);
  return response.data;
}

export async function deleteTag(id: string): Promise<void> {
  await apiClient.delete(`/tags/${id}`);
}
