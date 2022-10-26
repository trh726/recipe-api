import { serve } from "https://deno.land/std@0.160.0/http/server.ts";

import { processRequest } from "./request.ts";
import { fetchURL } from "./fetch.ts";
import { parseBodyForRecipe } from "./recipe.ts";

const handler = async (req: Request) => {
  try {
    const url = processRequest(req);

    const body = await fetchURL(url);

    const recipeData = parseBodyForRecipe(body);

    if (!recipeData) {
      throw new Error("Unable to parse recipe from body", { cause: 400 });
    }

    return new Response(JSON.stringify(Object.fromEntries(recipeData)));
  } catch (e) {
    if (e instanceof Error) {
      console.error(e);
      const status = (e.cause as number) || 500;
      return new Response(e.message, { status });
    }

    return new Response("Internal Server Error", { status: 500 });
  }
};

serve(handler);
