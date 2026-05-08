import React from "react";
import ForgotPasswordCom from "@/components/ForgotPasswordCom";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";

type Props = {
  defaultNext?: string;
};

export default function ForgotPassword({ defaultNext = "/" }: Props): React.ReactElement {
  return (
    <AuthSplitLayout variant="login">
      <ForgotPasswordCom defaultNext={defaultNext} />
    </AuthSplitLayout>
  );
}
