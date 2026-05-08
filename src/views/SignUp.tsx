import React from "react";
import SignUpCom from "@/components/SignUpCom";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";

type Props = {
  defaultNext?: string;
};

const SignUp = ({ defaultNext = "/" }: Props): React.ReactElement => {
  return (
    <AuthSplitLayout variant="signup">
      <SignUpCom defaultNext={defaultNext} />
    </AuthSplitLayout>
  );
};

export default SignUp;
