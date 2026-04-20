import { Command } from "@cliffy/command";
import { createAppDependencies } from "../app/app_extra.ts";
import type { AppDependencies } from "../app/store.ts";
import { AppRouter } from "../app/router.tsx";
import { runTuiWithRedux } from "../lib/runner.tsx";


export function createDoctorCommand(
  dependencies: AppDependencies = createAppDependencies(),
) {
  return new Command()
    .description("Check the health of the project")
    .action(async () => {
      await runTuiWithRedux(<AppRouter initialPath="/doctor" />, { dependencies });
    });
}