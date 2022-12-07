/* eslint-env mocha */
import assert from 'assert'
import { EdDSA } from '@ipld/dag-ucan/signature'
import { create } from '../src/index.node.js'

describe('Client.create', () => {
  it('should create Ed25519 key', async () => {
    const client = await create()
    const signer = client.agent()
    assert(signer.signatureAlgorithm, 'EdDSA')
    assert(signer.signatureCode, EdDSA)
  })
})
