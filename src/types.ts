import { Driver } from '@web3-storage/access/drivers/types'
import { AgentDataExport } from '@web3-storage/access/types'
import { Client } from './client'
import { ServiceConf } from './service'

export interface ClientFactoryOptions {
  store?: Driver<AgentDataExport>
  serviceConf?: ServiceConf
}

export interface ClientFactory {
  (options?: ClientFactoryOptions): Promise<Client>
}
