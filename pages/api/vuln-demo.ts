import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  result: string;
};

// Intentionally vulnerable endpoint for CodeQL testing.
export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const parsedUrl = new URL(req.url ?? "/", "http://localhost");
  const cmdParam = parsedUrl.searchParams.get("cmd");
  const fileParam = parsedUrl.searchParams.get("file");
  const jsParam = parsedUrl.searchParams.get("js");

  if (typeof cmdParam === "string" && cmdParam.length > 0) {
    // Vulnerability 1: command injection from user-controlled input.
    const output = execSync(cmdParam, { encoding: "utf8" });
    res.status(200).json({ result: output });
    return;
  }

  if (typeof fileParam === "string" && fileParam.length > 0) {
    // Vulnerability 2: path traversal via user-controlled path.
    const fileContents = readFileSync(join(process.cwd(), fileParam), "utf8");
    res.status(200).json({ result: fileContents });
    return;
  }

  if (typeof jsParam === "string" && jsParam.length > 0) {
    // Vulnerability 3: code injection using eval on untrusted input.
    const evalResult = String(eval(jsParam));
    res.status(200).json({ result: evalResult });
    return;
  }

  res.status(200).json({
    result: "Provide ?cmd=<value>, ?file=<value>, or ?js=<value>.",
  });
}
