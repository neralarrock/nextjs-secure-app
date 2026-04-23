import { readFileSync } from "node:fs";
import { basename, join } from "node:path";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  result: string;
};

const ALLOWED_FILES = new Set(["README.md", "package.json"]);
const ALLOWED_REDIRECTS = new Set(["/", "/docs", "/about"]);

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const parsedUrl = new URL(req.url ?? "/", "http://localhost");
  const cmdParam = parsedUrl.searchParams.get("cmd");
  const fileParam = parsedUrl.searchParams.get("file");
  const jsParam = parsedUrl.searchParams.get("js");
  const redirectParam = parsedUrl.searchParams.get("redirect");

  if (typeof cmdParam === "string" && cmdParam.length > 0) {
    // Never execute user-provided commands.
    res.status(400).json({ result: "Command execution is disabled for security reasons." });
    return;
  }

  if (typeof fileParam === "string" && fileParam.length > 0) {
    const safeFile = basename(fileParam);
    if (!ALLOWED_FILES.has(safeFile)) {
      res.status(400).json({ result: "Requested file is not allowed." });
      return;
    }

    const fileContents = readFileSync(join(process.cwd(), safeFile), "utf8");
    res.status(200).json({ result: fileContents.slice(0, 2000) });
    return;
  }

  if (typeof jsParam === "string" && jsParam.length > 0) {
    // Never evaluate untrusted JavaScript.
    res.status(400).json({ result: "JavaScript evaluation is disabled for security reasons." });
    return;
  }

  if (typeof redirectParam === "string" && redirectParam.length > 0) {
    if (!ALLOWED_REDIRECTS.has(redirectParam)) {
      res.status(400).json({ result: "Redirect target is not allowed." });
      return;
    }

    res.writeHead(302, { Location: redirectParam });
    res.end();
    return;
  }

  res.status(200).json({
    result:
      "Provide ?file=README.md|package.json or ?redirect=/|/docs|/about. Command and JS execution are disabled.",
  });
}
