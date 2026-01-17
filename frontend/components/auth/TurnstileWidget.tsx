import { Turnstile } from "@marsidev/react-turnstile";

import config from "@/config";

import type { TurnstileWidgetProps } from "@/types/auth.types";

const TurnstileWidget = ({onVerify}:TurnstileWidgetProps) => {

  return (
    <>
      <Turnstile
        siteKey={config.turnstile.siteKey}
        options={{
          action: "submit-form",
          theme: "light",
        }}
        onSuccess={(token)=>onVerify(token)} //setting the token after collecting
        onExpire={()=>onVerify("")}
      />
    </>
  );
};

export default TurnstileWidget;
