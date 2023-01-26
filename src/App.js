import React, { Component } from 'react';
import { Col, Row } from 'reactstrap';
import { Sigma, RandomizeNodePositions, /* EdgeShapes, NodeShapes, RelativeSize */ } from 'react-sigma';
import ForceLink from 'react-sigma/lib/ForceLink';
import ForceAtlas2 from 'react-sigma/lib/ForceAtlas2';
import axios from 'axios';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import Slider from '@material-ui/core/Slider';
import Tooltip from "@material-ui/core/Tooltip";
import Select from 'react-select';

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
        this.buildGraphAlgorithm1 = this.buildGraphAlgorithm1.bind(this);
        this.displaySideBarInformation = this.displaySideBarInformation.bind(this);
        this.displayGraph = this.displayGraph.bind(this);
    }

    handleResize() {
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
                    querySearchDataBurger.results.forEach(item => newSearchItemsResults.push(item));
                } else {
                    response.data.results.forEach(item => newSearchItemsResults.push(item));
                }

                this.setState({ searchItemsResults: newSearchItemsResults });
            })
            .catch(err => {
                console.log(err);
                return null;
            });

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
        this.setState({ searchNameWasSubmitted: false, previouslySearchedName: "", previouslySelectedCategory: { value: '', label: '' }, nodeClicked: currentItem, previousNodeClickedId: currentId });
    }

    parseRecipeTitleString(titleString) {
        if (titleString.length <= 52) return titleString;
        else return titleString.toString().slice(0, 52) + '...';
    }

    async buildGraphAlgorithm1(item) {
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
                    queryData = queryDataBurgerSimilar1;
                }
                queryData = response.data;          //queryData holds the related recipes to the main recipe
            })
            .catch(err => {
                console.log(err);
                return null;
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
                let queryDataEachRelatedRecipe = [];     //Initialize variable that will hold the query response    
                await axios.get('https://api.spoonacular.com/recipes/' + relatedRecipes[j].id + '/similar?apiKey=' + SPOONACULAR_API_KEY + '&number=' + this.state.numberOfRecipes)
                    .then((response) => {
                        if (response.status === 402 || response.status === 429) {
                            switch (j + 1) {
                                case 1:
                                    queryDataEachRelatedRecipe = queryDataBurgerSimilar11;
                                    break;
                                case 2:
                                    queryDataEachRelatedRecipe = queryDataBurgerSimilar12;
                                    break;
                                case 3:
                                    queryDataEachRelatedRecipe = queryDataBurgerSimilar13;
                                    break;
                                case 4:
                                    queryDataEachRelatedRecipe = queryDataBurgerSimilar14;
                                    break;
                                case 5:
                                    queryDataEachRelatedRecipe = queryDataBurgerSimilar15;
                                    break;
                                default:
                                    queryDataEachRelatedRecipe = queryDataBurgerSimilar11;
                            }
                        }
                        queryDataEachRelatedRecipe = response.data;  //queryDataEachRelatedRecipe holds the related recipes to each of the main recipe's related recipes
                    })
                    .catch(err => {
                        console.log(err);
                        return null;
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
        this.handleGraphNodeClick(null, item);       //Show Recipe on side bar
        this.setState({ isLoading: false, isGraphLoading: true, graphJson: myGraph, isGraphBuilt: true, recipeIdPreviousGraphBuilt: item.id });
    }

    displaySideBarInformation() {
        if (this.state.isLoading) {
            return (
                <Row className="loading_row">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Loading</p>
                </Row>
            );
        } else {
            if (this.state.nodeClicked !== null) {
                let recipeName = this.state.nodeClicked.title;
                let recipeImage = "https://spoonacular.com/recipeImages/" + this.state.nodeClicked.id + "-480x360." + this.state.nodeClicked.imageType;

                return (
                    <Row className="recipe_clicked_description">
                        <Tooltip title="Create graph!" placement="right">
                            <button type="submit" onClick={() => this.buildGraphAlgorithm1(this.state.nodeClicked)}><h4> {recipeName} </h4></button>
                        </Tooltip>

                        <div className="recipe_information_charecteristics_container">
                            <a href={this.state.nodeClicked.sourceUrl} target="_blank" rel="noreferrer">
                                <img
                                    src={recipeImage}
                                    alt="Recipe"
                                />
                            </a>
                            <div className="recipe_characteristics_container">
                                <Tooltip title="Preparation" placement="left">
                                    <span>{this.state.nodeClicked.readyInMinutes}<br />Min.</span>
                                </Tooltip>
                                <Tooltip title="Servings" placement="right">
                                    <span>{this.state.nodeClicked.servings}<br />Ser.</span>
                                </Tooltip>
                            </div>
                        </div>
                    </Row>
                );
            } else if (this.state.searchNameWasSubmitted) {
                if (this.state.searchItemsResults.length > 0) {
                    return (
                        <Row className="recipe_title_search_results">
                            <ul>
                                {this.state.searchItemsResults.map(item => (
                                    <li onClick={() => this.buildGraphAlgorithm1(item)} key={item.id}>{this.parseRecipeTitleString(item.title)}</li>
                                ))}
                            </ul>
                        </Row>
                    );
                } else {
                    return (
                        <Row className="recipe_title_search_results_empty">
                            <p> No results for that query, try something else!</p>
                        </Row>
                    );
                }
            } else return;
        }
    }

    displayGraph() {
        if (this.state.isGraphBuilt) {
            if (this.state.selectedLayout === 'Force Atlas 2') {
                return (
                    <Sigma className="sigma_graph" style={{ width: "100%", height: "100%" }} onClickNode={this.handleGraphNodeClick} graph={this.state.graphJson} settings={{ drawEdges: true, clone: false, defaultLabelColor: 'rgba(43, 144, 222, 0.975)' }}>
                        {/* <RelativeSize initialSize={1} /> */}
                        <RandomizeNodePositions />
                        <ForceAtlas2 easing="cubicInOut" gravity={2} /* this attracts nodes connected with edges of positive weight*/ edgeWeightInfluence={4} />
                    </Sigma>
                )
            }
            else if (this.state.selectedLayout === 'Force Link') {
                const angle = Math.PI / 3;
                return (
                    <Sigma className="sigma_graph" style={{ width: "100%", height: "100%" }} onClickNode={this.handleGraphNodeClick} graph={this.state.graphJson} settings={{ drawEdges: true, clone: false, defaultLabelColor: 'rgba(43, 144, 222, 0.975)' }}>
                        {/* <RelativeSize initialSize={1} /> */}
                        <RandomizeNodePositions />
                        <ForceLink nodeSiblingsAngleMin={angle} edgeWeightInfluence={2}/* this attracts nodes connected with edges of positive weight edgeWeightInfluence={2}*/ />
                    </Sigma>
                )
            }
        } else if (this.state.isGraphLoading) {
            return (
                <div className="graph_loading_container">
                    <i className="fas fa-spinner fa-spin"></i>
                </div>
            )
        } else {
            return (
                <div className="empty_graph_container">
                    <i className="fa-regular fa-face-smile"></i>
                    <div className="empty_graph_container_description">
                        <h4>Search for a recipe and click it to build a network graph of similar recipes!</h4>
                        <p>
                            You can then drag to explore the graph and search each node.
                            Nodes are colored based on preparation time and sized based on number of servings.
                        </p>
                    </div>
                </div>
            )
        }
    }

    // TODO: 
    // - fix static data not showing when API calls arent available/no internet
    // - on resize, unbuild graph and rebuild graph with the data present in the state


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
                <header className="header">
                    <h3>Recipe Suggestions Network</h3>
                    <i className="fa-solid fa-mug-saucer"></i>
                    {/* <i className="fa-solid fa-utensils"></i> */}
                </header>
                <main className="main_container">
                    <Col className="sidebar_content">
                        <form className="sidebar_form" onSubmit={this.handleSubmit}>
                            <div className="sidebar_form_radio_container">
                                <label>
                                    <p> Graph Layout </p>
                                    <Button>
                                        <InfoOutlinedIcon className="info" onClick={this.showGraphLayoutInfoButton} />
                                    </Button>
                                    <p className="graph_layout_info graph_layout_info_hidden">Layout algorithm to use</p>
                                </label>
                                <RadioGroup className="graph_layout_radio_select" aria-label="Graph Layout" name="graphlayout" value={this.state.selectedLayout} onChange={this.handleChangeLayoutSelect}>
                                    <FormControlLabel className="form_lab" value="Force Atlas 2" control={<Radio />} label="Force Atlas 2" />
                                    <FormControlLabel className="form_lab" value="Force Link" control={<Radio />} label="Force Link" />
                                </RadioGroup>
                            </div>
                            <div className="options_filter">
                                <div className="number_of_games_slider_container">
                                    <label component="legend">
                                        Number of Recipes
                                        <Slider
                                            defaultValue={3}
                                            aria-labelledby="discrete-slider"
                                            valueLabelDisplay="auto"
                                            step={1}
                                            marks={true}
                                            min={3}
                                            max={6}
                                            onChange={this.handleChangeNumOfRecipes}
                                        />
                                    </label>
                                </div>
                                <div className="genres_select_input_container">
                                    <label> Meals
                                        <Select
                                            value={this.selectedCategory}
                                            onChange={this.handleChangeCategorySelect}
                                            options={mealType}

                                            onBlur={event => event.preventDefault()}
                                            blurInputOnSelect={false}
                                        // https://react-select.com/styles#the-styles-prop
                                        // TODO: remove this
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="recipe_search_input_container">
                                <label> Recipe Search
                                    <input
                                        type="text"
                                        className="recipe_search_input"
                                        value={this.state.searchName}
                                        placeholder="Cheese burger"
                                        onChange={this.handleChangeSearch}
                                    />
                                </label>
                            </div>
                            <div className="recipe_search_button_container">
                                <Button className="recipe_search_button" variant="contained" type="submit">Search</Button>
                            </div>
                        </form>
                        {this.displaySideBarInformation()}
                    </Col>
                    <Col className="graph_container">
                        {this.displayGraph()}
                    </Col>
                </main>
                <footer>
                    <div className="footer_api_description">
                        <p>Powered by <a href="https://spoonacular.com/food-api" target="_blank" rel="noreferrer">Spoonacular API</a></p>
                    </div>
                    <div className="footer_info">
                        <p className="footer_text">Copyright © 2022 Bruno Miguel</p>
                        <div className="footer_icon_container">
                            <a href="https://github.com/BMiguelDev/similar-recipes-network" target="_blank" rel="noreferrer">
                                <i className="fa-solid fa-code"></i>
                            </a>
                            <a href="https://google.com" target="_blank" rel="noreferrer">
                                <i className="fa-solid fa-desktop"></i>
                            </a>
                            <a href="https://github.com/BMiguelDev" target="_blank" rel="noreferrer">
                                <i className="fa-brands fa-github"></i>
                            </a>
                            <a href="https://google.com" target="_blank" rel="noreferrer">
                                <i className="fa-brands fa-linkedin"></i>
                            </a>
                        </div>
                    </div>
                </footer>
                <div className="dark_mode_container" onClick={this.handleChangeIsDarkMode}>
                    {this.state.isDarkMode ? (<i className="fa-solid fa-moon"></i>) : (<i className="fa-solid fa-sun"></i>)}
                </div>

                <Tooltip title="Help" placement="bottom">
                    <div className="app_information_button_container" onClick={this.handleToggleInfoSection}>
                        <i className="fa-solid fa-circle-info"></i>
                    </div>
                </Tooltip>

                <div className="app_info_text_container app_info_text_container_hidden">
                    <i className="fa-solid fa-circle-info"></i>
                    <p>
                        With this App you can generate a network graph to find recipes similar to your favourite ones!
                    </p>
                    <p>
                        Search for a recipe, filter by meal type and choose the number of similar recipes desired. If you like seeing things moving, you can also change the graph layout algorithm on the fly.
                    </p>
                    <span><span>Note</span>: The Spoonacular API has a limited number of queries, so if your search always returns "Burger" recipes, the daily queries have expired.</span>
                    <div className="app_info_text_container_close" onClick={this.handleToggleInfoSection}>
                        <i className="fa-solid fa-xmark"></i>
                    </div>
                </div>
            </div>
        );
    }
}
export default App;
