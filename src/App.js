import React, { useState, useEffect } from "react";
import {
   FormControl,
   Select,
   MenuItem,
   Card,
   CardContent,
} from "@material-ui/core";
import InfoBox from "./InfoBox";
import Map from "./Map";
import "./App.css";
import Table from "./Table";
import { sortData, prettyPrintStat } from "./util";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";

const App = () => {
   const defaultMapCenter = {
      lat: 34.80746,
      lng: -40.4796,
   };
   //STATE is how to write a variable in React
   const [countries, setCountries] = useState([]);
   const [country, setCountry] = useState("worldwide");
   const [countryInfo, setCountryInfo] = useState({});
   const [tableData, setTableData] = useState([]);
   const [mapCenter, setMapCenter] = useState({
      lat: defaultMapCenter.lat,
      lng: defaultMapCenter.lng,
   });
   const [mapZoom, setMapZoom] = useState(3);
   const [mapCountries, setMapCountries] = useState([]);
   const [casesType, setCasesType] = useState("cases");

   //Get countries from API
   //https://disease.sh/v3/covid-19/countries

   //USE EFFECT runs a piece of code based on a given condition
   useEffect(() => {
      fetch("https://disease.sh/v3/covid-19/all")
         .then((response) => response.json())
         .then((data) => {
            setCountryInfo(data);
         });
   }, []);

   useEffect(() => {
      // The code inside here will run once
      // when the component loads and not again,
      //as well as when the input variables changes (i.e. when countries variable changes)

      // async -> send a request, wait for it, do something with it
      const getCountriesData = async () => {
         await fetch("https://disease.sh/v3/covid-19/countries")
            .then((response) => response.json())
            .then((data) => {
               const countries = data.map((country) => ({
                  name: country.country,
                  value: country.countryInfo.iso2,
               }));

               const sortedData = sortData(data);
               setTableData(sortedData);
               setCountries(countries);
               setMapCountries(data);
               //console.log("COUNTRIES DATA >>> ", data);
            });
      };

      getCountriesData();
   }, []);

   const onCountryChange = async (event) => {
      const countryCode = event.target.value;
      //console.log("Country changed to ", countryCode);
      //worldwide - https://disease.sh/v3/covid-19/all
      //selected country - https://disease.sh/v3/covid-19/countries/[COUNTRY_CODE]
      const url =
         countryCode === "worldwide"
            ? "https://disease.sh/v3/covid-19/all"
            : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

      await fetch(url)
         .then((response) => response.json())
         .then((data) => {
            setCountry(countryCode);
            setCountryInfo(data); //all data from the country response
            setMapCenter([
               data.countryInfo == undefined
                  ? defaultMapCenter.lat
                  : data.countryInfo.lat,
               data.countryInfo == undefined
                  ? defaultMapCenter.lng
                  : data.countryInfo.long,
            ]);
            setMapZoom(data.countryInfo == undefined ? 3 : 4);
            //console.log("COUNTRY INFO >>> ", data.countryInfo);
         });
   };

   return (
      <div className="app">
         <div className="app__left">
            {/* Header */}
            {/* Title + Worldwide selector */}
            <div className="app__header">
               <h1>COVID-19 TRACKER</h1>
               <FormControl className="app__dropdown">
                  <Select
                     variant="outlined"
                     value={country}
                     onChange={onCountryChange}
                  >
                     <MenuItem value="worldwide">Worldwide</MenuItem>
                     {countries.map((country) => (
                        <MenuItem value={country.value}>
                           {country.name}
                        </MenuItem>
                     ))}
                  </Select>
               </FormControl>
            </div>

            <div className="app__stats">
               {/* InfoBox - New */}
               <InfoBox
                  isRed
                  active={casesType === "cases"}
                  onClick={(e) => setCasesType("cases")}
                  title="Coronavirus cases"
                  cases={prettyPrintStat(countryInfo.todayCases)}
                  total={prettyPrintStat(countryInfo.cases)}
               />

               {/* InfoBox - Recovered */}
               <InfoBox
                  active={casesType === "recovered"}
                  onClick={(e) => setCasesType("recovered")}
                  title="Recovered"
                  cases={prettyPrintStat(countryInfo.todayRecovered)}
                  total={prettyPrintStat(countryInfo.recovered)}
               />

               {/* InfoBox - Deaths */}
               <InfoBox
                  isRed
                  active={casesType === "deaths"}
                  onClick={(e) => setCasesType("deaths")}
                  title="Deaths"
                  cases={prettyPrintStat(countryInfo.todayDeaths)}
                  total={prettyPrintStat(countryInfo.deaths)}
               />
            </div>

            {/* Map */}
            <Map
               casesType={casesType}
               countries={mapCountries}
               center={mapCenter}
               zoom={mapZoom}
            />
         </div>
         <Card className="app__right">
            <CardContent>
               <h3>Live Cases by Country</h3>
               <Table countries={tableData} />
               <h3 className="graphTitle">Worldwide new {casesType}</h3>
               <LineGraph className="app__graph" casesType={casesType} />
               {/* Graph */}
            </CardContent>
         </Card>
      </div>
   );
};

export default App;
