import { Outlet } from "react-router";
import { useAppSelector } from "../../app/hooks.ts";
import type { Config } from "../../services/config/schema/config_schema.ts";
import { Box } from "../../components/ThemedComponents.tsx";

export interface InitOutletContext {
  config: Config;
}

export const InitLayout = () => {
  const config = useAppSelector((state) => state.config.mergedConfig);

  if (!config) {
    throw new Error("Merged config must be preloaded before rendering InitLayout.");
  }

  return (
    <Box flexDirection="column" paddingLeft={1} paddingRight={1}>
      <Outlet context={{ config }} />
    </Box>
  );
};
