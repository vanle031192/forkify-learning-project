import axios from "axios";

export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipe() {
    try {
      const result = await axios(
        `https://forkify-api.herokuapp.com/api/get?rId=${this.id}`
      );
      this.title = result.data.recipe.title;
      this.author = result.data.recipe.publisher;
      this.img = result.data.recipe.image_url;
      this.url = result.data.recipe.source_url;
      this.ingredients = result.data.recipe.ingredients;
    } catch (error) {
      alert(error);
    }
  }

  calcTime() {
    const numIng = this.ingredients.length;
    const periods = Math.ceil(numIng / 3);
    this.time = periods * 15; // Assume that we need 15 mins for each 3 ingredients
  }

  calcServings() {
    this.servings = 4;
  }

  parseIngredients() {
    const unitsLong = [
      "tablespoons",
      "tablespoon",
      "ounces",
      "ounce",
      "teaspoons",
      "teaspoon",
      "cups",
      "pounds",
    ];
    const unitsShort = [
      "tbsp",
      "tbsp",
      "oz",
      "oz",
      "tsp",
      "tsp",
      "cup",
      "pound",
    ];
    const units = [...unitsShort, "kg", "g"];

    const newIngredients = this.ingredients.map(
      (curValue, index, thisArray) => {
        // 1. Uniform units
        let ingredient = curValue.toLowerCase();
        unitsLong.forEach((curUnit, index, thisLong) => {
          ingredient = ingredient.replace(curUnit, units[index]);
        });
        // 2. Remove parentheses
        ingredient = ingredient.replace(/ *\([^)]*\) */g, " ");

        // 3. Parse ingredients into count, unit and ingredient itself
        const arrIng = ingredient.split(" ");
        const unitIndex = arrIng.findIndex((ele) => unitsShort.includes(ele));

        let objIng;
        if (unitIndex > -1) {
          // There is a unit satisfy
          // Eg. 4 1/2 cups, arrCount is [4 1/2]
          // Eg. 4 cups 1/2, arrCount is [4]
          const arrCount = arrIng.slice(0, unitIndex);

          let count;
          if (arrCount.length === 1) {
            count = eval(arrCount[0].replace("-", "+"));
          } else {
            count = eval(arrIng.slice(0, unitIndex).join("+"));
          }

          objIng = {
            count,
            unit: arrIng[unitIndex],
            ingredient: arrIng.slice(unitIndex + 1).join(" "),
          };
        } else if (parseInt(arrIng[0], 10)) {
          // There  is NO unit satisfy, but 1st element is number
          objIng = {
            count: parseInt(arrIng[0], 10),
            unit: "",
            ingredient: arrIng.slice(1).join(" "),
          };
        } else if (unitIndex === -1) {
          // There is NO unit satisfy and NO number at 1st position
          objIng = {
            count: 1,
            unit: "",
            ingredient, // new featured of ES6
          };
        }

        return objIng;
      }
    );
    this.ingredients = newIngredients;
  }

  updateServings(type) {
    // Servings
    const newServings = type === "dec" ? this.servings - 1 : this.servings + 1;
    // Ingredients
    this.ingredients.forEach((ing) => {
      ing.count *= newServings / this.servings;
    });
    this.servings = newServings;
  }
}
