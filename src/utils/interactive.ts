import { env, argv, stdin, exit } from 'node:process';

const KEY_INTERRUPT = [[3]];
const KEY_UP =    [[27,91,65]];
const KEY_DOWN =  [[27,91,66]];
const KEY_RIGHT = [[27,91,67]];
const KEY_LEFT =  [[27,91,68]];

function keyMatch(input: number[], keyTemplate: number[][]) {
  return keyTemplate.some(x => (x.length === input.length) &&
    x.every((y, i) => y === input[i]));
}

interface KeypressCallback {
  condition: (data: number[]) => boolean,
  callback: Function
}

class InteractiveSession {
  private _callbacks: KeypressCallback[] = [];
  private _debug?: (data: number[]) => void;
  
  private dataReceived(data: Buffer) {
    const bytes = [...data];

    if (this._debug) {
      this._debug(bytes);
    }

    for (let i = 0; i < this._callbacks.length; i++) {
      const cb: KeypressCallback = this._callbacks[i];

      if (cb.condition(bytes)) {
        cb.callback();
      }
    }

    if (keyMatch(bytes, KEY_INTERRUPT)) {
      exit();
    }
  }

  debug(callback: (data: number[]) => void) {
    this._debug = callback;
  }

  on(condition: (data: number[]) => boolean, callback: Function) {
    this._callbacks.push({ condition, callback });
  }

  onArrowUp(callback: Function) {
    this.on(x => keyMatch(x, KEY_UP), callback);
  }

  onArrowDown(callback: Function) {
    this.on(x => keyMatch(x, KEY_DOWN), callback);
  }

  onArrowRight(callback: Function) {
    this.on(x => keyMatch(x, KEY_RIGHT), callback);
  }

  onArrowLeft(callback: Function) {
    this.on(x => keyMatch(x, KEY_LEFT), callback);
  }

  begin() {
    stdin.on('data', this.dataReceived.bind(this));
    stdin.setRawMode(true);
    stdin.resume();
  }
}

export default InteractiveSession;