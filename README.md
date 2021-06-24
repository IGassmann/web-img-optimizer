web-img-optimizer
================

A tool for fetching and optimize all images of a web page.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/web-img-optimizer.svg)](https://npmjs.org/package/web-img-optimizer)
[![Downloads/week](https://img.shields.io/npm/dw/web-img-optimizer.svg)](https://npmjs.org/package/web-img-optimizer)
[![License](https://img.shields.io/npm/l/web-img-optimizer.svg)](https://github.com/IGassmann/web-img-optimizer/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g web-img-optimizer
$ wio COMMAND
running command...
$ wio (-v|--version|version)
web-img-optimizer/0.3.0 darwin-x64 node-v14.17.0
$ wio --help [COMMAND]
USAGE
  $ wio COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`wio dimensions [PAGEURL]`](#wio-dimensions-pageurl)
* [`wio optimize [PAGEURL]`](#wio-optimize-pageurl)
* [`wio preload [PAGEURL]`](#wio-preload-pageurl)
* [`wio update [CHANNEL]`](#wio-update-channel)

## `wio dimensions [PAGEURL]`

Get the dimensions of all the rendered image elements.

```
USAGE
  $ wio dimensions [PAGEURL]

OPTIONS
  -h, --help              show CLI help
  -x, --extended          show extra columns
  --columns=columns       only show provided columns (comma-separated)
  --csv                   output is csv format [alias: --output=csv]
  --filter=filter         filter property by partial string matching, ex: name=foo
  --no-header             hide table header from output
  --no-truncate           do not truncate output to fit screen
  --output=csv|json|yaml  output in a more machine friendly format
  --sort=sort             property to sort by (prepend '-' for descending)
```

_See code: [src/commands/dimensions.ts](https://github.com/IGassmann/web-img-optimizer/blob/v0.3.0/src/commands/dimensions.ts)_

## `wio optimize [PAGEURL]`

Optimize all the rendered images.

```
USAGE
  $ wio optimize [PAGEURL]

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/optimize.ts](https://github.com/IGassmann/web-img-optimizer/blob/v0.3.0/src/commands/optimize.ts)_

## `wio preload [PAGEURL]`

Generate the preload tag for the largest image visible within the initial viewport.

```
USAGE
  $ wio preload [PAGEURL]

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/preload.ts](https://github.com/IGassmann/web-img-optimizer/blob/v0.3.0/src/commands/preload.ts)_

## `wio update [CHANNEL]`

update the wio CLI

```
USAGE
  $ wio update [CHANNEL]
```

_See code: [@oclif/plugin-update](https://github.com/oclif/plugin-update/blob/v1.3.10/src/commands/update.ts)_
<!-- commandsstop -->
