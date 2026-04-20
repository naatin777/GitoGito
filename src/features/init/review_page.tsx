import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import {
  useLocation,
  useNavigate,
  useSearchParams
} from "react-router";
import { isEnter } from "../../helpers/opentui/key.ts";
import { Box, Text } from "../../components/ThemedComponents.tsx";

export function ReviewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const profile = searchParams.get("profile") ?? "guided";

  useKeyboard((event) => {
    if (event.name === "left") {
      navigate({
        pathname: "/init/profile",
        search: location.search,
      });
      return;
    }

    if (isEnter(event)) {
      navigate({
        pathname: "/init/done",
        search: location.search,
      });
    }
  });

  return (
    <Box flexDirection="column">
      <Text attributes={TextAttributes.BOLD}>Review page</Text>
      <Text>Profile: {profile}</Text>
      <Text attributes={TextAttributes.DIM}>
        Press Left to go back or Enter to finish the sample flow.
      </Text>
    </Box>
  );
}
