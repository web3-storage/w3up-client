## `w3up-client`

> A client SDK for the w3up service, providing content addressed storage for any application.

`@web3-storage/w3up-client` is a JavaScript libary that provides a convenient interface to the w3up platform, a simple "on-ramp" to the content-addressed decentralized IPFS network.

This library is the user-facing "porcelain" client for interacting with w3up services from JavaScript. It wraps the lower-level [`@web3-storage/access`][access-client-github] and [`@web3-storage/upload-client`][upload-client-github] client packages, which target individual w3up services. We recommend using `w3up-client` instead of using those "plumbing" packages directly, but you may find them useful if you need more context on w3up's architecture and internals.

<!-- TODO: bring this link back once w3up-client-examples have been updated: 
Visit [w3up-client-examples](https://github.com/web3-storage/w3up-client-examples/tree/main/nodejs/simple-upload) for examples on how to use w3up-client in practice.
-->

## Install

You can add the `@web3-storage/w3up-client` package to your JavaScript or TypeScript project with `npm`:

```sh
npm install @web3-storage/w3up-client
```

Or with `yarn`:

```
yarn add @web3-storage/w3up-client

```

## Basic Usage

This section shows some of the basic operations available in the `w3up-client` package. See the [API reference docs][docs] or the source code of the [`w3up-cli` package][w3up-cli-github], which uses `w3up-client` throughout.

### Creating a client object

The package provides a [static `create` function][docs-create] that returns a [`Client` object][docs-Client]. 

```js
import { create } from '@web3-storage/w3up-client'

const client = await create()
```

By default, clients will be configured to use the production w3up service endpoints, and will create a new [`Agent`][access-docs-Agent] with a persistent `Store` if it can't find one locally to load.

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

First, set the space as your "current" space using the [`setCurrentSpace` method][docs-Client#setCurrentSpace], passing in the `did` field of the `space` object you created above:

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