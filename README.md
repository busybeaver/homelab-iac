# HomeLab: Infrastructure as Code

Infrastructure as Code for the personal HomeLab.

## Setup

Make sure [Node.js](https://nodejs.org/en/) is installed. The [latest LTS version](https://nodejs.org/en/download/) is recommended. Tools like [fnm](https://github.com/Schniz/fnm) or [volta](https://github.com/volta-cli/volta) can help managing multipe Node.js version.

On macOS run the following command to install [Pulumi](https://www.pulumi.com/) and [git-crypt](https://github.com/AGWA/git-crypt):

```shell
brew install pulumi git-crypt
```

For other operating systems, have a look at the [installation section](https://www.pulumi.com/docs/get-started/install/) in the Pulumi doc as well as the git-crypt [install documentation](https://github.com/AGWA/git-crypt/blob/master/INSTALL.md).

Subsequently, setup git-crypt and Pulumi by running:

```shell
# after cloning the repository, unlock the encrypted files with GPG
git-crypt unlock
# initialize pulumi
pulumi login file://./state
# to work on the production stack (containing the actual data)
pulumi stack select production
# to work on the CI stack
pulumi stack select ci
```

## Development

Use [act](https://github.com/nektos/act) to run the GitHub Actions CI flow locally.

## Note

This is a Pulumi-based reimplementation of a Terraform based setup (located in a private GitHub repository).
