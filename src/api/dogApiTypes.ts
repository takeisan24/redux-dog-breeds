/**
 * Raw response shapes of the Dog API v2 (JSON:API format).
 * Only the fields this app reads are typed. Components never use these types directly:
 * `breedMapper.ts` turns them into the app's own `Breed` type.
 * Docs: https://dogapi.dog/docs/api-v2
 */

interface DogApiRange {
  min: number
  max: number
}

interface DogApiImage {
  id: string
  url: string
  thumb: string
  medium: string
  large: string
  attribution?: {
    author?: string | null
    license?: string | null
    license_url?: string | null
    source_url?: string | null
  } | null
}

export interface DogApiBreed {
  id: string
  type: 'breed'
  attributes: {
    name: string
    description: string
    life: DogApiRange
    male_weight: DogApiRange
    female_weight: DogApiRange
    hypoallergenic: boolean
    origin?: { country?: string | null } | null
    images?: DogApiImage[]
  }
  relationships?: {
    group?: { data: { id: string; type: 'group' } | null }
  }
}

/** Returned in `included` when the request has `include=group`. */
interface DogApiGroup {
  id: string
  type: 'group'
  attributes: { name: string }
}

export interface DogApiBreedsResponse {
  data: DogApiBreed[]
  included?: DogApiGroup[]
  meta: {
    pagination: {
      current: number
      records: number
      // `next` and `last` are missing on the last page, `prev` on the first page
      first?: number
      prev?: number
      next?: number
      last?: number
    }
  }
}
