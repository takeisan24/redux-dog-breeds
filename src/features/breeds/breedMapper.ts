import type { DogApiBreed, DogApiBreedsResponse } from '@/api/dogApiTypes'
import type { Breed, BreedPhoto, BreedsPage } from '@/features/breeds/breedTypes'

/** Converts a raw Dog API response into the app's `BreedsPage`. */
export function mapBreedsResponse(response: DogApiBreedsResponse, pageSize: number): BreedsPage {
  const groupNameById = new Map(
    (response.included ?? []).map((group) => [group.id, group.attributes.name]),
  )
  const { current, last, records } = response.meta.pagination

  return {
    breeds: response.data.map((breed) => mapBreed(breed, groupNameById)),
    pagination: {
      currentPage: current,
      // `last` is missing on the last page (and beyond), so fall back to counting pages
      lastPage: last ?? Math.max(1, Math.ceil(records / pageSize)),
      totalRecords: records,
      pageSize,
    },
  }
}

function mapBreed(breed: DogApiBreed, groupNameById: Map<string, string>): Breed {
  const { attributes } = breed
  const groupId = breed.relationships?.group?.data?.id

  return {
    id: breed.id,
    name: attributes.name,
    description: attributes.description,
    groupName: (groupId && groupNameById.get(groupId)) || null,
    lifeSpan: attributes.life,
    maleWeight: attributes.male_weight,
    femaleWeight: attributes.female_weight,
    isHypoallergenic: attributes.hypoallergenic,
    originCountry: attributes.origin?.country || null,
    photo: mapPhoto(attributes.images),
  }
}

function mapPhoto(images: DogApiBreed['attributes']['images']): BreedPhoto | null {
  const image = images?.[0]
  if (!image) return null

  return {
    url: image.medium,
    author: image.attribution?.author || null,
    license: image.attribution?.license || null,
    sourceUrl: image.attribution?.source_url || null,
  }
}
