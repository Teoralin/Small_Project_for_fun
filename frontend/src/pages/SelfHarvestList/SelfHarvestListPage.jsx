import React from 'react';
import classes from "./SelfHarvestListPage.module.css";
import Apple from "../../assets/Apple.png";

export default function SelfHarvestListPage() {
    return (
        <div className={classes.SelfHarvestListPage}>
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
                        id="eventSearch"
                        className={classes.searchInput}
                        placeholder="Search event"
                        //onChange={handleChange}
                        aria-label="Search event"
                    />
                </form>

                <button type="search" className={classes.SearchButton}>
                    Search
                </button>
            </div>

            <div className={classes.PageTitle}>
                <p>Self Harvest </p>
                <img
                    src={Apple}
                    alt="Apple Icon"
                    className={classes.icon}
                />
            </div>
        </div>
    )
}