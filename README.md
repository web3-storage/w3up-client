<h1 align="center">⁂<br/>web3.storage</h1>
<p align="center">The main JavaScript client for the w3up platform by <a href="https://web3.storage">https://web3.storage</a></p>

`@web3-storage/w3up-client` is a JavaScript libary that provides a convenient interface to the w3up platform, a simple "on-ramp" to the content-addressed decentralized IPFS network.

This library is the user-facing "porcelain" client for interacting with w3up services from JavaScript. It wraps the lower-level [`@web3-storage/access`][access-client-github] and [`@web3-storage/upload-client`][upload-client-github] client packages, which target individual w3up services. We recommend using `w3up-client` instead of using those "plumbing" packages directly, but you may find them useful if you need more context on w3up's architecture and internals.

- [Install](#install)
- [Core concepts](#core-concepts)
- [Basic usage](#basic-usage)
  - [Creating a client object](#creating-a-client-object)
  - [Creating and registering Spaces](#creating-and-registering-spaces)
  - [Uploading data](#uploading-data)

## Install

You can add the `@web3-storage/w3up-client` package to your JavaScript or TypeScript project with `npm`:

```sh
npm install @web3-storage/w3up-client
```

Or with `yarn`:

```
yarn add @web3-storage/w3up-client

```

## Core concepts

w3up services use [ucanto][ucanto], a Remote Proceedure Call (RPC) framework built around [UCAN](https://ucan.xzy), or User Controlled Authorization Networks. UCANs are a powerful capability-based authorization system that allows fine-grained sharing of permissions through a process called _delegation_. See our [intro to UCAN blog post](https://blog.web3.storage/posts/intro-to-ucan) for an overview of UCAN.

`w3up-client` and `ucanto` take care of the details of UCANs for you, but a few of the underlying terms and concepts may "bubble up" to the surface of the API, so we'll cover the basics here. We'll also go over some terms that are specific to w3up that you might not have encountered elsewhere.

UCAN-based APIs are centered around _capabilities_, which are comprised of an _ability_ and a _resource_. Together, the ability and resource determine what action a client can perform and what objects in the system can be acted upon. When invoking a service method, a client will present a UCAN token that includes an ability and resource, along with _proofs_ that verify that they should be allowed to exercise the capability.

To invoke a capability, the client must have a private signing key, which is managed by a component called an _Agent_. When you [create a client object](#creating-a-client-object) with `w3up-client`, an Agent is automatically created for you and used when making requests. The Agent's keys and metadata are securely stored and are loaded the next time you create a client. 

Each device or browser should create its own Agent, so that private keys are never shared across multiple devices. Instead of sharing keys, a user can delegate some or all of their capabilites from one Agent to another.

When you upload data to w3up, your uploads are linked to a unique _Space_ acts as a "namespace" for the data you upload. Spaces are used to keep track of which uploads belong to which users, among other things.

When invoking storage capabilities, the Space ID is the "resource" portion of the capability, while the ability is an action like `store/add` or `store/remove`.

Both Agents and Spaces are identified using _DIDs_, or Decentralized Identity Documents. DIDs are a [W3C specification](https://www.w3.org/TR/did-core/) for verifiable identities in decentralized systems. There are several DID "methods," but the ones most commonly used by w3up are [`did:key`](https://w3c-ccg.github.io/did-method-key/), which includes a public key directly in the DID string. Agents and Spaces both use `did:key` URI strings as their primary identifiers. The other DID method used by w3up is [`did:web`](https://w3c-ccg.github.io/did-method-web/), which is used to identify the service providers.

Agents and Spaces are both generated by `w3up-client` on the user's local machine. Before they can be used for storage, the user will need to [register the space](#creating-and-registering-spaces) by confirming their email address. Once registered, a Space can be used to [upload files and directories](#uploading-data).

## Basic usage

This section shows some of the basic operations available in the `w3up-client` package. See the [API reference docs][docs] or the source code of the [`w3up-cli` package][w3up-cli-github], which uses `w3up-client` throughout.

### Creating a client object

The package provides a [static `create` function][docs-create] that returns a [`Client` object][docs-Client]. 

```js
import { create } from '@web3-storage/w3up-client'

const client = await create()
```

By default, clients will be configured to use the production w3up service endpoints, and the client will create a new [`Agent`][access-docs-Agent] with a persistent `Store` if it can't find one locally to load.

Agents are entities that control the private signing keys used to interact with the w3up service layer. You can access the client's `Agent` with the [`agent()` accessor method][docs-Client#agent]. 

`create` accepts an optional [`ClientFactoryOptions` object][docs-ClientFactoryOptions], which can be used to target a non-production instance of the w3up access and upload services, or to use a non-default persistent `Store`. See the [`@web3-storage/access` docs](https://web3-storage.github.io/w3protocol/modules/_web3_storage_access.html) for more about `Store` configuration.

### Creating and registering Spaces

Before you can upload data, you'll need to create a [`Space`][docs-Space] and register it with the service.

A Space acts as a namespace for your uploads. Spaces are created using the [`createSpace` client method][docs-client#createSpace]:

```js
const space = await client.createSpace('my-awesome-space')
```

The name parameter is optional. If provided, it will be stored in your client's local state store and can be used to provide a friendly name for user interfaces.

After creating a `Space`, you'll need to register it with the w3up service before you can upload data.

First, set the space as your "current" space using the [`setCurrentSpace` method][docs-Client#setCurrentSpace], passing in the DID of the `space` object you created above:

```js
await client.setCurrentSpace(space.did())
```

Next, call the [`registerSpace` method][docs-Client#registerSpace], passing in an email address to register as the primary contact for the space:

```js
try {
  await client.registerSpace('zaphod@beeblebrox.galaxy')
} catch (err) {
  console.error('registration failed: ', err)
}
```

Calling `registerSpace` will cause an email to be sent to the given address. Once a user clicks the confirmation link in the email, the `registerSpace` method will resolve. Make sure to check for errors, as `registerSpace` will fail if the email is not confirmed within the expiration timeout.

Registering a space enrolls it in web3.storage's free usage tier, allowing you to store files, list uploads, etc.

### Uploading data

Once you've [created and registered a space](#creating-and-registering-spaces), you can upload files to the w3up platform.

Call [`uploadFile`][docs-Client#uploadFile] to upload a single file, or [`uploadDirectory`][docs-Client#uploadDirectory] to upload multiple files.

`uploadFile` expects a "Blob like" input, which can be a [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) or [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File) when running in a browser. On node.js, see the [`filesFromPath` library](https://github.com/web3-storage/files-from-path), which can load compatible objects from the local filesystem.

`uploadDirectory` requires `File`-like objects instead of `Blob`s, as the file's `name` property is used to build the directory hierarchy. 

You can control the directory layout and create nested directory structures by using `/` delimited paths in your filenames:

```js
const files = [
  new File(['some-file-content'], 'readme.md'),
  new File(['import foo'], 'src/main.py'),
  new File([someBinaryData], 'images/example.png'),
]

const directoryCid = await client.storeDirectory(files)
```

In the example above, `directoryCid` resolves to an IPFS directory with the following layout:

```
.
├── images
│   └── example.png
├── readme.md
└── src
    └── main.py
```


[w3up-cli-github]: https://github.com/web3-storage/w3up-cli
[access-client-github]: https://github.com/web3-storage/w3protocol/tree/main/packages/access-client
[upload-client-github]: https://github.com/web3-storage/w3protocol/tree/main/packages/upload-client
[elastic-ipfs]: https://github.com/elastic-ipfs/elastic-ipfs
[ucanto]: https://github.com/web3-storage/ucanto
[car-spec]: https://ipld.io/specs/transport/car/
[web3storage-docs-cars]: https://web3.storage/docs/how-tos/work-with-car-files/

[docs]: https://web3-storage.github.io/w3up-client
[docs-Client]: https://web3-storage.github.io/w3up-client/classes/client.Client.html
[docs-Client#agent]: https://web3-storage.github.io/w3up-client/classes/client.Client.html#agent
[docs-Client#createSpace]: https://web3-storage.github.io/w3up-client/classes/client.Client.html#createSpace
[docs-Client#setCurrentSpace]: https://web3-storage.github.io/w3up-client/classes/client.Client.html#setCurrentSpace
[docs-Client#registerSpace]: https://web3-storage.github.io/w3up-client/classes/client.Client.html#registerSpace
[docs-Client#uploadFile]: https://web3-storage.github.io/w3up-client/classes/client.Client.html#uploadFile
[docs-Client#uploadDirectory]: https://web3-storage.github.io/w3up-client/classes/client.Client.html#uploadDirectory 
[docs-Space]: https://web3-storage.github.io/w3up-client/classes/space.Space.html

[docs-create]: https://web3-storage.github.io/w3up-client/functions/index.create.html
[docs-ClientFactoryOptions]: https://web3-storage.github.io/w3up-client/interfaces/types.ClientFactoryOptions.html

[access-docs-Agent]: https://web3-storage.github.io/w3protocol/classes/_web3_storage_access.Agent.html