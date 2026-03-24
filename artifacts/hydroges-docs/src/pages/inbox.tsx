import { AppLayout } from "@/components/layout/AppLayout";
import { DocumentPageTemplate } from "@/components/documents/DocumentPageTemplate";

export default function InboxPage() {
  return (
    <AppLayout>
      <DocumentPageTemplate
        title="Boîte de Réception"
        description="Consultez les documents qui vous ont été envoyés."
        params={{ role: "recipient" }}
      />
    </AppLayout>
  );
}
