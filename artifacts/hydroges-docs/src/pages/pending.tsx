import { AppLayout } from "@/components/layout/AppLayout";
import { DocumentPageTemplate } from "@/components/documents/DocumentPageTemplate";

export default function PendingPage() {
  return (
    <AppLayout>
      <DocumentPageTemplate
        title="En cours de validation"
        description="Documents en attente de validation — envoyés ou reçus."
        params={{ status: "pending_validation" }}
      />
    </AppLayout>
  );
}
