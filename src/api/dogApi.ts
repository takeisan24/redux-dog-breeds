import type { DogApiBreedsResponse } from '@/api/dogApiTypes'
import { getJson } from '@/api/httpClient'

const DOG_API_BASE_URL = 'https://dogapi.dog/api/v2'

interface GetBreedsParams {
  page: number
  pageSize: number
}

/**
 * GET /breeds: one page of breeds.
 * `include=group` adds each breed's group (e.g. "Toy Group") to `included`, so no extra request is needed.
 */
export function getBreeds(
  { page, pageSize }: GetBreedsParams,
  options: { signal?: AbortSignal } = {},
): Promise<DogApiBreedsResponse> {
  const params = new URLSearchParams({
    'page[number]': String(page),
    'page[size]': String(pageSize),
    include: 'group',
  })
  return getJson<DogApiBreedsResponse>(`${DOG_API_BASE_URL}/breeds?${params}`, options)
}
