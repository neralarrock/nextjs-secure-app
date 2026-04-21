import { useState } from "react";

type Props = {
  onResult: (message: string) => void;
};

export function DemoButton({ onResult }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/hello");
      const data = (await res.json()) as { message?: string; error?: string };
      onResult(data.message ?? data.error ?? "Unexpected response");
    } catch {
      onResult("Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={handleClick} disabled={loading}>
      {loading ? "Calling API…" : "Call /api/hello"}
    </button>
  );
}
