import { AppLayout } from "@/components/layout/AppLayout";
import { DocumentPageTemplate } from "@/components/documents/DocumentPageTemplate";

export default function PendingPage() {
  return (
    <AppLayout>
      <DocumentPageTemplate
        title="En cours de validation"
        description="Documents que vous avez envoyés en attente de signature."
        params={{ status: "pending_validation", role: "sender" }}
      />
    </AppLayout>
  );
}
