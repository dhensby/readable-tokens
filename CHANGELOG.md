# Changelog

## [1.0.0](https://github.com/dhensby/readable-tokens/compare/v0.3.0...v1.0.0) (2023-08-07)


### ⚠ BREAKING CHANGES

* This refactors the encoders/validators to be classes which are instantiated and
used.

The Base62Encoder is replaced with a generic `BaseXEncoder` which allows consumers to provider
their own alphabets, if needed.

This change means the exports of the library have changed and so this is a breaking change for
those that relied on some of those exports.

### Features

* make encoders and validators classes ([a00d91a](https://github.com/dhensby/readable-tokens/commit/a00d91a75f6b01149ca261e7e480c47e0dcbf168))

# [0.3.0](https://github.com/dhensby/readable-tokens/compare/v0.2.2...v0.3.0) (2023-06-29)


### Bug Fixes

* catch sync errors from rng ([11a4406](https://github.com/dhensby/readable-tokens/commit/11a4406c727e7953104e2db4f75e175a94ef6649))


### Features

* add concrete error classes ([d7cb4e1](https://github.com/dhensby/readable-tokens/commit/d7cb4e1cd51ef2c801e5102f56d92e1c8b795724))

## [0.2.2](https://github.com/dhensby/readable-tokens/compare/v0.2.1...v0.2.2) (2023-06-26)


### Bug Fixes

* update changelog.md ([cecc1b5](https://github.com/dhensby/readable-tokens/commit/cecc1b560be3c7c5f48253655cdf4a4fb493d87a))

## [0.2.1](https://github.com/dhensby/readable-tokens/compare/v0.2.0...v0.2.1) (2023-06-26)

### Bug Fixes

* add changlog changes earlier in release process ([399e6a0](https://github.com/dhensby/readable-tokens/commit/399e6a0e93bf51dedf36db77bcb797744d917617))

## [0.2.0](https://github.com/dhensby/readable-tokens/compare/v0.1.1...v0.2.0) (2023-06-26)

### Bug Fixes

* add changelog changes earlier in release process

## [0.1.1](https://github.com/dhensby/readable-tokens/compare/v0.1.0...v0.1.1) (2023-06-26)

### Added

* Added CHANGELOG.md

### Fixed

* Fixed typo in readme
* Fixed published files

## [0.1.0](https://github.com/dhensby/readable-tokens/releases/tag/v0.1.0) (2023-06-26)

### Added

* Initial release
