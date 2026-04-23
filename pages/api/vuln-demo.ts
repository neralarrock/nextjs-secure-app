import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  result: string;
};

// Intentionally vulnerable endpoint for CodeQL testing.
export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const cmdParam = Array.isArray(req.query.cmd) ? req.query.cmd[0] : req.query.cmd;
  const fileParam = Array.isArray(req.query.file) ? req.query.file[0] : req.query.file;

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

  res.status(200).json({
    result: "Provide ?cmd=<value> or ?file=<value> to trigger vulnerable paths.",
  });
}
