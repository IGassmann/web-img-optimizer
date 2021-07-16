# web-img-optimizer

A tool for optimizing the images of a web page.

# Installation

Download and install the installer for your system:

- [macOS Installer](https://github.com/IGassmann/web-img-optimizer/releases/latest/download/wio-v0.5.2.pkg)
- [Windows Installer](https://github.com/IGassmann/web-img-optimizer/releases/latest/download/wio-v0.5.2-x64.exe)

# Usage

## Open Terminal in macOS

Open Launchpad and search for **terminal**.

Alternatively, you can access the terminal by pressing **⌘ + SPACE** on your keyboard and
searching for
"terminal."

## Open Command Prompt in Windows

Click **Start** and search for "Command Prompt."

Alternatively, you can also access the command prompt by pressing **Ctrl + R** on your keyboard,
type "cmd" and then click **OK**.

## Commands

You can use in your terminal or command prompt any of the following commands. Just type it in and
press enter.

<!-- commands -->

- [`wio dimensions <PAGEURL>`](#wio-dimensions-pageurl)
- [`wio optimize <PAGEURL>`](#wio-optimize-pageurl)
- [`wio preload <PAGEURL>`](#wio-preload-pageurl)
- [`wio update`](#wio-update)

### `wio dimensions <PAGEURL>`

Get the dimensions of all the rendered image elements.

```
USAGE
  $ wio dimensions <PAGEURL>

ARGUMENTS
  PAGEURL  Page's URL from where to get the image dimensions.

OPTIONS
  -h, --help  show CLI help
```

### `wio optimize <PAGEURL>`

Optimize all the rendered images.

```
USAGE
  $ wio optimize <PAGEURL>

ARGUMENTS
  PAGEURL  Page's URL from where to optimize images.

OPTIONS
  -h, --help  show CLI help
```

### `wio preload <PAGEURL>`

Generate the preload tag for the largest image visible within the initial viewport.

```
USAGE
  $ wio preload <PAGEURL>

ARGUMENTS
  PAGEURL  Page's URL to which generate the preload tag.

OPTIONS
  -h, --help  show CLI help
```

### `wio update`

Update the wio CLI

```
USAGE
  $ wio update
```

## Contributing

Contributions are always welcome!

See `./docs/CONTRIBUTING.md`[`./docs/CONTRIBUTING.md`] for ways to get started.
