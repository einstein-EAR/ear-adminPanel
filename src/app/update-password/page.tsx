import { PageContainer } from "@/src/components/layout/PageContainer";
import { PageHeader } from "@/src/components/layout/PageHeader";
import UpdateCredentialsForm from "../components/update-password/UpdateCredentialsForm";

export default function UpdatePasswordPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Update password"
        description="Change your admin name, email, and password."
      />
      <UpdateCredentialsForm />
    </PageContainer>
  );
}
