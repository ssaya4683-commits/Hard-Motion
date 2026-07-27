import { useEffect, useState } from "react";

import { Card } from "../components/common/Card";

import {
  subscribeCustomerDisplay,
  type CustomerDisplayData,
} from "../services/customerDisplayService";

export function CustomerDisplay() {
  const [items, setItems] = useState<CustomerDisplayData["items"]>([]);
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    return subscribeCustomerDisplay((data) => {
      setItems(data.items);
      setSubtotal(data.subtotal);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
      <Card className="w-full max-w-5xl p-10 text-center">

        <h1 className="text-5xl font-black">
          HARD MOTION
        </h1>

        <p className="mt-2 text-slate-500">
          Premium Quality Outfit
        </p>

        <div className="mt-10 text-3xl font-bold">
          Customer Display
        </div>

        {items.length === 0 ? (
          <div className="mt-6 text-slate-500">
            Menunggu transaksi...
          </div>
        ) : (
          <div className="mt-8 space-y-3 text-left">
            {items.map((item: any, index) => (
              <div
                key={index}
                className="flex justify-between border-b border-slate-700 pb-2"
              >
                <div>
                  <div className="font-semibold">
                    {item.productName}
                  </div>
                  <div className="text-sm text-slate-400">
                    Size {item.size} × {item.quantity}
                  </div>
                </div>

                <div className="font-bold">
                  Rp{" "}
                  {(
                    item.price * item.quantity
                  ).toLocaleString("id-ID")}
                </div>
              </div>
            ))}

            <div className="mt-8 flex justify-between text-3xl font-black">
              <span>TOTAL</span>

              <span>
                Rp {subtotal.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        )}

      </Card>
    </div>
  );
}