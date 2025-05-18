const bigRedButton = require("./index");

if (!bigRedButton.devices.length) {
  console.error("No devices found");
  process.exit(1);
}

bigRedButton.devices.forEach((device, index) =>
  device
    .onError((error) =>
      console.error(`Device #${index}: error: ${error.message}`)
    )
    .onStarted(() => console.log(`Device #${index}: started`))
    .onStopped(() => console.log(`Device #${index}: stopped.`))
    .start()
    .onLidOpened(() => console.log(`Device #${index}: lid opened`))
    .onLidClosed(() => console.log(`Device #${index}: lid closed`))
    .onButtonPressed(() => console.log(`Device #${index}: button pressed`))
    .onButtonReleased(() => console.log(`Device #${index}: button released`))
);
