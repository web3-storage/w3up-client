/* eslint-env mocha */
import assert from 'assert'
import { RS256 } from '@ipld/dag-ucan/signature'
import { create } from '../src/index.js'

describe('Client.create', () => {
  it('should create RSA key', async () => {
    const client = await create()
    const signer = client.agent()
    assert(signer.signatureAlgorithm, 'RS256')
    assert(signer.signatureCode, RS256)
  })
})
