import React, { Component } from 'react';
import styles from './Footer.module.scss'

export default class Footer extends Component {

    render() {
        return (
            <footer>
                <div className={styles.footer_api_description}>
                    <p>Powered by <a href="https://spoonacular.com/food-api" target="_blank" rel="noreferrer">Spoonacular API</a></p>
                </div>
                <div className={styles.footer_info}>
                    <p className={styles.footer_text}>Copyright © 2022 Bruno Miguel</p>
                    <div className={styles.footer_icon_container}>
                        <a href="https://github.com/BMiguelDev/similar-recipes-network" target="_blank" rel="noreferrer">
                            <i className="fa-solid fa-code"></i>
                        </a>
                        <a href="https://bmigueldev.github.io/brunomiguel" target="_blank" rel="noreferrer">
                            <i className="fa-solid fa-desktop"></i>
                        </a>
                        <a href="https://github.com/BMiguelDev" target="_blank" rel="noreferrer">
                            <i className="fa-brands fa-github"></i>
                        </a>
                        <a href="https://www.linkedin.com/in/miguel--bruno/" target="_blank" rel="noreferrer">
                            <i className="fa-brands fa-linkedin"></i>
                        </a>
                    </div>
                </div>
            </footer>
        );
    }
}