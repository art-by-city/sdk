import { Tag } from 'warp-contracts'

export { default as ArFSClient } from './arfs'
export { default as AuthenticatedArFSClient } from './authenticated'

export function generateArFSDriveTags({ driveId, drivePrivacy, unixTime }: {
  driveId: string,
  drivePrivacy: 'public',
  unixTime: string
}) {
  return [
    new Tag('Client', '@artbycity/sdk'),
    new Tag('ArFS', '0.13'),
    new Tag('Content-Type', 'application/json'),
    new Tag('Drive-Id', driveId),
    new Tag('Drive-Privacy', drivePrivacy),
    new Tag('Entity-Type', 'drive'),
    new Tag('Unix-Time', unixTime)
  ]
}

export function generateArFSFolderTags({ driveId, folderId, unixTime }: {
  driveId: string,
  folderId: string,
  unixTime: string
}) {
  return [
    new Tag('Client', '@artbycity/sdk'),
    new Tag('ArFS', '0.13'),
    new Tag('Content-Type', 'application/json'),
    new Tag('Drive-Id', driveId),
    new Tag('Entity-Type', 'folder'),
    new Tag('Folder-Id', folderId ),
    new Tag('Unix-Time', unixTime)
  ]
}

export function generateArFSFileTags({
  driveId,
  fileId,
  parentFolderId,
  unixTime
}: {
  driveId: string,
  fileId: string,
  parentFolderId: string,
  unixTime: string
}) {
  return [
    new Tag('Client', '@artbycity/sdk'),
    new Tag('ArFS', '0.13'),
    new Tag('Content-Type', 'application/json'),
    new Tag('Drive-Id', driveId),
    new Tag('Entity-Type', 'file'),
    new Tag('File-Id', fileId),
    new Tag('Parent-Folder-Id', parentFolderId),
    new Tag('Unix-Time', unixTime)
  ]
}
