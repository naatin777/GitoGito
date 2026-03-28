import { createProgram } from "./commands/program.ts";

if (import.meta.main) {
  await createProgram().parse(process.argv.slice(2));
}
