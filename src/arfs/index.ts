import { v4 as uuidv4 } from 'uuid'
import { Tag } from 'warp-contracts'

export { default as ArFSClient } from './arfs'
export { default as AuthenticatedArFSClient } from './authenticated-arfs'

export interface ArFSOpts {
  address: string
  driveId: string
  folderId: string
  unixTime: string
}

export function generateArFSDriveTags(opts: {
  driveId: string,
  drivePrivacy: 'public',
  unixTime: string
}) {
  return [
    new Tag('Client', '@artbycity/sdk'),
    new Tag('ArFS', '0.13'),
    new Tag('Content-Type', 'application/json'),
    new Tag('Drive-Id', opts.driveId),
    new Tag('Drive-Privacy', opts.drivePrivacy),
    new Tag('Entity-Type', 'drive'),
    new Tag('Unix-Time', opts.unixTime)
  ]
}

export function generateArFSFolderTags(opts: {
  driveId: string,
  folderId: string,
  unixTime: string,
  setAsPublicationRoot?: boolean
}) {
  const tags = [
    new Tag('Client', '@artbycity/sdk'),
    new Tag('ArFS', '0.13'),
    new Tag('Content-Type', 'application/json'),
    new Tag('Drive-Id', opts.driveId),
    new Tag('Entity-Type', 'folder'),
    new Tag('Folder-Id', opts.folderId),
    new Tag('Unix-Time', opts.unixTime)
  ]

  if (opts.setAsPublicationRoot) {
    tags.push(new Tag('Folder-Type', 'publications'))
  }

  return tags
}

export function generateArFSFileTags(opts: ArFSOpts & { fileId?: string }) {
  return [
    new Tag('Client', '@artbycity/sdk'),
    new Tag('ArFS', '0.13'),
    new Tag('Content-Type', 'application/json'),
    new Tag('Drive-Id', opts.driveId),
    new Tag('Entity-Type', 'file'),
    new Tag('File-Id', opts.fileId || uuidv4()),
    new Tag('Parent-Folder-Id', opts.folderId),
    new Tag('Unix-Time', opts.unixTime)
  ]
}

export interface ArFSFileMetadata {
  name: string
  size: number
  lastModifiedDate: number
  dataTxId: string
  dataContentType: string
  title?: string
  description?: string
}
