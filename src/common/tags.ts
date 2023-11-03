import { Tag } from 'warp-contracts'

export function generateArtByCityTags() {
  return [
    new Tag('Protocol', 'ArtByCity'),
    new Tag('Client', '@artbycity/sdk')
  ]
}

export type Ans110Params = {
  title: string
  type: string
  description?: string
  topics?: (string | { name: string, value: string })[]
}

export function generateAns110Tags(
  { title, type, description, topics }: Ans110Params
) {
  const tags = [
    new Tag('Title', title.substring(0, 150)),
    new Tag('Type', type)
  ]

  if (description) {
    tags.push(new Tag('Description', description.substring(0, 300)))
  }

  if (topics) {
    tags.push(...topics.map(topic => {
      if (typeof topic === 'string') {
        return new Tag('Topic', topic)
      }
      
      return new Tag(`Topic:${topic.name}`, topic.value)
    }))
  }

  return tags
}

export function generateRelatedToTags(
  relatedTo: string,
  width?: string,
  height?: string
) {
  const tags = [new Tag('Related-To', relatedTo)]

  if (width) {
    tags.push(new Tag('Width', width))
  }

  if (height) {
    tags.push(new Tag('Height', height))
  }

  return tags
}
