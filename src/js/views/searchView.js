import { elements} from "./base";

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
    elements.searchInput.value = "";
};

export const clearResults = () => {
    elements.searchResultList.innerHTML = "";
    elements.searchResultPages.innerHTML = "";
};

export const highlightSelected = id => {
    const resultsArr = Array.from(document.querySelectorAll(".results__link"));
    resultsArr.forEach(el => {
        el.classList.remove("results__link--active");
    });
    document.querySelector(`.results__link[href="#${id}"]`).classList.add("results__link--active");
};

const renderRecipe = recipe => {
    const markup = 
    `
        <li>
            <a class="results__link" href="#${recipe.recipe_id}">
                <figure class="results__fig">
                    <img src="${recipe.image_url}" alt="${recipe.title}">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;
    elements.searchResultList.insertAdjacentHTML("beforeend", markup);
};

export const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = [];
    if (title.length > limit) {
        title.split(" ").reduce((acc, curValue) => {
            if (acc + curValue.length <= limit) {
                newTitle.push(curValue);
            }
            return acc + curValue.length;
        }, 0); 

        return `${newTitle.join(" ")} ...`
    }
    return title;
};

const creatButton = (page, type) => 
    // type: "prev" or "next"
    `
        <button class="btn-inline results__btn--${type}" data-goto="${type === "prev" ? page - 1 : page + 1}">
            <span>Page ${type === "prev" ? page - 1 : page + 1}</span>
            <svg class="search__icon">
                <use href="img/icons.svg#icon-triangle-${type === "prev" ? "left" : "right"}"></use>
            </svg>
        </button>
    `;


const renderButtons = (page, totalResults, resultPerPage) => {
    const totalPages = Math.ceil(totalResults / resultPerPage);
    let button;
    if (page === 1 && totalPages > 1) {
        // Only button to go to next page
        button = creatButton(page, "next");
    } else if (page < totalPages) {
        // Next and Prev Button
        button = 
        `
            ${creatButton(page, "prev")}
            ${creatButton(page, "next")}
        `;
    } else if (page === totalPages && totalPages > 1) {
        // Only button to go to prev page
        button = creatButton(page, "prev");
    }
    elements.searchResultPages.insertAdjacentHTML("afterbegin", button);
};


export const renderResults = (recipes, page = 1, resultPerPage = 10) => {
    // Render results of current page
    const start = (page - 1) * resultPerPage;
    const end = page * resultPerPage;
    recipes.slice(start, end).forEach(renderRecipe);

    // Render pagination button
    renderButtons(page, recipes.length, resultPerPage);
};