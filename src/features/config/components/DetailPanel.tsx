import _ from "lodash";
import { useAppSelector } from "../../../app/hooks.ts";
import { Box, Text } from "../../../components/ThemedComponents.tsx";
import type { FlatSchemaItem } from "../../../helpers/flat_schema.ts";
import { fullPath } from "../../../helpers/flat_schema.ts";
import { ConfigSchema } from "../../../services/config/schema/config_schema.ts";

interface DetailPanelProps {
  item: FlatSchemaItem;
}

export const DetailPanel = ({ item }: DetailPanelProps) => {
  const itemPath = fullPath(item)

  const mergedConfig = useAppSelector((state) => state.config.mergedConfig)
  const defaultConfig = ConfigSchema.parse({})
  const localConfig = useAppSelector((state) => state.config.localConfig)
  const projectConfig = useAppSelector((state) => state.config.projectConfig)
  const globalConfig = useAppSelector((state) => state.config.globalConfig)

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box
        border
        borderStyle="rounded"
        paddingX={1}
        flexGrow={1}
        flexDirection="column"
      >
        <Text>
          {`<${itemPath}>`}
        </Text>
        <Text>
          {item.description}
        </Text>
        {item.isLeaf ? (
          <>
            <Text>
              current: {String(_.get(mergedConfig, itemPath) ?? "")}
            </Text>
            <Text>
              default: {String(_.get(defaultConfig, itemPath) ?? "(not set)")}
            </Text>
            <Text>
              local: {String(_.get(localConfig, itemPath) ?? "(not set)")}
            </Text>
            <Text>
              project: {String(_.get(projectConfig, itemPath) ?? "(not set)")}
            </Text>
            <Text>
              global: {String(_.get(globalConfig, itemPath) ?? "(not set)")}
            </Text>
          </>) : <Box />}
      </Box>
    </Box>
  );
};
