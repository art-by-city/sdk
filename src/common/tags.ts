import { PublicationOptions } from '../publications'

const AOS_MODULE_ID = 'cbn0KKrBZH7hdNkNokuXLtGryrWM--PjSTBqIzw9Kkk'
const SCHEDULER_ID = '_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA'

export function generateArtByCityTags() {
  return [
    { name: 'Protocol', value: 'ArtByCity' },
    { name: 'Client', value: '@artbycity/sdk' }
  ]
}

export type Topic = { name?: string, value: string }

export function generateAns110Tags(
  opts: PublicationOptions
) {
  const tags = [
    { name: 'Title', value: opts.title.substring(0, 150) },
    { name: 'Type', value: opts.type }
  ]

  if (opts.description) {
    tags.push(
      { name: 'Description', value: opts.description.substring(0, 300) }
    )
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
    ? { name: `Topic:${topic.name}`, value: topic.value }
    : { name: 'Topic', value: topic.value }
  ))

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

export function generateAtomicLicenseTags(
  contractSrcId: string,
  initState: string
) {
  return [
    // SmartWeave Contract Atomic License Tags
    { name: 'App-Name', value: 'SmartWeaveContract' },
    { name: 'App-Version', value: '0.3.0' },
    { name: 'Contract-Src', value: contractSrcId },
    { name: 'Init-State', value: initState },

    // AO Process Atomic License Tags
    { name: 'Data-Protocol', value: 'ao' },
    { name: 'Variant', value: 'ao.TN.1' },
    { name: 'Type', value: 'Process' },
    { name: 'Module', value: AOS_MODULE_ID },
    { name: 'Scheduler', value: SCHEDULER_ID },
    { name: 'SDK', value: '@artbycity/sdk' }
  ]
}

export function generatePrimaryAssetTags(
  opts: PublicationOptions,
  atomicLicenseContractSrcId: string,
  atomicLicenseInitialState: string
) {
  const tags = [
    ...generateAns110Tags(opts),
    ...generateAtomicLicenseTags(
      atomicLicenseContractSrcId,
      atomicLicenseInitialState
    )
  ]

  if (opts.slug) {
    tags.push({ name: 'Slug', value: opts.slug })
  }

  return tags
}
