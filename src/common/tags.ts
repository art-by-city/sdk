export function generateArtByCityTags() {
  return [
    { name: 'Protocol', value: 'ArtByCity' },
    { name: 'Client', value: '@artbycity/sdk' }
  ]
}

export type Ans110Params = {
  title: string
  type: string
  description?: string
  topics?: string[]
}

export function generateAns110Tags(
  { title, type, description, topics }: Ans110Params
) {
  const tags = [
    { name: 'Title', value: title.substring(0, 150) },
    { name: 'Type', value: type }
  ]

  if (description) {
    tags.push({ name: 'Description', value: description.substring(0, 300)})
  }

  if (topics) {
    tags.push(...topics.map(topic => { return { name: 'Topic', value: topic }}))
  }

  return tags
}

export function generateArfsTags() {
  const tags = [
    { name: 'ArFS', value: '0.13' },
    // TODO -> other ArFS tags
  ]

  return tags
}

export function generateRelatedToTags(
  relatedTo: string,
  width?: string,
  height?: string
) {
  const tags = [{ name: 'Related-To', value: relatedTo }]

  if (width) {
    tags.push({ name: 'Width', value: width })
  }

  if (height) {
    tags.push({ name: 'Height', value: height })
  }

  return tags
}
