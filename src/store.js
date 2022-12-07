import { StoreConf } from '@web3-storage/access/stores/store-conf'

export class Store extends StoreConf {
  constructor () {
    super({ profile: 'w3up-client' })
  }
}
