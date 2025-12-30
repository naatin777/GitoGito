import { render } from "ink";

const encoder = new TextEncoder();
const write = (txt: string) => Deno.stdout.writeSync(encoder.encode(txt));
const ENTER_ALT_SCREEN = "\x1b[?1049h\x1b[2J\x1b[H";
const EXIT_ALT_SCREEN = "\x1b[?1049l";

export async function runTui(component: React.ReactNode) {
  write(ENTER_ALT_SCREEN);

  try {
    const instance = render(component);

    await instance.waitUntilExit();
  } catch (err) {
    console.error(err);
  } finally {
    write(EXIT_ALT_SCREEN);
  }
}
