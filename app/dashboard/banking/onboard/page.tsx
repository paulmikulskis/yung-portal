import { Button } from "@/components/ui/button";
import ConnectOnboardButton from "@/components/stripe/ConnectOnboardButton";

function StripeConnectOnboard() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl">Set Up Banking</h1>
      <h2 className="text-2xl">
        Connect your bank account to receive payments
      </h2>
      <ConnectOnboardButton />
    </div>
  );
}

export default StripeConnectOnboard;
