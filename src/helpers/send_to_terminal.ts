import { closeSync, openSync, writeSync } from 'node:fs';
import { platform } from 'node:os';

function sendToTerminal(sequence: string): void {
  const isWindows = platform() === 'win32';
  const ttyPath = isWindows ? 'CONOUT$' : '/dev/tty';

  try {
    const fd = openSync(ttyPath, 'w');
    writeSync(fd, sequence);
    closeSync(fd);
  } catch (err) {
    process.stderr.write(sequence);
  }
}
