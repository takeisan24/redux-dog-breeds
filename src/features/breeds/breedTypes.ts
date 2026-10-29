/** The app's own data types. Simpler than the raw Dog API shapes in `api/dogApiTypes.ts`. */

interface NumberRange {
  min: number
  max: number
}

export interface BreedPhoto {
  url: string
  // Most photos are CC BY / CC BY-SA, which require crediting the author
  author: string | null
  license: string | null
  sourceUrl: string | null
}

export interface Breed {
  id: string
  name: string
  description: string
  groupName: string | null
  lifeSpan: NumberRange // years
  maleWeight: NumberRange // kg
  femaleWeight: NumberRange // kg
  isHypoallergenic: boolean
  originCountry: string | null
  photo: BreedPhoto | null
}

export interface PaginationInfo {
  currentPage: number
  lastPage: number
  totalRecords: number
  pageSize: number
}

export interface BreedsPage {
  breeds: Breed[]
  pagination: PaginationInfo
}
