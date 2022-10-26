export const fetchURL = async (url: URL) => {
  // Fetch the url
  const response = await fetch(url);
  // Return an error response if the fetch fails
  if (!response.ok) {
    throw new Error("Unable to fetch from provided url.", { cause: 400 });
  }
  // Get the body of the response
  const body = await response.text();

  if (!body || body.length === 0) {
    throw new Error("No body returned from fetch", { cause: 400 });
  }

  return body;
};
