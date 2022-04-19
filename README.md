# HomeLab: Infrastructure as Code

Infrastructure as Code for the personal HomeLab.

_Note:_ This is a Pulumi-based reimplementation of a Terraform based setup (located in a private GitHub repository).

## Setup

On macOS run the following command to install just:

```shell
brew install just
```

For other operating systems, have a look at the installation section in the [just documentation](https://github.com/casey/just/tree/df8eabb3ef705e0807b863db2a0c99061f691bbe#packages=).

Subsequently, set up the repository:

```shell
# 1) install the required tooling: the install step uses brew and therefore works only on macos;
# on other operation systems check the needed tools in the justfile.shared and install these manually
just install
# 2) initialize the tooling
just init
```

## Development

For a list of available commands, just run `just` within the git repository.

Use [act](https://github.com/nektos/act) to run the GitHub Actions CI flow locally.
