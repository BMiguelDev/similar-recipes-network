import React, { Component } from 'react';
import Tooltip from "@material-ui/core/Tooltip";

import styles from './HelpButton.module.scss';

export default class HelpButton extends Component {

    render() {
        return (
            <Tooltip title={<span className='tooltip_container'>Help</span>} placement="bottom">
                <div className={styles.app_information_button_container} onClick={this.props.handleToggleInfoSection}>
                    <i className="fa-solid fa-circle-info"></i>
                </div>
            </Tooltip>
        );
    }
}