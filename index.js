const HID = require("node-hid");
const EventEmitter = require("node:events");

const STATES = {
  ERROR: -0x01,
  INITIAL: 0x00,
  LID_DOWN: 0x15,
  LID_UP: 0x17,
  BUTTON_DOWN: 0x16,
};

const CMD_GET_STATE = [0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02];

class BigRedButtonDevice {
  #pollingIntervalId = null;
  #eventEmitter = new EventEmitter();
  config = null;
  hidDevice = null;
  state = STATES.INITIAL;

  on = this.#eventEmitter.on;
  emit = this.#eventEmitter.emit;

  constructor(config) {
    this.config = config;
  }

  #emit(state, previousState) {
    const mapper = {
      [STATES.LID_DOWN]: "lidClosed",
      [STATES.LID_UP]:
        previousState === STATES.BUTTON_DOWN ? "buttonReleased" : "lidOpened",
      [STATES.BUTTON_DOWN]: "buttonPressed",
    };

    this.emit(mapper[state]);
  }

  #emitError(error) {
    if (this.state === STATES.ERROR) return;
    this.state = STATES.ERROR;
    this.emit("error", error);
  }

  onError(cb) {
    this.on("error", cb);
    return this;
  }

  onStarted(cb) {
    this.on("started", cb);
    return this;
  }

  onStopped(cb) {
    this.on("stopped", cb);
    return this;
  }

  onLidClosed(cb) {
    this.on("lidClosed", cb);
    return this;
  }

  onLidClosed(cb) {
    this.on("lidClosed", cb);
    return this;
  }

  onLidOpened(cb) {
    this.on("lidOpened", cb);
    return this;
  }

  onButtonPressed(cb) {
    this.on("buttonPressed", cb);
    return this;
  }

  onButtonReleased(cb) {
    this.on("buttonReleased", cb);
    return this;
  }

  start(reconnectOnError = true) {
    if (this.hidDevice) return;

    try {
      this.hidDevice = new HID.HID(this.config.path);
    } catch (error) {
      this.#emitError(error);
      reconnectOnError && this.restart();

      return this;
    }

    this.hidDevice.on("data", (data) => {
      const previousState = this.state;
      const state = data[0];
      if (state === this.state) return;

      this.state = state;
      this.#emit(state, previousState);
    });

    this.hidDevice.on("error", (error) => this.#emitError(error));

    this.#pollingIntervalId = setInterval(() => {
      try {
        this.hidDevice.write(CMD_GET_STATE);
      } catch (error) {
        this.#emitError(error);
        reconnectOnError && this.restart();
      }
    }, 100);

    this.emit("started");
    return this;
  }

  stop() {
    clearInterval(this.#pollingIntervalId);
    this.#pollingIntervalId = null;

    if (!this.hidDevice) return;

    this.hidDevice.close();
    this.hidDevice = null;

    this.emit("stopped");

    return this;
  }

  restart() {
    this.stop();
    setTimeout(() => this.start(), 1000);

    return this;
  }
}

class BigRedButton {
  #devices = null;

  get devices() {
    return (
      this.#devices ??
      (this.#devices = HID.devices(7476, 13).map(
        (hidDevice) => new BigRedButtonDevice(hidDevice)
      ))
    );
  }

  reload(stop = true) {
    stop && this.stop();
    this.#devices = null;
    return this;
  }

  start() {
    this.devices.forEach((device) => device.start());
    return this;
  }

  stop() {
    this.devices.forEach((device) => device.stop());
    return this;
  }
}

module.exports = new BigRedButton();
