export const CUSTOMER_DISPLAY_CHANNEL =
  "hard-motion-customer-display";

const channel =
  new BroadcastChannel(
    CUSTOMER_DISPLAY_CHANNEL
  );

export interface CustomerDisplayData {
  items: unknown[];
  subtotal: number;
}

export function sendCustomerDisplay(
  data: CustomerDisplayData
) {
  channel.postMessage(data);
}

export function subscribeCustomerDisplay(
  callback: (
    data: CustomerDisplayData
  ) => void
) {
  channel.onmessage = (event) => {
    callback(event.data);
  };

  return () => {
    channel.onmessage = null;
  };
}