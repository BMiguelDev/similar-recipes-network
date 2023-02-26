import React, { Component } from 'react';
import axios from 'axios';

import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import HelpInfo from './components/HelpInfo/HelpInfo';
import DarkModeButton from './components/DarkModeButton/DarkModeButton';
import HelpButton from './components/HelpButton/HelpButton';
import Graph from './components/Graph/Graph';
import './App.scss';

// Data imports to handle API downtime
import querySearchDataBurger from './data/querySearchDataBurger';
import queryDataBurgerSimilar1 from './data/queryDataBurgerSimilar1';
import queryDataBurgerSimilar11 from './data/queryDataBurgerSimilar11';
import queryDataBurgerSimilar12 from './data/queryDataBurgerSimilar12';
import queryDataBurgerSimilar13 from './data/queryDataBurgerSimilar13';
import queryDataBurgerSimilar14 from './data/queryDataBurgerSimilar14';
import queryDataBurgerSimilar15 from './data/queryDataBurgerSimilar15';

// Get API key from .env file
const SPOONACULAR_API_KEY = process.env.REACT_APP_SPOONACULAR_API_KEY;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchName: "",
            previouslySearchedName: "",
            selectedLayout: "Force Atlas 2",
            searchNameWasSubmitted: false,
            searchItemsResults: [],
            isLoading: false,
            isGraphLoading: false,
            nodeClicked: null,
            isNodeImageLoaded: false,
            previousNodeClickedId: "",
            graphJson: null,
            isGraphBuilt: false,
            recipeIdPreviousGraphBuilt: "",
            numberOfRecipes: 3,
            selectedCategory: { value: 'any', label: 'Any' },
            previouslySelectedCategory: { value: '', label: '' },
            isDarkMode: false
        };
        this.handleClick = this.handleClick.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleChangeSearch = this.handleChangeSearch.bind(this);
        this.handleChangeLayoutSelect = this.handleChangeLayoutSelect.bind(this);
        this.handleChangeNumOfRecipes = this.handleChangeNumOfRecipes.bind(this);
        this.handleChangeCategorySelect = this.handleChangeCategorySelect.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChangeIsDarkMode = this.handleChangeIsDarkMode.bind(this);
        this.showGraphLayoutInfoButton = this.showGraphLayoutInfoButton.bind(this);
        this.handleToggleInfoSection = this.handleToggleInfoSection.bind(this);
        this.parseRecipeTitleString = this.parseRecipeTitleString.bind(this);
        this.getNodeSize = this.getNodeSize.bind(this);
        this.getNodeColor = this.getNodeColor.bind(this);
        this.handleGraphNodeClick = this.handleGraphNodeClick.bind(this);
        this.buildGraphAlgorithm = this.buildGraphAlgorithm.bind(this);
        this.changeIsNodeImageLoaded = this.changeIsNodeImageLoaded.bind(this);
    }

    handleResize() {
        // Remove graph from view and render it again to avoid graph positioning bug
        if (this.state.graphJson && this.state.isGraphBuilt) {
            const graphElement = document.querySelector(".graph_container>div");
            graphElement.style.display = 'none';
            this.setState({ isGraphLoading: true, isGraphBuilt: false });
            setTimeout(() => {
                this.setState({ isGraphLoading: false, isGraphBuilt: true });
            }, 500)
        }

        // Update app's height based on current window height
        const appDivElement = document.querySelector(".app_container");
        appDivElement.style.height = `${window.innerHeight}px`;
    }

    handleClick(event) {
        const helpDivElement = document.querySelector(".app_info_text_container");
        if (helpDivElement && helpDivElement.classList.contains("app_info_text_container_visible") && !helpDivElement.contains(event.target))
            this.handleToggleInfoSection();
    }

    componentDidMount() {
        window.addEventListener('click', this.handleClick);
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('click', this.handleClick);
    }

    handleChangeSearch(event) {
        this.setState({ searchName: event.target.value });
    }

    handleChangeLayoutSelect(event) {
        this.setState({ selectedLayout: event.target.value });
    }

    handleChangeNumOfRecipes(event) {
        this.setState({ numberOfRecipes: parseInt(event.target.innerText) });
    }

    handleChangeCategorySelect(selectedOption) {
        this.setState({ selectedCategory: selectedOption });

        // Blur the input element out of focus
        const categorySelectElement = document.getElementById("react-select-2-input");
        categorySelectElement.setAttribute('readonly', 'readonly'); // Force virtual keyboard on mobile screens to hide on input field.
        setTimeout(function () {
            categorySelectElement.blur();  // Actually unfocus element and close the virtual keyboard
            // Remove readonly attribute after virtual keyboard is hidden.
            categorySelectElement.removeAttribute('readonly');
        }, 100);
    }

    handleChangeIsDarkMode() {
        this.setState(prevState => ({ ...prevState, isDarkMode: !prevState.isDarkMode }));
    }

    async handleSubmit(event) {
        event.preventDefault();

        // Remove focus from input element
        const inputElement = document.querySelector(".recipe_search_input");
        inputElement.blur();

        if (this.state.searchName === this.state.previouslySearchedName && this.state.selectedCategory.value === this.state.previouslySelectedCategory.value) return;

        this.setState({ isLoading: true, searchItemsResults: [], nodeClicked: null, previousNodeClickedId: "" });

        const nameStringParsed = this.state.searchName.replaceAll(' ', '+');
        let finalQueryString = "";
        if (this.state.selectedCategory.value === 'any') {
            finalQueryString = 'https://api.spoonacular.com/recipes/complexSearch?apiKey=' + SPOONACULAR_API_KEY + '&query=' + nameStringParsed + '&number=6&addRecipeInformation=true';
        } else {
            const typeStringParsed = this.state.selectedCategory.value.replaceAll(' ', '+');
            finalQueryString = 'https://api.spoonacular.com/recipes/complexSearch?apiKey=' + SPOONACULAR_API_KEY + '&query=' + nameStringParsed + '&number=6&addRecipeInformation=true&type=' + typeStringParsed;
        }

        let newSearchItemsResults = [];

        await axios.get(finalQueryString)
            .then((response) => {
                if (response.status === 402 || response.status === 429) {
                    console.log("API not reachable, using dummy data instead")
                    querySearchDataBurger.results.forEach(item => newSearchItemsResults.push(item));
                } else {
                    response.data.results.forEach(item => newSearchItemsResults.push(item));
                }

                //this.setState({ searchItemsResults: newSearchItemsResults });
            })
            .catch(err => {
                console.log(err);
                console.log("API not reachable, using dummy data instead")
                querySearchDataBurger.results.forEach(item => newSearchItemsResults.push(item));
            });

        this.setState({ searchItemsResults: newSearchItemsResults });
        this.setState({ isLoading: false, searchNameWasSubmitted: true, previouslySearchedName: this.state.searchName, previouslySelectedCategory: this.state.selectedCategory });
    }

    getNodeColor(item) {
        let itemRating = item.readyInMinutes;
        if (itemRating >= 0 && itemRating <= 10) return 'rgba(132, 227, 108, 1)';
        else if (itemRating <= 30) return 'rgba(223, 220, 45, 1)';
        else if (itemRating <= 45) return 'rgba(216, 167, 19, 1)';
        else if (itemRating <= 60) return 'rgba(219, 100, 9, 1)';
        else return 'rgba(218, 0, 0, 1)';
    }

    getNodeSize(item) {
        return item.servings * 10 + 100;
    }

    showGraphLayoutInfoButton() {
        const infoContainer = document.querySelector(".graph_layout_info");
        if (infoContainer.classList.contains("graph_layout_info_hidden")) {
            infoContainer.classList.replace("graph_layout_info_hidden", "graph_layout_info_visible");
            setTimeout(() => infoContainer.classList.replace("graph_layout_info_visible", "graph_layout_info_hidden"), 3000);
        }
    }

    handleToggleInfoSection(event) {
        if (event) event.stopPropagation();
        const appInfoDescriptionContainer = document.querySelector(".app_info_text_container");
        if (appInfoDescriptionContainer.classList.contains("app_info_text_container_hidden")) {
            appInfoDescriptionContainer.classList.replace("app_info_text_container_hidden", "app_info_text_container_visible");
        } else {
            appInfoDescriptionContainer.classList.replace("app_info_text_container_visible", "app_info_text_container_hidden");
        }
    }

    handleGraphNodeClick(event, item) {
        const [currentItem, currentId] = event === null ? [item, item.id] : [event.data.node, event.data.node.id];
        if (currentId === this.state.previousNodeClickedId) return;

        this.setState({ searchNameWasSubmitted: false, previouslySearchedName: "", previouslySelectedCategory: { value: '', label: '' }, nodeClicked: currentItem, previousNodeClickedId: currentId, isNodeImageLoaded: false });
    }

    parseRecipeTitleString(titleString) {
        if (titleString.length <= 52) return titleString;
        else return titleString.toString().slice(0, 52) + '...';
    }

    changeIsNodeImageLoaded(booleanValue) {
        this.setState({ isNodeImageLoaded: booleanValue ? true : false });
    }

    async buildGraphAlgorithm(item) {
        //If graph to be built is already built, simply show the searched recipe in the side bar and return
        if (item.id === this.state.recipeIdPreviousGraphBuilt) {
            this.handleGraphNodeClick(null, item);
            return;
        }

        this.setState({ isLoading: true, isGraphLoading: true, isGraphBuilt: false, searchNameWasSubmitted: false, previouslySearchedName: "", previouslySelectedCategory: { value: '', label: '' }, previousNodeClickedId: "" });
        let myGraph = { nodes: [], edges: [] };       //Initialize graph variable
        let queryData = [];                         //Initialize variable that will hold the query response

        //Get main node first
        //let itemInfo = "";
        // await axios.get('https://api.spoonacular.com/recipes/' + item.id + '/information?apiKey='+ SPOONACULAR_API_KEY)
        //     .then((response) => {
        //         if(response.status===402 || response.status === 429) {
        //            itemInfo = queryDataInfo;
        //          }
        //          itemInfo = response.data
        //     })
        //     .catch(err => {
        //         console.log(err);
        //         return null;
        //     });


        // get similar nodes after (if necessary)
        await axios.get('https://api.spoonacular.com/recipes/' + item.id + '/similar?apiKey=' + SPOONACULAR_API_KEY + '&number=' + this.state.numberOfRecipes)
            .then((response) => {
                if (response.status === 402 || response.status === 429) {
                    console.log("API not reachable, using dummy data instead");
                    queryData = queryDataBurgerSimilar1;
                }
                else {
                    queryData = response.data;          //queryData holds the related recipes to the main recipe
                }
            })
            .catch(err => {
                console.log(err);
                console.log("API not reachable, using dummy data instead");
                queryData = queryDataBurgerSimilar1;
            });

        //If there are no related recipes, alert user
        if (queryData.length === 0) alert("This recipe doesn't have similar recipes :(");
        else {
            let relatedRecipes = [];      //Initialize variable that will hold the recipes related to the main recipe
            let mainNodeSize = this.getNodeSize(item);

            //Push main recipe node to graph
            myGraph.nodes.push({
                id: item.id,
                label: this.parseRecipeTitleString(item.title),
                title: this.parseRecipeTitleString(item.title),
                color: 'black',
                size: mainNodeSize,
                //category: item.dishTypes[0],
                image: item.image,
                readyInMinutes: item.readyInMinutes,
                servings: item.servings,
                imageType: item.imageType,
                sourceUrl: item.sourceUrl
                //numIngredients: itemInfo.extendedIngredients.length
            });

            //Push all related recipes inside queryData.results to relatedRecipes variable
            queryData.forEach(element => relatedRecipes.push(element))

            //For each recipe related to the main recipe, add node and edges to graph (if unique) and process its own related recipes
            for (let j = 0; j < relatedRecipes.length; j++) {
                let doesNodeExist = false;
                let doesEdgeExist = false;

                //Seach all existent nodes
                for (let m = 0; m < myGraph.nodes.length; m++) {

                    //If current recipe's id matches an existing node's id, don't add node and process edges
                    if (relatedRecipes[j].id === myGraph.nodes[m].id) {

                        //Search all existent edges
                        for (let o = 0; o < myGraph.edges.length; o++) {

                            //If existing recipe node already has an edge connecting to main recipe, dont add edge
                            if (('e' + relatedRecipes[j].id + 'e' + item.id === myGraph.edges[o].id) || ('e' + item.id + 'e' + relatedRecipes[j].id === myGraph.edges[o].id)) {
                                doesEdgeExist = true;
                                break;
                            }
                        }
                        //Add edge
                        if (!doesEdgeExist) {
                            myGraph.edges.push({ id: 'e' + item.id + 'e' + myGraph.nodes[m].id, source: item.id, target: myGraph.nodes[m].id, label: "SEES", color: 'rgba(164, 213, 246, 0.974)'/*, weight: 4*/ });
                        }
                        doesNodeExist = true;
                        break;
                    }
                }
                //Add node and edge
                if (!doesNodeExist) {
                    let eachNodeSize = this.getNodeSize(relatedRecipes[j]);
                    let eachNodeColor = this.getNodeColor(relatedRecipes[j]);
                    myGraph.nodes.push({
                        id: relatedRecipes[j].id,
                        label: this.parseRecipeTitleString(relatedRecipes[j].title),
                        title: this.parseRecipeTitleString(relatedRecipes[j].title),
                        size: eachNodeSize,
                        color: eachNodeColor,
                        //category: relatedRecipes[j].dishTypes[0],
                        image: relatedRecipes[j].image,
                        imageType: relatedRecipes[j].imageType,
                        readyInMinutes: relatedRecipes[j].readyInMinutes,
                        servings: relatedRecipes[j].servings,
                        sourceUrl: relatedRecipes[j].sourceUrl
                    });
                    myGraph.edges.push({ id: 'e' + item.id + 'e' + relatedRecipes[j].id, source: item.id, target: relatedRecipes[j].id, label: "SEES", color: 'rgba(164, 213, 246, 0.974)'/*, weight: 4*/ });
                }

                // Get similar nodes to each recipe
                let queryDataEachRelatedRecipe = [];     // Initialize variable that will hold the query response 

                // Define function to handle API unavailability by working with dummy data
                const getDummyDataForEachRelatedRecipe = (index) => {
                    switch (index + 1) {
                        case 1:
                            return queryDataBurgerSimilar11;
                        case 2:
                            return queryDataBurgerSimilar12;
                        case 3:
                            return queryDataBurgerSimilar13;
                        case 4:
                            return queryDataBurgerSimilar14;
                        case 5:
                            return queryDataBurgerSimilar15;
                        default:
                            return queryDataBurgerSimilar11;
                    }
                }

                await axios.get('https://api.spoonacular.com/recipes/' + relatedRecipes[j].id + '/similar?apiKey=' + SPOONACULAR_API_KEY + '&number=' + this.state.numberOfRecipes)
                    .then((response) => {
                        if (response.status === 402 || response.status === 429) {
                            console.log("API not reachable, using dummy data instead");
                            queryDataEachRelatedRecipe = getDummyDataForEachRelatedRecipe(j);
                        }
                        else {
                            queryDataEachRelatedRecipe = response.data;  //queryDataEachRelatedRecipe holds the related recipes to each of the main recipe's related recipes
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        console.log("API not reachable, using dummy data instead");
                        queryDataEachRelatedRecipe = getDummyDataForEachRelatedRecipe(j);
                    });

                let eachRecipeRelatedRecipes = [];       //Initialize variable that will hold the recipes related to each of the main recipe's related recipes
                //Push all related recipes inside queryDataEachRelatedRecipe.results to eachRecipeRelatedRecipes variable
                queryDataEachRelatedRecipe.forEach(element => eachRecipeRelatedRecipes.push(element));

                //For each recipe related to the main recipe's related recipes, add node and edges to graph (if unique)
                for (let l = 0; l < eachRecipeRelatedRecipes.length; l++) {
                    let doesNodeExistPhaseTwo = false;
                    let doesEdgeExistPhaseTwo = false;

                    //Search all existent nodes
                    for (let n = 0; n < myGraph.nodes.length; n++) {

                        //If current recipe's id matches an existing node's id, don't add node and process edges
                        if (eachRecipeRelatedRecipes[l].id === myGraph.nodes[n].id) {

                            //Search all existing edges
                            for (let p = 0; p < myGraph.edges.length; p++) {

                                //If existing recipe node already has an edge connecting to the current main recipe's related recipe, dont add edge
                                if (('e' + eachRecipeRelatedRecipes[l].id + 'e' + relatedRecipes[j].id === myGraph.edges[p].id) || ('e' + relatedRecipes[j].id + 'e' + eachRecipeRelatedRecipes[l].id === myGraph.edges[p].id)) {
                                    doesEdgeExistPhaseTwo = true;
                                    break;
                                }
                            }
                            //Add edge
                            if (!doesEdgeExistPhaseTwo) {
                                myGraph.edges.push({ id: 'e' + relatedRecipes[j].id + 'e' + myGraph.nodes[n].id, source: relatedRecipes[j].id, target: myGraph.nodes[n].id, label: "SEES", color: 'rgba(164, 213, 246, 0.974)'/*, weight: -1*/ });
                            }
                            doesNodeExistPhaseTwo = true;
                            break;
                        }
                    }
                    //Add node and edge
                    if (!doesNodeExistPhaseTwo) {
                        let eachNodeSize = this.getNodeSize(eachRecipeRelatedRecipes[l]);
                        let eachNodeColor = this.getNodeColor(eachRecipeRelatedRecipes[l]);
                        myGraph.nodes.push({
                            id: eachRecipeRelatedRecipes[l].id,
                            label: this.parseRecipeTitleString(eachRecipeRelatedRecipes[l].title),
                            title: this.parseRecipeTitleString(eachRecipeRelatedRecipes[l].title),
                            size: eachNodeSize,
                            color: eachNodeColor,
                            //category: eachRecipeRelatedRecipes[l].dishTypes[0],
                            image: eachRecipeRelatedRecipes[l].image,
                            imageType: eachRecipeRelatedRecipes[l].imageType,
                            readyInMinutes: eachRecipeRelatedRecipes[l].readyInMinutes,
                            servings: eachRecipeRelatedRecipes[l].servings,
                            sourceUrl: eachRecipeRelatedRecipes[l].sourceUrl
                        });
                        myGraph.edges.push({ id: 'e' + relatedRecipes[j].id + 'e' + eachRecipeRelatedRecipes[l].id, source: relatedRecipes[j].id, target: eachRecipeRelatedRecipes[l].id, label: "SEES", color: 'rgba(164, 213, 246, 0.974)'/*, weight: -1*/ });
                    }
                }
            }
        }

        item.title = this.parseRecipeTitleString(item.title);  // Parse item title before showing info on side bar
        this.handleGraphNodeClick(null, item);       // Show Recipe on side bar
        this.setState({ isLoading: false, isGraphLoading: true, graphJson: myGraph, isGraphBuilt: true, recipeIdPreviousGraphBuilt: item.id });
    }


    render() {
        const mealType = [
            { value: 'any', label: 'Any' },
            { value: 'main course', label: 'Main Course' },
            { value: 'side dish', label: 'Side Dish' },
            { value: 'dessert', label: 'Dessert' },
            { value: 'appetizer', label: 'Appetizer' },
            { value: 'salad', label: 'Salad' },
            { value: 'bread', label: 'Bread' },
            { value: 'breakfast', label: 'Breakfast' },
            { value: 'soup', label: 'Soup' },
            { value: 'beverage', label: 'Beverage' },
            { value: 'sauce', label: 'Sauce' },
            { value: 'marinade', label: 'Marinade' },
            { value: 'fingerfood', label: 'Fingerfood' },
            { value: 'snack', label: 'Snack' },
            { value: 'drink', label: 'Drink' }
        ];

        return (
            <div className={this.state.isDarkMode ? "app_container dark_mode" : "app_container"}>
                <Header />
                <main className="main_container">
                    <Sidebar
                        handleSubmit={this.handleSubmit}
                        showGraphLayoutInfoButton={this.showGraphLayoutInfoButton}
                        selectedLayout={this.state.selectedLayout}
                        handleChangeLayoutSelect={this.handleChangeLayoutSelect}
                        handleChangeNumOfRecipes={this.handleChangeNumOfRecipes}
                        selectedCategory={this.selectedCategory}
                        handleChangeCategorySelect={this.handleChangeCategorySelect}
                        searchName={this.state.searchName}
                        handleChangeSearch={this.handleChangeSearch}
                        mealType={mealType}
                        isLoading={this.state.isLoading}
                        nodeClicked={this.state.nodeClicked}
                        isNodeImageLoaded={this.state.isNodeImageLoaded}
                        searchNameWasSubmitted={this.state.searchNameWasSubmitted}
                        searchItemsResults={this.state.searchItemsResults}
                        buildGraphAlgorithm={this.buildGraphAlgorithm}
                        parseRecipeTitleString={this.parseRecipeTitleString}
                        changeIsNodeImageLoaded={this.changeIsNodeImageLoaded}
                    />
                    <Graph 
                        isGraphBuilt={this.state.isGraphBuilt}
                        selectedLayout={this.state.selectedLayout}
                        handleGraphNodeClick={this.handleGraphNodeClick}
                        graphJson={this.state.graphJson}
                        isGraphLoading={this.state.isGraphLoading}
                    />
                </main>
                <Footer />
                <DarkModeButton handleChangeIsDarkMode={this.handleChangeIsDarkMode} isDarkMode={this.state.isDarkMode} />
                <HelpButton handleToggleInfoSection={this.handleToggleInfoSection}></HelpButton>
                <HelpInfo handleToggleInfoSection={this.handleToggleInfoSection} />
            </div>
        );
    }
}
export default App;
