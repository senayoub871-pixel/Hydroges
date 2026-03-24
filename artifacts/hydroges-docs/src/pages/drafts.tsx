import { AppLayout } from "@/components/layout/AppLayout";
import { DocumentPageTemplate } from "@/components/documents/DocumentPageTemplate";

export default function DraftsPage() {
  return (
    <AppLayout>
      <DocumentPageTemplate
        title="Brouillons"
        description="Documents en cours de rédaction, non validés."
        params={{ status: "draft", role: "sender" }}
      />
    </AppLayout>
  );
}
