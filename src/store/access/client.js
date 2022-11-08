import * as API from '@ucanto/interface' // eslint-disable-line no-unused-vars
import * as Client from '@ucanto/client'
import { Verifier } from '@ucanto/principal/ed25519'
import * as CAR from '@ucanto/transport/car'
import * as CBOR from '@ucanto/transport/cbor'
import * as HTTP from '@ucanto/transport/http'
import { fetch as defaultFetch } from 'cross-fetch'

// @ts-ignore
export * from '@web3-storage/access/capabilities/identity'
// @ts-ignore
export * from '@web3-storage/access/capabilities/account'
// @ts-ignore
export * from '@web3-storage/access/capabilities/voucher'

/**
 * @param {object} options
 * @param {API.DID} options.id
 * @param {URL} options.url
 * @param {string} [options.method]
 * @param {HTTP.Fetcher} [options.fetch]
 * @param {API.OutpboundTranpsortOptions} [options.transport]
 * @returns { import('@ucanto/interface').ConnectionView<any> }
 */
export function createConnection ({
  id,
  url,
  transport = { encoder: CAR, decoder: CBOR },
  fetch = defaultFetch,
  method
}) {
  return Client.connect({
    id: Verifier.parse(id),
    ...transport,
    channel: HTTP.open({
      url,
      fetch,
      method
    })
  })
}
