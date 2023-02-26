import React, { Component } from 'react';

export default class HelpInfo extends Component {

    render() {
        return (
            <div className="app_info_text_container app_info_text_container_hidden">
                <i className="fa-solid fa-circle-info"></i>
                <p>
                    With this App you can generate a network graph to find recipes similar to your favourite ones!
                </p>
                <p>
                    Search for a recipe, filter by meal type and choose the number of similar recipes desired. If you like seeing things moving, you can also change the graph layout algorithm on the fly.
                </p>
                <span><span>Note</span>: The Spoonacular API has a limited number of queries, so if your search always returns "Burger" recipes, the daily queries have expired.</span>
                <div className="app_info_text_container_close" onClick={this.props.handleToggleInfoSection}>
                    <i className="fa-solid fa-xmark"></i>
                </div>
            </div>
        );
    }
}