import type { Recipe, RecipeMap, SchemaRecipeMap } from "./types/recipe.d.ts";

import {
  DOMParser,
  HTMLDocument,
  NodeList,
} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

export function parseBodyForRecipe(body: string): RecipeMap | undefined {
  // Initialize the HTMLDocument
  const HTMLDocument = initHTMLDocument(body);

  // Extract the JSON-LD from the HTMLDocument
  const jsonLDNodeList = extractJsonLDNodeList(HTMLDocument);

  // Extract the JSON-LD from the NodeList
  const schemaSet = extractJsonLDFromNodeList(jsonLDNodeList);

  console.log({ schemaSet, size: schemaSet.size });

  // Loop through the JSON-LD and attempt to build a Recipe
  // Only the first Recipe will be returned
  for (const schema of schemaSet) {
    const recipe = buildRecipeFromJsonString(schema);
    if (recipe) {
      return recipe;
    }
  }

  throw new Error("Unable to build recipe.", { cause: 400 });
}

/**
 * Attempt to coerce the JSON-LD into a SchemaRecipe.
 *
 * @param schemaMap Map<string, string>
 * @returns SchemaRecipeMap | undefined
 *
 */
function verifySchemaIsRecipe(
  schemaMap: Map<string, string>
): SchemaRecipeMap | undefined {
  if (schemaMap.has("@type")) {
    const type = schemaMap.get("@type");
    if (typeof type === "string" && type === "Recipe") {
      return schemaMap;
    }
    if (Array.isArray(type) && type.includes("Recipe")) {
      return schemaMap;
    }
  }
  return;
}

/**
 * Extract the values from the SchemaRecipe Map and
 * return only the values needed as a RecipeMap
 *
 * @param schemaMap SchemaRecipeMap
 * @returns RecipeMap
 */
function mapSchemaRecipeToRecipe(schemaMap: SchemaRecipeMap): RecipeMap {
  const recipe = new Map();

  schemaMap.forEach((value, key) => {
    if (key === "name") {
      recipe.set("name", value as Recipe["name"]);
    }
    if (key === "description") {
      recipe.set("description", value as Recipe["description"]);
    }
    if (key === "image") {
      recipe.set("image", value as Recipe["image"]);
    }
    if (key === "recipeYield") {
      recipe.set(
        "recipeYield",
        typeof value === "number"
          ? (value as Recipe["recipeYield"])
          : (parseInt(value as string) as Recipe["recipeYield"])
      );
    }
    if (key === "recipeIngredient") {
      recipe.set("recipeIngredient", value);
    }
    if (key === "recipeInstructions") {
      recipe.set("recipeInstructions", value);
    }
    if (key === "recipeCategory") {
      recipe.set("recipeCategory", value);
    }
    if (key === "recipeCuisine") {
      recipe.set("recipeCuisine", value);
    }
    if (key === "recipeCalories") {
      recipe.set("recipeCalories", value);
    }
    if (key === "recipeCookTime") {
      recipe.set("recipeCookTime", value);
    }
    if (key === "recipePrepTime") {
      recipe.set("recipePrepTime", value);
    }
    if (key === "totalTime") {
      recipe.set("totalTime", value);
    }
  });

  return recipe;
}

/**
 * From the JSON-LD strings,
 * attempt to parse them as JSON and build a Recipe from the schema data.
 *
 * @param string
 * @returns Map<string, string>
 * @throws Error
 */
function buildRecipeFromJsonString(item: string): RecipeMap | undefined {
  const parsedItem = typeof item === "string" ? JSON.parse(item) : item;

  const schemaMap = new Map<string, string>(Object.entries(parsedItem));
  const schemaRecipe = verifySchemaIsRecipe(schemaMap) as SchemaRecipeMap;

  if (schemaRecipe) {
    return mapSchemaRecipeToRecipe(schemaRecipe);
  }
}

/**
 *
 * Attempt to parse the body of the response as an HTML document.
 * Throw an error on failure
 *
 * @param body string
 * @returns HTMLDocument
 * @throws Error
 */
function initHTMLDocument(body: string): HTMLDocument {
  const HTMLDocument = new DOMParser().parseFromString(body, "text/html");

  if (!HTMLDocument) {
    throw new Error("Unable to parse body", { cause: 400 });
  }
  return HTMLDocument;
}

/**
 * Attempt to get the JSON-LD script tags from the HTML document.
 * Return as a NodeList and throw an error on failure
 *
 * @param HTMLDocument
 * @returns NodeList
 * @throws Error
 */
function extractJsonLDNodeList(HTMLDocument: HTMLDocument): NodeList {
  const jsonLDNodeList = HTMLDocument.querySelectorAll(
    "script[type='application/ld+json']"
  );

  if (jsonLDNodeList.length === 0) {
    throw new Error("No JSON-LD found in body", { cause: 400 });
  }

  return jsonLDNodeList;
}

/**
 * Extract the JSON-LD from the JSONLD NodeList
 *
 * @param nodeList NodeList
 * @returns Set<string>
 */
function extractJsonLDFromNodeList(nodeList: NodeList) {
  const jsonLDSet = new Set<string>();

  [...nodeList].forEach((node) => {
    const nodeText = node.textContent;
    nodeText.replaceAll(/\\n\t/g, "");

    const parsedNodeText = JSON.parse(nodeText);
    if (parsedNodeText) {
      if (Array.isArray(parsedNodeText)) {
        parsedNodeText.forEach((item) => {
          jsonLDSet.add(JSON.stringify(item));
        });
        return;
      }
      jsonLDSet.add(JSON.stringify(parsedNodeText));
    }
  });

  return jsonLDSet;
}
