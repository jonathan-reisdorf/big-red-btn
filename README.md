# big-red-btn

This is a Node.js library for the Big Red Button from Dream Cheeky.

## Installation

```sh
$ npm install big-red-btn
```

## Usage example

```js
const bigRedButton = require("big-red-btn");

bigRedButton.devices[0]
  ?.start()
  .onLidOpened(() => console.log("lid opened"))
  .onLidClosed(() => console.log("lid closed"))
  .onButtonPressed(() => console.log("button pressed"))
  .onButtonReleased(() => console.log("button released")) ??
  console.error("No devices found");
```

For a more detailed example, see `test.js`

## Linux

USB-HID devices in Linux are by default owned by the `root` user, so running the script with `sudo` would be required. To run as normal user, you'd need to create a `udev` rule.

This is a file you create in `/etc/udev/rules.d/`, e.g. `/etc/udev/rules.d/100-big-red-button.rules`, with the following contents:

```
ATTRS{product}=="DL100B Dream Cheeky Generic Controller", MODE:="666"
```

Then, run

```sh
$ sudo udevadm control --reload-rules
```

and unplug and re-plug the device to apply the new rule.
If it still does not work, you may need to adapt the attribute to match what your device is sending.
