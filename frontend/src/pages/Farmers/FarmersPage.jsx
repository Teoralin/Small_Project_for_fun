import React from 'react';
import classes from './FarmersPage.module.css';

export default function FarmersPage() {


    return (
        <div className={classes.FarmersPage}>
            <div className={classes.search}>
                <form className={classes.searchContainer} role="search">
                    <img
                        loading="lazy"
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/39d3ffbacde2115b1f3ab9876df77e6f4cacb5d6b56a2314860468854d0f9fcd?placeholderIfAbsent=true&apiKey=e1ef14f8847548e5b6a397fcefa70042"
                        className={classes.searchIcon}
                        alt=""
                    />
                    <input
                        type="search"
                        id="farmerSearch"
                        className={classes.searchInput}
                        placeholder="Search farmer"
                        //onChange={handleChange}
                        aria-label="Search farmer"
                    />
                </form>

                <button type="search" className={classes.SearchButton}>
                    Search
                </button>

            </div>

        </div>
    )
}