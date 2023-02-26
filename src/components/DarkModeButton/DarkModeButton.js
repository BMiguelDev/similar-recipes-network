import React, { Component } from 'react';
import styles from './DarkModeButton.module.scss';

export default class DarkModeButton extends Component {

    render() {
        return (
            <div className={styles.dark_mode_container} onClick={this.props.handleChangeIsDarkMode}>
                {this.props.isDarkMode ? <i className="fa-solid fa-moon"></i> : <i className="fa-solid fa-sun"></i>}
            </div>
        );
    }
}