export { default } from './legacy'

export interface ArtworkBundle {
  id: string
  manifestId: string
  category: 'artwork:bundle'
  slug: string
  contractSrc?: string
}

// {name: 'Protocol', value: 'ArtByCity'}
// {name: 'App-Name', value: 'ArtByCity'}
// {name: 'App-Version', value: '0.0.1-alpha'}
// {name: 'Bundle-Format', value: 'binary'}
// {name: 'Bundle-Version', value: '2.0.0'}
// {name: 'Category', value: 'artwork:bundle'}
// {name: 'slug', value: 'desoghost-266-common'}
// {name: 'Manifest-ID', value: 'Vg_9JZaXIlaylei4YifZYsKmxxw2jRS3ZPHKHb3lnZ4'}
// {name: 'App-Name', value: 'SmartWeaveContract'}
// {name: 'App-Version', value: '0.3.0'}
// {name: 'Contract-Src', value: 'OKBWuNioWGMqKYYeoM9jsWiX4SHKOpLZe24_T-Yd-_o'}
// {name: 'Init-State', value: '{"owner":"qoFt_qa74r8rPAIeZVd7wJUdQwLi8_7NvDOxs1dWf3c"}'}