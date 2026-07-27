import { useEffect, useState } from "react";

import { Card } from "../common/Card";
import { getSettingsObject } from "../../services/settingsService";

export default function CatalogFooter() {
  const [storeName, setStoreName] = useState("");
  const [storeWhatsapp, setStoreWhatsapp] = useState("");

  useEffect(() => {
    async function load() {
      const settings = await getSettingsObject();

      setStoreName(settings.storeName);
      setStoreWhatsapp(settings.storeWhatsapp);
    }

    void load();
  }, []);

  if (!storeWhatsapp) return null;

  return (
    <Card className="mt-10">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold">
          Hubungi Kami
        </h2>

        <p className="text-slate-500">
          Ada pertanyaan mengenai produk di {storeName}?
        </p>

        <a
          href={`https://wa.me/${storeWhatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
        >
          Hubungi via WhatsApp
        </a>
      </div>
    </Card>
  );
}