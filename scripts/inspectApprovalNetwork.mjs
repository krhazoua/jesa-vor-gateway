import fs from "node:fs";

const path = ".manus-logs/networkRequests.log";
for (const line of fs.readFileSync(path, "utf8").split("\n")) {
  if (!line.includes("/api/trpc/") || !line.includes("approvals.pending")) continue;
  try {
    const jsonStart = line.indexOf("{");
    const entry = JSON.parse(line.slice(jsonStart));
    const response = entry.response ?? {};
    console.log(JSON.stringify({
      timestamp: entry.timestamp,
      url: entry.url,
      status: response.status,
      contentType: response.headers?.["content-type"],
      error: entry.error,
      bodyPrefix: typeof response.body === "string" ? response.body.slice(0, 80) : undefined,
    }, null, 2));
  } catch {
    console.log("UNPARSED", line.slice(0, 240));
  }
}
