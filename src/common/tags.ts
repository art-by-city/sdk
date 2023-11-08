import { Tag } from 'warp-contracts'
import { PublicationOptions } from '../publications'

export function generateArtByCityTags() {
  return [
    new Tag('Protocol', 'ArtByCity'),
    new Tag('Client', '@artbycity/sdk')
  ]
}

export type Topic = { name?: string, value: string }

export function generateAns110Tags(
  opts: PublicationOptions
) {
  const tags = [
    new Tag('Title', opts.title.substring(0, 150)),
    new Tag('Type', opts.type)
  ]

  if (opts.description) {
    tags.push(new Tag('Description', opts.description.substring(0, 300)))
  }

  const topics: Topic[] = []
  if (opts.city) {
    topics.push({ name: 'city', value: opts.city })
  }
  if (opts.medium) {
    topics.push({ name: 'medium', value: opts.medium })
  }
  if (opts.genre) {
    topics.push({ name: 'genre', value: opts.genre })
  }

  tags.push(...topics.map(topic => topic.name
    ? new Tag(`Topic:${topic.name}`, topic.value)
    : new Tag('Topic', topic.value)
  ))

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

export function generateAtomicLicenseTags(
  contractSrcId: string,
  initState: string
) {
  return [
    new Tag('App-Name', 'SmartWeaveContract'),
    new Tag('App-Version', '0.3.0'),
    new Tag('Contract-Src', contractSrcId),
    new Tag('Init-State', initState)
  ]
}
