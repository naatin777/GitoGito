import { Select } from "../../components/Select.tsx";
import { useLocation, useNavigate } from "react-router";

const profileChoices = [
  {
    name: "minimal",
    value: "minimal",
    description: "Keep the generated config intentionally small.",
  },
  {
    name: "guided",
    value: "guided",
    description: "Start with a friendlier setup flow and suggested defaults.",
  },
  {
    name: "team",
    value: "team",
    description: "Pretend we are preparing shared project settings for a team.",
  },
] as const;

export function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Select
      message="Choose a sample init profile"
      choices={[...profileChoices]}
      onSelect={(profile) => {
        if (!profile) {
          return;
        }

        const searchParams = new URLSearchParams(location.search);
        searchParams.set("profile", profile);
        const search = searchParams.toString();
        navigate({
          pathname: "/init/review",
          search: search.length > 0 ? `?${search}` : "",
        });
      }}
    />
  );
}
