import type { DogApiBreed, DogApiBreedsResponse } from '@/api/dogApiTypes'

/** A breed shaped like the real Dog API v2 response (trimmed to the fields the app reads). */
export function createDogApiBreed(name: string): DogApiBreed {
  const id = `breed-${name.toLowerCase()}`
  return {
    id,
    type: 'breed',
    attributes: {
      name,
      description: `${name} is a friendly test dog.`,
      life: { min: 14, max: 16 },
      male_weight: { min: 4, max: 6 },
      female_weight: { min: 4, max: 5 },
      hypoallergenic: true,
      origin: { country: 'Germany' },
      images: [
        {
          id: `${id}-image`,
          url: `https://images.example.test/${id}.webp`,
          thumb: `https://images.example.test/${id}-thumb.webp`,
          medium: `https://images.example.test/${id}-medium.webp`,
          large: `https://images.example.test/${id}-large.webp`,
          attribution: {
            author: 'Jane Doe',
            license: 'CC BY-SA 4.0',
            license_url: 'https://creativecommons.org/licenses/by-sa/4.0/',
            source_url: 'https://commons.wikimedia.org/wiki/File:Example.jpg',
          },
        },
      ],
    },
    relationships: { group: { data: { id: 'group-toy', type: 'group' } } },
  }
}

export function createBreedsResponse({
  page = 1,
  names = ['Affenpinscher', 'Akita'],
  last = 12 as number | undefined,
  records = 283,
} = {}): DogApiBreedsResponse {
  return {
    data: names.map(createDogApiBreed),
    included: [{ id: 'group-toy', type: 'group', attributes: { name: 'Toy Group' } }],
    meta: { pagination: { current: page, last, records } },
  }
}
