import { ScrollToTopButton } from "@/components/scroll-to-top-button";
import { SiteFooter } from "@/components/site-footer";
import { ValuationWorkbench } from "@/components/valuation-workbench";

export default function Home() {
  return (
    <>
      <ValuationWorkbench />
      <SiteFooter />
      <ScrollToTopButton />
    </>
  );
}
