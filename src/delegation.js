import { Delegation as CoreDelegation } from '@ucanto/core/delegation'

/**
 * @template {import('@ucanto/interface').Capabilities} C
 * @extends {CoreDelegation<C>}
 */
export class Delegation extends CoreDelegation {
  /** @type {Record<string, any>} */
  #meta

  /**
   * @param {import('@ucanto/interface').UCANBlock<C>} root
   * @param {Map<string, import('@ucanto/interface').Block>} [blocks]
   * @param {Record<string, any>} [meta]
   */
  constructor (root, blocks, meta = {}) {
    super(root, blocks)
    this.#meta = meta
  }

  /**
   * User defined delegation metadata.
   */
  meta () {
    return this.#meta
  }
}
