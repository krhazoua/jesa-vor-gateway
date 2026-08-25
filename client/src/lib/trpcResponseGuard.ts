export function isJsonResponse(response: Pick<Response, "headers">) {
  return (response.headers.get("content-type") ?? "").toLowerCase().includes("application/json");
}

export function createNonJsonTrpcResponse(status = 502) {
  return new Response(
    JSON.stringify([
      {
        error: {
          json: {
            message: "Gateway API returned a non-JSON response. Please retry the request.",
            code: -32603,
            data: { code: "INTERNAL_SERVER_ERROR", httpStatus: status },
          },
        },
      },
    ]),
    { status, headers: { "content-type": "application/json" } },
  );
}
