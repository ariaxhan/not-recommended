fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

### create_app

```sh
[bundle exec] fastlane create_app
```



### ios_build

```sh
[bundle exec] fastlane ios_build
```

Archive the iOS app (no upload)

### mac_build

```sh
[bundle exec] fastlane mac_build
```

Archive the macOS app (no upload)

### ios_release

```sh
[bundle exec] fastlane ios_release
```

Build + upload the iOS app

### mac_release

```sh
[bundle exec] fastlane mac_release
```

Build + upload the macOS app

### submit

```sh
[bundle exec] fastlane submit
```

Push metadata + screenshots and submit both platforms for review

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
