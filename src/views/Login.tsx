import React from "react";
import LoginCom from "@/components/LoginCom";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";

type Props = {
  defaultNext?: string;
  queryError?: string | null;
  resetSuccess?: string | null;
  adminGate?: boolean;
};

const Login = ({
  defaultNext = "/",
  queryError = null,
  resetSuccess = null,
  adminGate = false,
}: Props): React.ReactElement => {
  return (
    <AuthSplitLayout variant="login" adminGate={adminGate}>
      <LoginCom
        defaultNext={defaultNext}
        queryError={queryError}
        resetSuccess={resetSuccess}
        adminGate={adminGate}
      />
    </AuthSplitLayout>
  );
};

export default Login;
