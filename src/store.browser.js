import { StoreIndexedDB } from '@web3-storage/access/stores/store-indexeddb'

export class Store extends StoreIndexedDB {
  constructor () {
    super('w3up-client')
  }
}
