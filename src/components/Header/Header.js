import React, { Component } from 'react';
import styles from './Header.module.scss'

export default class Header extends Component {

    render() {
        return (
            <header className={styles.header}>
                <h3>Recipe Suggestions Network</h3>
                <i className="fa-solid fa-mug-saucer"></i>
                {
                    /* <i className="fa-solid fa-utensils"></i> */
                }
            </header>
        );
    }
}