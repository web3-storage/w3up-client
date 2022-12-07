import { Base } from '../base.js'

/**
 * Client for interacting with the `space/*` capabilities.
 */
export class SpaceClient extends Base {
  /**
   * Get information about a space.
   *
   * @param {import('@ucanto/interface').DID} space DID of the space to retrieve info about.
   */
  async info (space) {
    return await this._agent.getSpaceInfo(space)
  }

  /**
   * Recover the current space.
   *
   * @param {string} email Email address to send recovery emaail to.
   */
  async recover (email) {
    return await this._agent.recover(email)
  }
}
