import { Turnstile } from "@marsidev/react-turnstile";
import config from "@/app/config";
import { TurnstileWidgetProps } from "@/app/types/auth";

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
