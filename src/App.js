import React, { useEffect, useState, useCallback } from 'react';
import './App.css';

function App() {
  const [planets, setPlanets] = useState([]);
  const [nextPageUrl, setNextPageUrl] = useState(null); // State to store next page URL
  const [prevPageUrl, setPrevPageUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
    
  // const fetchPlanets = useCallback(async (url = null) => {
  //   try {
  //     let response;
  //     if (url) {
  //       response = await fetch(url);
  //     } else {
  //       response = await fetch('https://swapi.dev/api/planets/?format=json');
  //     }
  //     const data = await response.json();
  //     setPlanets((prevPlanets) => {
  //       if (url) {
  //         return data.results;
  //       } else {
  //         return [...prevPlanets, ...data.results];
  //       }
  //     });
  //     setNextPageUrl(data.next);
  //     setPrevPageUrl(data.previous);
  //     setTotalPages(Math.ceil(data.count / 10));
  //     setCurrentPage((prevPage) => (url ? (prevPage === 1 ? 1 : prevPage - 1) : prevPage));
  //   } catch (error) {
  //     console.error('Error fetching planets:', error);
  //   }
  // }, []);
  const fetchPlanets = useCallback(async (url) => {
    try {
      const response = await fetch('https://swapi.dev/api/planets/?format=json');
      const data = await response.json();
      const planetsWithResidents = await Promise.all(
        data.results.map(async planet => {
          const residents = await Promise.all(
            planet.residents.map(async residents => {
              const response = await fetch(residents);
              const residentData = await response.json();
              return residentData;
            })
          );
          return { ...planet, residents };
          })
      );
      setPlanets(planetsWithResidents);
      setNextPageUrl(data.next);
      setPrevPageUrl(data.previous);
      setTotalPages(Math.ceil(data.count / 12));
      setCurrentPage(getPageNumberFromUrl(url));
    }
    catch(error) {
      console.error('Error fetching planets:', error);
    }
  }, []);
  


  const getPageNumberFromUrl = (specificPageUrl) => {
    if (!specificPageUrl) {
      return 1; // or any default page number
    }
  
    const pageNumberRegex = /page=(\d+)/;
    const match = specificPageUrl.match(pageNumberRegex);
    return match ? parseInt(match[1]) : 1;
  };

  
  

  const handlePrevPage = (prevPageUrl) => { 
    console.log('Previous page clicked');
    if (prevPageUrl) { 
      setPrevPageUrl(prevPageUrl);
      setCurrentPage((currentPage) => Math.max(currentPage - 1, 1));
      fetchPlanets(prevPageUrl); 
    } 
  };
  
  
  const handleNextPage = (nextPageUrl) => { 
    console.log('Next page clicked'); 
    if (nextPageUrl) { 
      setNextPageUrl(nextPageUrl); 
      setCurrentPage((currentPage) => Math.min(currentPage + 1, totalPages));
      fetchPlanets(nextPageUrl); 
    } 
  };
  useEffect(() => {
    fetchPlanets();
  }, [fetchPlanets]);

  return (
    <div className="container">
      <header className='header'>
        <h1>Star Wars Planets Directory</h1>
      </header>
      <div className="planets-list">
        {planets.map(planet => (
          <div key={planet.name} className="planet-card">
            <h2>{planet.name}</h2>
            <p>Climate: {planet.climate}</p>
            <p>Population: {planet.population}</p>
            <p>Terrain: {planet.terrain}</p>
            <h3>Residents:</h3>
            <ul className='resident-list'>
              {planet.residents && planet.residents.length > 0 ? (
                planet.residents.map(residents => (
                  <li key={residents.name}>
                    <p><strong>Name:</strong> {residents.name} <br /></p>
                    <p><strong>Height:</strong> {residents.height}cm <br /></p>
                    <p><strong>Mass:</strong> {residents.mass}kg <br /></p>
                    <p><strong>Gender:</strong> {residents.gender}</p>
                  </li>
                ))
              ) :  'No Residents found'}
            </ul>
          </div>
        ))}
      </div>
      <div className="pagination-container">
        <button className='pagination-button' onClick={ handlePrevPage } disabled={prevPageUrl}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button className='pagination-button' onClick={ handleNextPage } disabled={!nextPageUrl}>Next Page</button>
      </div>
    </div>
  );
}

export default App;
