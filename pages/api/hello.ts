import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  message: string;
};

/**
 * Server-only env vars (no NEXT_PUBLIC_) are available here and are not
 * bundled into client-side JavaScript.
 */
export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Next.js demo";
  const serverConfigured = Boolean(process.env.SERVER_ONLY_TOKEN);

  res.status(200).json({
    message: `Hello from the API. Public app name: ${appName}. Server credential set: ${serverConfigured}`,
  });
}
