import assert from 'assert'
import { connect } from '@ucanto/client'
import * as Server from '@ucanto/server'
import { provide } from '@ucanto/server'
import * as CAR from '@ucanto/transport/car'
import * as CBOR from '@ucanto/transport/cbor'
import * as Signer from '@ucanto/principal/ed25519'
import * as StoreCapabilities from '@web3-storage/capabilities/store'
import * as UploadCapabilities from '@web3-storage/capabilities/upload'
import { AgentData } from '@web3-storage/access/agent'
import { randomBytes } from './helpers/random.js'
import { toCAR } from './helpers/car.js'
import { mockService } from './helpers/mocks.js'
import { File } from './helpers/shims.js'
import { Client } from '../src/client.js'

/**
 * @param {import('@ucanto/interface').ServerView} server 
 */
async function mockServiceConf (server) {
  const connection = connect({
    id: server.id,
    encoder: CAR,
    decoder: CBOR,
    channel: server,
  })
  return { access: connection, upload: connection }
}

describe('Client', () => {
  describe('uploadFile', () => {
    it('should upload a file to the service', async () => {
      const bytes = await randomBytes(128)
      const file = new Blob([bytes])
      const expectedCar = await toCAR(bytes)

      /** @type {import('@web3-storage/upload-client/types').CARLink|undefined} */
      let carCID

      const service = mockService({
        store: {
          add: provide(StoreCapabilities.add, ({ invocation }) => {
            assert.equal(invocation.issuer.did(), client.agent().did())
            assert.equal(invocation.capabilities.length, 1)
            const invCap = invocation.capabilities[0]
            assert.equal(invCap.can, StoreCapabilities.add.can)
            assert.equal(invCap.with, client.currentSpace()?.did())
            return {
              status: 'upload',
              headers: { 'x-test': 'true' },
              url: 'http://localhost:9200',
            }
          })
        },
        upload: {
          add: provide(UploadCapabilities.add, ({ invocation }) => {
            assert.equal(invocation.issuer.did(), client.agent().did())
            assert.equal(invocation.capabilities.length, 1)
            const invCap = invocation.capabilities[0]
            assert.equal(invCap.can, UploadCapabilities.add.can)
            assert.equal(invCap.with, client.currentSpace()?.did())
            assert.equal(invCap.nb?.shards?.length, 1)
            assert.equal(String(invCap.nb?.shards?.[0]), carCID?.toString())
            return {
              root: expectedCar.roots[0],
              shards: [expectedCar.cid],
            }
          })
        }
      })

      const server = Server.create({
        id: await Signer.generate(),
        service,
        decoder: CAR,
        encoder: CBOR,
      })

      const data = await AgentData.create()
      const client = new Client(data, { serviceConf: await mockServiceConf(server) })

      const { did } = await client.createSpace()
      await client.setCurrentSpace(did)

      const dataCID = await client.uploadFile(file, {
        onShardStored: meta => { carCID = meta.cid }
      })

      assert(service.store.add.called)
      assert.equal(service.store.add.callCount, 1)
      assert(service.upload.add.called)
      assert.equal(service.upload.add.callCount, 1)

      assert.equal(carCID?.toString(), expectedCar.cid.toString())
      assert.equal(dataCID.toString(), expectedCar.roots[0].toString())
    })

    it('should not allow upload without a current space', async () => {
      const data = await AgentData.create()
      const client = new Client(data)

      const bytes = await randomBytes(128)
      const file = new Blob([bytes])

      await assert.rejects(client.uploadFile(file), { message: 'missing current space: use createSpace() or setCurrentSpace()' })
    })
  })

  describe('uploadDirectory', () => {
    it('should upload a directory to the service', async () => {
      const files = [
        new File([await randomBytes(128)], '1.txt'),
        new File([await randomBytes(32)], '2.txt'),
      ]

      /** @type {import('@web3-storage/upload-client/types').CARLink|undefined} */
      let carCID

      const service = mockService({
        store: {
          add: provide(StoreCapabilities.add, ({ invocation }) => {
            assert.equal(invocation.issuer.did(), client.agent().did())
            assert.equal(invocation.capabilities.length, 1)
            const invCap = invocation.capabilities[0]
            assert.equal(invCap.can, StoreCapabilities.add.can)
            assert.equal(invCap.with, client.currentSpace()?.did())
            return {
              status: 'upload',
              headers: { 'x-test': 'true' },
              url: 'http://localhost:9200',
            }
          })
        },
        upload: {
          add: provide(UploadCapabilities.add, ({ invocation }) => {
            assert.equal(invocation.issuer.did(), client.agent().did())
            assert.equal(invocation.capabilities.length, 1)
            const invCap = invocation.capabilities[0]
            assert.equal(invCap.can, UploadCapabilities.add.can)
            assert.equal(invCap.with, client.currentSpace()?.did())
            assert.equal(invCap.nb?.shards?.length, 1)
            if (!invCap.nb) throw new Error('nb must be present')
            return invCap.nb
          })
        }
      })

      const server = Server.create({
        id: await Signer.generate(),
        service,
        decoder: CAR,
        encoder: CBOR,
      })

      const data = await AgentData.create()
      const client = new Client(data, { serviceConf: await mockServiceConf(server) })

      const { did } = await client.createSpace()
      await client.setCurrentSpace(did)

      const dataCID = await client.uploadDirectory(files, {
        onShardStored: meta => { carCID = meta.cid }
      })

      assert(service.store.add.called)
      assert.equal(service.store.add.callCount, 1)
      assert(service.upload.add.called)
      assert.equal(service.upload.add.callCount, 1)

      assert(carCID)
      assert(dataCID)
    })
  })

  describe('spaces', () => {
    it('should get agent spaces', async () => {
      const data = await AgentData.create()
      const client = new Client(data)

      const name = `space-${Date.now()}`
      const { did } = await client.createSpace(name)

      const spaces = client.spaces()
      assert.equal(spaces.length, 1)
      assert.equal(spaces[0].did(), did)
      assert.equal(spaces[0].name(), name)
    })
  })
})
