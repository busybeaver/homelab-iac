set dotenv-load := true
set shell := ["zsh", "-uc"]

# lists all available commands
@default:
  just --list

alias init := initialize
alias fmt := format

# internal helper command to easier run commands from the shared justfile
_run_shared cmd *args:
  @just -f {{justfile_directory()}}/.github/justfile.shared -d {{justfile_directory()}} {{cmd}} {{args}}

# install all required tooling for development (osx only)
install:
  @just _run_shared install fnm git-crypt pulumi deno

# initializes the tooling for working with this repository
initialize:
  @just _run_shared initialize
  @# after cloning the repository, unlock the encrypted files with GPG
  cd {{justfile_directory()}} && git-crypt unlock
  @# initialize pulumi
  cd {{justfile_directory()}} && pulumi login file://./state

# formats files according to the used standards and rules
format *files:
  @just _run_shared format {{files}}

# checks if the files comply to the used standards and rules
check *files:
  @just _run_shared check {{files}}
  @just lint {{files}}
  @just typecheck
  @just test {{files}}

# runs the CI workflows locally
ci *args:
  @just _run_shared ci {{args}}

# -----------------------
# repo specific tooling:
# -----------------------

# improve compatibility with npm tools by adding/extending the PATH variable
export PATH := justfile_directory() + "/node_modules/.bin:" + env_var('PATH')

# internal helper command for the pulumi stack command
_run_pulumi_stack stack:
  cd {{justfile_directory()}} && pulumi stack select {{stack}}

alias env_prod := pulumi_stack_prod
alias env_ci := pulumi_stack_ci
alias preview := pulumi_preview
alias up := pulumi_up
alias deploy := pulumi_up

# lint files according to the defined coding standards
lint *files:
  cd {{justfile_directory()}} && deno lint -c ./denolint.jsonc {{files}}

# check TypeScript types
typecheck:
  cd {{justfile_directory()}} && tsc --project ./tsconfig.json --noEmit

# run unit tests
test *source_files:
  cd {{justfile_directory()}} && jest -c ./jest.config.js {{ if source_files =~ ".+" { "--passWithNoTests --findRelatedTests " + source_files } else { "" } }}

# switch to the production environment (containing the actual data)
pulumi_stack_prod:
  @just _run_pulumi_stack production

# switch to the ci environment (containing dummy data)
pulumi_stack_ci:
  @just _run_pulumi_stack ci

# previews the potential changes between the current IaC configuration and the current state
pulumi_preview:
  cd {{justfile_directory()}} && pulumi preview

# applies/deploys the changes between the current IaC configuration and the current state
pulumi_up:
  cd {{justfile_directory()}} && pulumi up --refresh

