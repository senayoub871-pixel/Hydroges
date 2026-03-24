import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DocumentPageTemplate } from "@/components/documents/DocumentPageTemplate";
import { SignatureModal } from "@/components/documents/SignatureModal";
import type { Document } from "@workspace/api-client-react";

export default function PendingPage() {
  const [signingDoc, setSigningDoc] = useState<Document | null>(null);

  return (
    <AppLayout>
      <DocumentPageTemplate
        title="En cours de validation"
        description="Documents que vous avez envoyés en attente de signature."
        params={{ status: "pending_validation", role: "sender" }}
        cardActions={(doc) => (
          <button
            onClick={() => setSigningDoc(doc)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.35rem 0.85rem",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#5b4d90",
              background: "#ede9f8",
              border: "1.5px solid #c9bfea",
              borderRadius: "0.65rem",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#dcd5f4";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#ede9f8";
            }}
          >
            ✍ Apposer la signature
          </button>
        )}
      />

      {signingDoc && (
        <SignatureModal
          open={!!signingDoc}
          onOpenChange={(open) => { if (!open) setSigningDoc(null); }}
          documentId={signingDoc.id}
          coordinates={{ x: 0, y: 0 }}
        />
      )}
    </AppLayout>
  );
}
