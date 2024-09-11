import { v4 as uuidv4 } from 'uuid'

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
    { name: 'Client', value: '@artbycity/sdk' },
    { name: 'ArFS', value: '0.13' },
    { name: 'Content-Type', value: 'application/json' },
    { name: 'Drive-Id', value: opts.driveId },
    { name: 'Drive-Privacy', value: opts.drivePrivacy },
    { name: 'Entity-Type', value: 'drive' },
    { name: 'Unix-Time', value: opts.unixTime }
  ]
}

export function generateArFSFolderTags(opts: {
  driveId: string,
  folderId: string,
  unixTime: string,
  setAsPublicationRoot?: boolean
}) {
  const tags = [
    { name: 'Client', value: '@artbycity/sdk' },
    { name: 'ArFS', value: '0.13' },
    { name: 'Content-Type', value: 'application/json' },
    { name: 'Drive-Id', value: opts.driveId },
    { name: 'Entity-Type', value: 'folder' },
    { name: 'Folder-Id', value: opts.folderId },
    { name: 'Unix-Time', value: opts.unixTime }
  ]

  if (opts.setAsPublicationRoot) {
    tags.push({ name: 'Folder-Type', value: 'publications' })
  }

  return tags
}

export function generateArFSFileTags(opts: ArFSOpts & { fileId?: string }) {
  return [
    { name: 'Client', value: '@artbycity/sdk' },
    { name: 'ArFS', value: '0.13' },
    { name: 'Content-Type', value: 'application/json' },
    { name: 'Drive-Id', value: opts.driveId },
    { name: 'Entity-Type', value: 'file' },
    { name: 'File-Id', value: opts.fileId || uuidv4() },
    { name: 'Parent-Folder-Id', value: opts.folderId },
    { name: 'Unix-Time', value: opts.unixTime }
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
