import React, { Component } from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import Slider from '@material-ui/core/Slider';
import Select from 'react-select';

export default class SidebarForm extends Component {

    render() {
        return (
            <form className="sidebar_form" onSubmit={this.props.handleSubmit}>
                <div className="sidebar_form_radio_container">
                    <label>
                        <p> Graph Layout </p>
                        <Button>
                            <InfoOutlinedIcon className="info" onClick={this.props.showGraphLayoutInfoButton} />
                        </Button>
                        <p className="graph_layout_info graph_layout_info_hidden">Layout algorithm to use</p>
                    </label>
                    <RadioGroup className="graph_layout_radio_select" aria-label="Graph Layout" name="graphlayout" value={this.props.selectedLayout} onChange={this.props.handleChangeLayoutSelect}>
                        <FormControlLabel className="form_lab" value="Force Atlas 2" control={<Radio />} label="Force Atlas 2" />
                        <FormControlLabel className="form_lab" value="Force Link" control={<Radio />} label="Force Link" />
                    </RadioGroup>
                </div>
                <div className="options_filter">
                    <div className="number_of_games_slider_container">
                        <label component="legend">
                            Number of Recipes
                            <Slider defaultValue={3} aria-labelledby="discrete-slider" valueLabelDisplay="auto" step={1} marks={true} min={3} max={6} onChange={this.props.handleChangeNumOfRecipes} />
                        </label>
                    </div>
                    <div className="genres_select_input_container">
                        <label> Meals
                            <Select value={this.props.selectedCategory} onChange={this.props.handleChangeCategorySelect} options={this.props.mealType} />
                        </label>
                    </div>
                </div>
                <div className="recipe_search_input_container">
                    <label> Recipe Search
                        <input type="text" className="recipe_search_input" value={this.props.searchName} placeholder="Cheese burger" onChange={this.props.handleChangeSearch} />
                    </label>
                </div>
                <div className="recipe_search_button_container">
                    <Button className="recipe_search_button" variant="contained" type="submit">Search</Button>
                </div>
            </form>
        );
    }
}