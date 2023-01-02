# Public Siging Key

The `homelab-*` repositories sign artifacts (such as Docker images) during the build process to verify the artifacts before using/running them (i.e. to verify the supply chain).

For siging purposes, [Sigstore cosign](https://www.sigstore.dev) is used.

## Installation

Have a look at the [installation documentation](https://docs.sigstore.dev/cosign/installation/) for the different ways of installing `cosign` and/or `sget` (Homebrew, Docker, Linux packages, etc).

## Verification of the Public Key

Cosign allows to verify Docker images and file blobs. To e.g. verify the `cosing.pub` public key in this repository, you can run:

```shell
cosign verify-blob --key cosign.pub --signature $(cat cosign.pub.sig) cosign.pub
```

The public key is also available in the GitHub packages registry. To securely download (i.e. with verification) the key from there, run:

```shell
sget --key cosign.pub ghcr.io/busybeaver/homelab-shared/cosign.pub@sha256:f04f02562347cca8bde435d45f476ac11adcff2d1671c090ff318c44ec127134 > cosign_from_registry.pub
```

Or by plainly downloading it via `curl`:

```shell
curl -L https://ghcr.io/v2/busybeaver/homelab-shared/cosign.pub/blobs/sha256:c5905f796789e76f7a384f4acb67589d527e39e5e0566d6b7809cbcd4654e7e5 > cosign_from_registry.pub
```

## Verification of the Aritfacts

To verify Docker images:

```shell
cosign verify --key cosign.pub <docker_image>
# example:
cosign verify --key cosign.pub ghcr.io/busybeaver/homelab-packages/node-red@sha256:9a2e744fc3aba85cffa1e056c8c4537f4321023fcad69c7162e57d8a6499a40c
```

Consider also verifying the annotations:

```shell
cosign verify --key cosign.pub -a foo=bar <docker_image>
# example:
cosign verify --key cosign.pub -a repo=busybeaver/homelab-packages ghcr.io/busybeaver/homelab-packages/node-red@sha256:9a2e744fc3aba85cffa1e056c8c4537f4321023fcad69c7162e57d8a6499a40c
```

To verify files/blobs, use the same command as described in the verification section for the public key:

```shell
cosign verify-blob --key cosign.pub --signature $(cat <some_file>.sig) <some_file>
```
