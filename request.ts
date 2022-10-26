export const processRequest = (req: Request) => {
  if (req.method !== "GET") {
    throw new Error("Method not allowed", { cause: 405 });
  }

  // Instantiate a URL object from the Request URL
  const request_url = new URL(req.url);
  // Get the search params from the URL object
  const request_params = request_url.searchParams;
  // Get the url param from the search params
  const url_string = request_params.get("url");
  // If the url param is not present, return a 400 response
  if (!url_string) {
    throw new Error("Missing url parameter", { cause: 400 });
  }

  // If the url param is present, return it as a URL object
  return new URL(url_string);
};
