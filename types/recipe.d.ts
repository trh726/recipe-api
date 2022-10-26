import type { Recipe as SchemaRecipe, WithContext } from "npm:schema-dts";

export type Recipe = {
  name: string;
  description: string;
  image: string | string[];
  recipeYield: number;
  recipeIngredient: string | string[];
  recipeInstructions: string | string[];
  recipeCategory: string;
  recipeCuisine: string;
  recipeCalories: string;
  recipeCookTime: string;
  recipePrepTime: string;
  totalTime: string;
  recipeServings: string;
};

export type RecipeProp = keyof Recipe;

export type RecipeMap = Map<RecipeProp, Recipe[RecipeProp]>;

export type SchemaRecipeMap = Map<
  keyof SchemaRecipe | keyof WithContext<SchemaRecipe>,
  SchemaRecipe | WithContext<SchemaRecipe>
>;
