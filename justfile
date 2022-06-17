set shell := ["bash", "-uc"]

additional_tools := "fnm git-crypt pulumi deno moreutils" # the moreutils package contains the 'vipe' command
brew_env_vars := "HOMEBREW_NO_ANALYTICS=1 HOMEBREW_NO_INSECURE_REDIRECT=1 HOMEBREW_CASK_OPTS=--require-sha"

# lists all available commands
@default:
  just --list

alias init := initialize
alias fmt := format
alias cm := commit

# internal helper command to easier run commands from the shared justfile
_run_shared cmd *args:
  @just -f {{justfile_directory()}}/.github/justfile.shared -d {{justfile_directory()}} {{cmd}} {{args}}

# install all required tooling for development (osx only)
install:
  @just _run_shared install {{additional_tools}}

# uninstall all required tooling for development (osx only)
uninstall:
  @just _run_shared uninstall {{additional_tools}}

# initializes the tooling for working with this repository
initialize:
  @just _run_shared initialize
  @# after cloning the repository, unlock the encrypted files with GPG
  cd {{justfile_directory()}} && git-crypt unlock
  @# install nodejs (if not already available)
  cd {{justfile_directory()}} && fnm use
  @# install all npm dependencies
  cd {{justfile_directory()}} && npm install
  @# initialize pulumi
  cd {{justfile_directory()}} && pulumi login file://./state

# formats files according to the used standards and rules; if the optional files parameter is provided, only the specified files are formatted; else all files are formatted
format *files:
  @just _run_shared format {{files}}

# checks if the files comply to the used standards and rules; if the optional files parameter is provided, only the specified files are checked; else all files are checked
check *files:
  @just _run_shared check {{files}}
  @just lint {{files}}
  @just typecheck
  @just test {{files}}

# assisted conventional commits with git
commit *args:
  @just _run_shared commit {{args}}

# runs the CI workflows locally; the optional args parameter allows to add additional optional arguments
ci *args:
  @just _run_shared ci {{args}}

# -----------------------
# repo specific tooling:
# -----------------------

# improve compatibility with npm tools by adding/extending the PATH variable
export PATH := justfile_directory() + "/node_modules/.bin:" + env_var('PATH')

projectName := "homelab-iac"

# internal helper command for the pulumi stack command
_run_pulumi_stack stack:
  #!/usr/bin/env bash
  set -euo pipefail
  IFS=$'\n\t'
  if [[ "{{os()}}" != "macos" ]]; then
    echo "This command currently only works on macOS. On other systems, please run the command 'pulumi stack select {{stack}}' directly."
    exit -1
  fi
  cd {{justfile_directory()}}
  if ! PULUMI_CONFIG_PASSPHRASE=$(security find-generic-password -w -s "pulumi-{{projectName}}_{{stack}}-passphrase" -a "{{stack}}-passphrase"); then
    echo "Unable to find the passphrase for stack {{stack}} in the keychain. Please enter twice below:"
    security add-generic-password -s "pulumi-{{projectName}}_{{stack}}-passphrase" -a "{{stack}}-passphrase" -w
    STACK_PASSPHRASE=$(security find-generic-password -w -s "pulumi-{{projectName}}_{{stack}}-passphrase" -a "{{stack}}-passphrase")
  fi
  security add-generic-password -U -s "pulumi-{{projectName}}_current-stack" -a "current-stack" -w '{{stack}}'
  PULUMI_CONFIG_PASSPHRASE="${PULUMI_CONFIG_PASSPHRASE}" pulumi stack select {{stack}}
  echo "Switched to stack: {{stack}}"

# internal helper command for running pulimi commands
_run_pulumi +args:
  #!/usr/bin/env bash
  set -euo pipefail
  IFS=$'\n\t'
  if [[ "{{os()}}" != "macos" ]]; then
    echo "This command currently only works on macOS. On other systems, please run the command 'pulumi {{args}}' directly."
    exit -1
  fi
  cd {{justfile_directory()}}
  if ! CURRENT_STACK=$(security find-generic-password -w -s "pulumi-{{projectName}}_current-stack" -a "current-stack"); then
    echo "Unable to find the current stack name in the keychain. Please run 'just env_*' or 'just stack_*' first."
    exit 1
  fi
  if ! PULUMI_CONFIG_PASSPHRASE=$(security find-generic-password -w -s "pulumi-{{projectName}}_${CURRENT_STACK}-passphrase" -a "${CURRENT_STACK}-passphrase"); then
    echo "Unable to find the passphrase for stack ${CURRENT_STACK} in the keychain. Please run just env_* or just stack_* first."
    exit 2
  fi
  if [[ "${VERBOSE-}" != "false" ]]; then
    echo "> ${CURRENT_STACK} stack > pulumi {{args}}"
  fi
  PULUMI_CONFIG_PASSPHRASE="${PULUMI_CONFIG_PASSPHRASE}" pulumi {{args}}

alias env_prod := stack_prod
alias env_ci := stack_ci
alias deploy := up
alias apply := up
alias list := config_list
alias get := config_get
alias get_custom := config_get_custom
alias set := config_set
alias set_custom := config_set_custom
alias edit_json := config_edit_json

# lint files according to the defined coding standards; if the optional files parameter is provided, only the specified files are linted; else all files are linted
lint *files:
  cd {{justfile_directory()}} && deno lint -c ./denolint.jsonc {{files}}

# check TypeScript types
typecheck:
  cd {{justfile_directory()}} && tsc --project ./tsconfig.json --noEmit

# run unit tests; if the optional source_files paraemter is provided, only tests related to the specified source files are executed; else all tests are executed
test *source_files:
  cd {{justfile_directory()}} && jest -c ./jest.config.js {{ if source_files =~ ".+" { "--passWithNoTests --findRelatedTests " + source_files } else { "" } }}

# run unit tests during CI workflows; allows via the optional args parameter to customize the execution of jest
test_ci *args:
  cd {{justfile_directory()}} && jest -c ./jest.config.js --ci {{args}}

# switch to the production environment (containing the actual data)
stack_prod:
  @just _run_pulumi_stack production

# switch to the ci environment (containing dummy data)
stack_ci:
  @just _run_pulumi_stack ci

# previews the potential changes between the current IaC configuration and the current state; the optional args parameter allows to add additional optional arguments
preview *args:
  @just _run_pulumi preview {{args}}

# applies/deploys the changes between the current IaC configuration and the current state; the optional args parameter allows to add additional optional arguments
up *args:
  @just _run_pulumi up --refresh {{args}}

# list the configuration of the current stack; when the '--show-secrets' arguemnt is added, stored secrets are shown in clear text
config_list showSecrets="--hide-secrets":
  @just _run_pulumi config {{ if showSecrets == "--show-secrets" { "--show-secrets" } else { "" } }}

# get the configuration or secret value for the defined namespace and propertyName
config_get_custom namespace propertyName:
  @just _run_pulumi config get {{namespace}}:{{propertyName}}

# get the configuration or secret value for the defined propertyName
config_get propertyName:
  @just config_get_custom {{projectName}} {{propertyName}}

# sets (and potentially overrides) the value of the defined propertyName. If the '--secret' flag is added, the value is stored encrypted at rest; else the value is stored plaintext, unecrypted at rest
config_set_custom namespace propertyName secret="--no-secret":
  @echo {{ if secret == "--secret" { "Going to store the configuration property as encrypted secret..." } else { "Going to store the configuration property as plaintext, unecrypted value..." } }}
  @just _run_pulumi config set {{namespace}}:{{propertyName}} {{ if secret == "--secret" { "--secret" } else { "" } }}

# sets (and potentially overrides) the value of the defined propertyName. If the '--secret' flag is added, the value is stored encrypted at rest; else the value is stored plaintext, unecrypted at rest
config_set propertyName secret="--no-secret":
  @just config_set_custom {{projectName}} {{propertyName}} {{secret}}

config_edit_json propertyName secret="--no-secret":
  @VERBOSE=false just config_get {{propertyName}} | jq -M . | EDITOR=nano vipe | jq -M -c . | VERBOSE=false just config_set {{propertyName}} {{secret}}
