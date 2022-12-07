import * as Server from '@ucanto/server'

const notImplemented = () => {
  throw new Server.Failure('not implemented')
}

/**
 * @param {Partial<{
 *   store: Partial<import('@web3-storage/upload-client/types').Service['store']>
 *   upload: Partial<import('@web3-storage/upload-client/types').Service['upload']>
 *   voucher: Partial<import('@web3-storage/access/types').Service['voucher']>
 *   space: Partial<import('@web3-storage/access/types').Service['space']>
 * }>} impl
 */
export function mockService (impl) {
  return {
    store: {
      add: withCallCount(impl.store?.add ?? notImplemented),
      list: withCallCount(impl.store?.list ?? notImplemented),
      remove: withCallCount(impl.store?.remove ?? notImplemented)
    },
    upload: {
      add: withCallCount(impl.upload?.add ?? notImplemented),
      list: withCallCount(impl.upload?.list ?? notImplemented),
      remove: withCallCount(impl.upload?.remove ?? notImplemented)
    },
    voucher: {
      claim: withCallCount(impl.voucher?.claim ?? notImplemented),
      redeem: withCallCount(impl.voucher?.redeem ?? notImplemented)
    },
    space: {
      info: withCallCount(impl.account?.info ?? notImplemented),
      'recover-validation': withCallCount(impl.account?.['recover-validation'] ?? notImplemented)
    }
  }
}

/**
 * @template {Function} T
 * @param {T} fn
 */
function withCallCount (fn) {
  /** @param {T extends (...args: infer A) => any ? A : never} args */
  const countedFn = (...args) => {
    countedFn.called = true
    countedFn.callCount++
    return fn(...args)
  }
  countedFn.called = false
  countedFn.callCount = 0
  return countedFn
}
