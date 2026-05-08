import { AuthLoginPanel } from "@/components/auth-login-panel";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";
import { SiteFooter } from "@/components/site-footer";
import { ValuationWorkbench } from "@/components/valuation-workbench";
import { isSuperAdminSession } from "@/lib/auth/admin";
import { getCurrentAuthSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getCurrentAuthSession();

  if (!session) {
    return <AuthLoginPanel />;
  }

  return (
    <>
      <ValuationWorkbench authUserId={session.userId} isSuperAdmin={isSuperAdminSession(session)} />
      <SiteFooter />
      <ScrollToTopButton />
    </>
  );
}
