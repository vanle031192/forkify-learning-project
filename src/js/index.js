import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Like";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";
import { elements, renderLoader, clearLoader } from "./views/base";

/**GLOBAL STATE OF THE APP
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */
const state = {};

// TESTING
// window.test = state;

/**
 * SEARCH CONTROLLER
*/

const controlSearch = async () => {
    // 1. Get query from view
    const query = searchView.getInput();

    if (query) {
        // 2. New search object and add to state
        state.search = new Search(query);

        // 3. Prepare UI for results (clear search input and result)
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchResult);

        // 4. Search for recipes
        try {
            await state.search.getResults();
    
            // 5. Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
            
        } catch (error) {
            alert(error);
            clearLoader();
        }
    }
};

elements.searchForm.addEventListener("submit", event => {
    event.preventDefault();
    controlSearch();
});

elements.searchResultPages.addEventListener("click", event => {
    const btn = event.target.closest(".btn-inline");
    
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
    
});


/**
 * RECIPE CONTROLLER
*/ 

const recipeController = async () => {
    // Get ID from Url
    const id = window.location.hash.replace("#", "");
    console.log(id);


    if (id) {
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight Selected recipe
        if (state.search) searchView.highlightSelected(id);

        // Create new recipe object
        state.recipe = new Recipe(id);
        
        // TESTING PURPOSE
        // window.r = state.recipe; 
        // console.log(state.recipe);

        try {
            // Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // Calculating servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
            
        } catch (error) {
            alert(error);
        }
    }
};

// window.addEventListener("hashchange", recipeController);
// window.addEventListener("load", recipeController);
// 2 Line above shorthand below:

["hashchange", "load"].forEach(event => window.addEventListener(event, recipeController));


/**
 * LIST CONTROLLER
*/
const controllerList = () => {
    // Create a new list IF there in none yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
};
// state.likes = new Likes(); //TESTING PURPOSE
/**
 * LIKE CONTROLLER
*/
const controllerLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;
    
    // User has NOT yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(currentID, state.recipe.title, state.recipe.author, state.recipe.img);
        // Toggle the like button
        likesView.toggleLikeBtn(true);
        // Add like to UI List
        likesView.renderLike(newLike);
        //console.log(state.likes); // TESTING

    // User HAS yet liked current recipe
    } else {
        // Remove like from the state
        state.likes.deleteLike(currentID);
        // Toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove like from UI List
        likesView.deleteLike(currentID);
        //console.log(state.likes); // TESTING
    }

    likesView.toggleLikeMenu(state.likes.getTotalLikes());
};

// Restoring liked recipes on page load
window.addEventListener("load", () => {
    state.likes = new Likes();
    
    // Restore likes
    state.likes.readStorage();
    
    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getTotalLikes());
    
    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});


// Handling delete and update list item
elements.shopping.addEventListener("click", event => {
    // console.log(event.target);
    const id = event.target.closest(".shopping__item").dataset.itemid;

    // Handle delete button
    if (event.target.matches(".shopping__delete, .shopping__delete *")) {
        // Delete from state
        state.list.deleteItem(id);
        // Delete from UI
        listView.deleteItem(id);
    // Update the count input
    } else if (event.target.matches(".shopping__count--value")) {
        const value = parseFloat(event.target.value);
        if (value > 0) state.list.updateCount(id, value);
    }
});

// Handling recipe button clicks
elements.recipe.addEventListener("click", event => {
    // console.log(event.target);
    if (event.target.matches(".btn-decrease, .btn-decrease *")) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings("dec");
            recipeView.updateServingsIngs(state.recipe);
            // console.log(event.target);
        }
    } else if (event.target.matches(".btn-increase, .btn-increase *")) {
        // Increase button is clicked
            state.recipe.updateServings("inc");
            recipeView.updateServingsIngs(state.recipe);
            // console.log(event.target);
    } else if (event.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
        // Add ingredients to Shopping List
        controllerList();
    } else if (event.target.matches(".recipe__love, .recipe__love *")) {
        controllerLike(); 
    }
    // TESTING AT THIS POINT
    // console.log(state.recipe);
});




// API key 34e1799625225fbc800497d4d5b8686c
// https://www.food2fork.com/api/search
// https://www.food2fork.com/api/get


