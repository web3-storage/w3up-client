import { AgentData } from '@web3-storage/access/agent'
import { StoreIndexedDB } from '@web3-storage/access/stores/store-indexeddb'
import { generate } from '@ucanto/principal/rsa'
import { Client } from './client.js'

/**
 * Create a new upload client.
 *
 * If no backing store is passed one will be created that is appropriate for
 * the environment.
 *
 * If the backing store is empty, a new signing key will be generated and
 * persisted to the store. In the browser an unextractable RSA key will be
 * generated by default. In other environments an Ed25519 key is generated.
 *
 * If the backing store already has data stored, it will be loaded and used.
 * 
 * @type {import('./types').ClientFactory}
 */
export async function create (options = {}) {
  const store = options.store ?? new StoreIndexedDB('w3up-client')
  const raw = await store.load()
  if (raw) return new Client(AgentData.fromExport(raw, { store }), options)
  const principal = await generate()
  const data = await AgentData.create({ principal }, { store })
  return new Client(data, options)
}

export { Client }
