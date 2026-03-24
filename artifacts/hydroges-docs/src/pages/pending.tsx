import { AppLayout } from "@/components/layout/AppLayout";
import { DocumentPageTemplate } from "@/components/documents/DocumentPageTemplate";

export default function PendingPage() {
  return (
    <AppLayout>
      <DocumentPageTemplate
        title="En cours de validation"
        description="Documents reçus en attente de votre signature."
        params={{ role: "recipient", status: "pending_validation" }}
      />
    </AppLayout>
  );
}
