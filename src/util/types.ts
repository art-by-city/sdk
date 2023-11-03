export interface JWKPublicInterface {
  kty: string;
  e: string;
  n: string;
}
export interface JWKInterface extends JWKPublicInterface {
  d?: string;
  p?: string;
  q?: string;
  dp?: string;
  dq?: string;
  qi?: string;
}

export interface ARFSFileTags {
  ArFS: 0.13
  ['Entity-Type']: 'file'
  ['Content-Type']: 'application/json'
  ['Drive-Id']: string // UUID
  ['File-Id']: string // UUID
  ['Unix-Time']: string // seconds since unix epoch

  // Drive Path
  ['Parent-Folder-Id']?: string // UUID

  // Private Files
  Cipher?: 'AES256-GCM'
  ['Cipher-IV']?: string
}

export interface ARFSFileMetadata {
  /* user defined file name with extension */
  name: string

  /* integer - computed file size */
  size: number

  /*
    integer - timestamp for OS reported time of file's last modified date
    represented as milliseconds since unix epoch
  */
  lastModifiedDate: number

  /* transaction id of stored data */
  dataTxId: string

  /* the mime type of the data associated with this file entity */
  dataContentType: string,

  /*
    optional - the address of the original owner of the data where the file is
    pointing to
  */
  pinnedDataOwner: string
}

export type WithRequired<
  T,
  K extends keyof T
> = T & { [P in K]-?: NonNullable<T[P]> }

export function assertHasValueForKey<T, K extends keyof T>(
  obj: T,
  key: K
): asserts obj is WithRequired<T, K> {
  if (obj[key] == null) { throw new Error(`${String(key)} is required`) }
}
