import { connect } from '@ucanto/client'
import { CAR, CBOR, HTTP } from '@ucanto/transport'
import * as DID from '@ipld/dag-ucan/did'

/**
 * @typedef {{
 *   access: import('@ucanto/interface').ConnectionView<import('@web3-storage/access/types').Service>
 *   upload: import('@ucanto/interface').ConnectionView<import('@web3-storage/upload-client/types').Service>
 * }} ServiceConf
 */

export const accessServiceURL = new URL('https://w3access-staging.protocol-labs.workers.dev')
export const accessServicePrincipal = DID.parse('did:key:z6MkwTYX2JHHd8bmaEuDdS1LJjrpFspirjDcQ4DvAiDP49Gm')

export const accessServiceConnection = connect({
  id: accessServicePrincipal,
  encoder: CAR,
  decoder: CBOR,
  channel: HTTP.open({
    url: accessServiceURL,
    method: 'POST'
  })
})

export const uploadServiceURL = new URL('https://staging.up.web3.storage')
export const uploadServicePrincipal = DID.parse('did:key:z6MkhcbEpJpEvNVDd3n5RurquVdqs5dPU16JDU5VZTDtFgnn')

export const uploadServiceConnection = connect({
  id: uploadServicePrincipal,
  encoder: CAR,
  decoder: CBOR,
  channel: HTTP.open({
    url: uploadServiceURL,
    method: 'POST'
  })
})

/** @type {ServiceConf} */
export const serviceConf = {
  access: accessServiceConnection,
  upload: uploadServiceConnection
}
