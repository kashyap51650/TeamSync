import { getAuthUser } from "@/lib/auth";
import { NoOrgWelcome } from "@/components/dashboard/no-org-welcome";

export default async function Home() {
  const user = await getAuthUser();
  return <NoOrgWelcome userName={user?.name} />;
}
