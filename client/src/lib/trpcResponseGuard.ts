export function isJsonResponse(response: Pick<Response, "headers">) {
  return (response.headers.get("content-type") ?? "").toLowerCase().includes("application/json");
}

function createTrpcErrorResponse(status: number, message: string) {
  return new Response(
    JSON.stringify([
      {
        error: {
          json: {
            message,
            code: -32603,
            data: { code: "INTERNAL_SERVER_ERROR", httpStatus: status },
          },
        },
      },
    ]),
    { status, headers: { "content-type": "application/json" } },
  );
}

export function createNonJsonTrpcResponse(status = 502) {
  return createTrpcErrorResponse(status, "Gateway API returned a non-JSON response. Please retry the request.");
}

export function createTransportErrorTrpcResponse(status = 503) {
  return createTrpcErrorResponse(status, "Gateway connection could not be established. Please retry the request.");
}

const READ_ONLY_TRANSPORT_RETRIES = 2;
const TRANSPORT_RETRY_DELAY_MS = 150;

function requestMethod(input: RequestInfo | URL, init?: RequestInit) {
  if (init?.method) return init.method.toUpperCase();
  if (typeof Request !== "undefined" && input instanceof Request) return input.method.toUpperCase();
  return "GET";
}

export async function fetchWithTrpcTransportGuard(
  input: RequestInfo | URL,
  init?: RequestInit,
  fetchImpl: typeof globalThis.fetch = globalThis.fetch,
  wait: (milliseconds: number) => Promise<void> = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
) {
  const readOnly = ["GET", "HEAD"].includes(requestMethod(input, init));
  const maxAttempts = readOnly ? READ_ONLY_TRANSPORT_RETRIES + 1 : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await fetchImpl(input, init);
    } catch {
      if (attempt + 1 < maxAttempts) {
        await wait(TRANSPORT_RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  return createTransportErrorTrpcResponse();
}
