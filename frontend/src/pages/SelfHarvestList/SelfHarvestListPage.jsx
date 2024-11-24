import classes from "./SelfHarvestListPage.module.css";
import { useState, useEffect } from "react";
import api from "../../api";

export default function SelfHarvestListPage() {
    const [error, setError] = useState(null);
    const [harvest, setHarvest] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(()=>{
        const fetchSelfHarvestEvents = async () => {
            try {
                const response = await api.get('/harvests');
                console.log(response);

                
                const today = new Date();
    
                const filteredEvents = response.data.filter(event => {
                const eventEndDate = new Date(event.end_date);
                return eventEndDate >= today; 
                });
                setHarvest(filteredEvents);

            } catch (err) {
                console.error('Error fetching self-harvest events:', err);
                setError('Failed to fetch self-harvest events');
                return [];
            }
        };
        fetchSelfHarvestEvents();
    }, []);

    const handleSearchChange = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = harvest.filter((user) =>
            user.Address.city.toLowerCase().includes(term) || 
            user.Address.street.toLowerCase().includes(term)
        );
        setHarvest(filtered);
    };


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
                        value={searchTerm}
                        onChange={handleSearchChange}
                        aria-label="Search event"
                    />
                </form>

                
            </div>

            <div className={classes.PageTitle}>
                <p>Self Harvest </p> 
            </div>

            <div className={classes.SelfHarvestEvents}>
                {harvest.length > 0 ? (
                    <div className={classes.SelfHarvestList}>
                        {harvest.map((event) => (
                            <div key={event.event_id} className={classes.SelfHarvestCard}>
                                <p>Harvest start date: {event.start_date}</p>
                                <p>Harvest end date: {event.end_date}</p>
                                {event.Address && (
                                    <div className={classes.EventAddress}>
                                        <h5>Event Address</h5>
                                            <p>city: {event.Address.city},
                                                postcode: {event.Address.post_code}</p>
                                            <p>street: {event.Address.street},
                                                house: {event.Address.house_number}</p>
                                    </div>
                                )}   
                            </div>
                        ))}
                    </div>
                    ) : ( 
                        error &&( <p>No self-harvest events yet.</p>)
                    )}
            </div>
        </div>
    )
}