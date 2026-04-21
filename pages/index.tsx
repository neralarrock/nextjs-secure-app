import { useState } from "react";
import Head from "next/head";
import { DemoButton } from "@/components/DemoButton";

export default function Home() {
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  return (
    <>
      <Head>
        <title>Next.js Security Demo</title>
        <meta name="description" content="Minimal Next.js app with security-minded setup" />
      </Head>
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1 style={{ margin: 0 }}>Secure Next.js starter</h1>
        <p style={{ color: "#555", maxWidth: "28rem", textAlign: "center" }}>
          Environment variables stay on the server unless prefixed with{" "}
          <code>NEXT_PUBLIC_</code>. The button below calls an API route that can read secrets
          safely.
        </p>
        <DemoButton
          onResult={(msg) => {
            setApiMessage(msg);
          }}
        />
        {apiMessage !== null && (
          <p style={{ color: "#333" }} aria-live="polite">
            {apiMessage}
          </p>
        )}
      </main>
    </>
  );
}
