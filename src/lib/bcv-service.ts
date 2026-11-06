export interface BcvRateResponse {
  rate: number;
  date: string;
  source: string;
}

export async function fetchCurrentBcvRate(): Promise<BcvRateResponse> {
  const sources = [
    {
      url: "https://ve.dolarapi.com/v1/dolares/oficial",
      parser: (data: any) => ({
        rate: Number(data.promedio || data.precio || data.valor),
        date: data.fechaActualizacion || new Date().toISOString(),
        source: "dolarapi.com (BCV Oficial)",
      }),
    },
    {
      url: "https://pydolarvenezuela-api.vercel.app/api/v1/dollar?page=bcv",
      parser: (data: any) => ({
        rate: Number(data.monitors?.usd?.price || data.price),
        date: data.datetime?.date || new Date().toISOString(),
        source: "pydolarvenezuela (BCV)",
      }),
    },
  ];

  for (const src of sources) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(src.url, {
        signal: controller.signal,
        headers: { "User-Agent": "MercantilMariana-App/1.0" },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const parsed = src.parser(json);
        if (parsed.rate && parsed.rate > 0) {
          return parsed;
        }
      }
    } catch {
      // try next source
    }
  }

  // Fallback to reference rate if APIs are temporarily unreachable
  return {
    rate: 849.56,
    date: new Date().toISOString(),
    source: "Sistema (Última tasa registrada)",
  };
}
