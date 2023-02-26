import React, { Component } from 'react';
import { Col, Row } from 'reactstrap';
import Tooltip from "@material-ui/core/Tooltip";

import SidebarForm from './SidebarForm';


export default class Sidebar extends Component {
    constructor(props) {
        super(props);

        this.displaySideBarInformation = this.displaySideBarInformation.bind(this);
    }

    displaySideBarInformation() {
        if (this.props.isLoading) {
            return (
                <Row className="loading_row">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Loading</p>
                </Row>
            );
        } else {
            if (this.props.nodeClicked !== null) {
                let recipeName = this.props.nodeClicked.title;
                let recipeImage = "https://spoonacular.com/recipeImages/" + this.props.nodeClicked.id + "-480x360." + this.props.nodeClicked.imageType;

                return (
                    <Row className="recipe_clicked_description">
                        <Tooltip title={<span className='tooltip_container'>Create graph!</span>}/*"Create graph!"*/ placement="right">
                            <button type="submit" onClick={() => this.props.buildGraphAlgorithm(this.props.nodeClicked)}><h4> {recipeName} </h4></button>
                        </Tooltip>

                        <div className="recipe_information_charecteristics_container">
                            <a href={this.props.nodeClicked.sourceUrl} target="_blank" rel="noreferrer">
                                <img
                                    src={recipeImage}
                                    alt="Recipe"
                                    style={this.props.isNodeImageLoaded ? {} : { display: 'none' }}
                                    onLoad={() => this.props.changeIsNodeImageLoaded(true)}
                                />
                                {this.props.isNodeImageLoaded ? null :
                                    <Row className="loading_row">
                                        <i className="fas fa-spinner fa-spin"></i>
                                        <p>Loading</p>
                                    </Row>
                                }
                            </a>
                            <div className="recipe_characteristics_container">
                                <Tooltip title={<span className='tooltip_container'>Preparation</span>}/*"Preparation"*/ placement="left">
                                    <span>{this.props.nodeClicked.readyInMinutes}<br />Min.</span>
                                </Tooltip>
                                <Tooltip title={<span className='tooltip_container'>Servings</span>}/*"Servings"*/ placement="right">
                                    <span>{this.props.nodeClicked.servings}<br />Ser.</span>
                                </Tooltip>
                            </div>
                        </div>
                    </Row>
                );
            } else if (this.props.searchNameWasSubmitted) {
                if (this.props.searchItemsResults.length > 0) {
                    return (
                        <Row className="recipe_title_search_results">
                            <ul>
                                {this.props.searchItemsResults.map(item => (
                                    <li onClick={() => this.props.buildGraphAlgorithm(item)} key={item.id}>{this.props.parseRecipeTitleString(item.title)}</li>
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

    render() {
        return (
            <Col className="sidebar_content">
                <SidebarForm 
                    handleSubmit={this.props.handleSubmit} 
                    showGraphLayoutInfoButton={this.props.showGraphLayoutInfoButton} 
                    selectedLayout={this.props.selectedLayout} 
                    handleChangeLayoutSelect={this.props.handleChangeLayoutSelect} 
                    handleChangeNumOfRecipes={this.props.handleChangeNumOfRecipes} 
                    selectedCategory={this.props.selectedCategory} 
                    handleChangeCategorySelect={this.props.handleChangeCategorySelect} 
                    mealType={this.props.mealType} 
                    searchName={this.props.searchName} 
                    handleChangeSearch={this.props.handleChangeSearch} 
                />
                {this.displaySideBarInformation()}
            </Col>
        );
    }
}