import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [data, setData] = useState(null);
  const [possibleWordList, setPossibleWordList] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [displayWord, setDisplayWord] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [typoFound, setTypoFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const randomizeColorTheme = () => {
    const colors = [
      "pink",
      "salmon",
      "yellow",
      "chartreuse",
      "cornflowerblue",
      "blueviolet",
      "goldenrod",
      "palevioletred",
    ];
    const randomNum1 = Math.floor(Math.random() * colors.length);
    document.documentElement.style.setProperty(
      "--mainColor",
      colors[randomNum1]
    );
  };

  const clickToLookUp = (word) => {
    setIsLoading(true);
    setErrorMsg(null);
    setTypoFound(false);
    setDisplayWord(word);

    axios
      .get(
        `https://dictionaryapi.com/api/v3/references/sd4/json/${word}?key=${process.env.REACT_APP_DICTIONARY_API_KEY}`
      )
      .then((res) => {
        const json = res.data;
        // should only recieve correctly spelled words
        const filterData = json.filter((def) => {
          return def.shortdef.length > 0;
        });
        setData(filterData);
        setIsLoading(false);
        setInputValue("");
        randomizeColorTheme();
      })
      .catch((err) => {
        console.log(err.response);
      });
  };

  const wordLookUp = (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // make sure the inputValue only contains letters
    const myRegEx = /[^a-z]/i;
    if (myRegEx.test(inputValue)) {
      setErrorMsg(
        "Pocket Dictionary may not be able to support words containing numbers and symbols."
      );
    }

    setTypoFound(false);
    setDisplayWord(inputValue);
    setIsLoading(true);
    axios
      .get(
        `https://dictionaryapi.com/api/v3/references/sd4/json/${inputValue}?key=${process.env.REACT_APP_DICTIONARY_API_KEY}`
      )
      .then((res) => {
        const json = res.data;
        // check if word is correctly spelled
        if (typeof json[0] === "object") {
          // only handles correctly spelled words
          const filterData = json.filter((def) => {
            return def.shortdef.length > 0;
          });
          setData(filterData);
        } else if (typeof json[0] === "string") {
          setTypoFound(true);
          setPossibleWordList(json);
        }

        setIsLoading(false);
        setInputValue("");

        randomizeColorTheme();
      })
      .catch((err) => {
        console.log(err.response);
      });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>
          <span role="img" aria-label="book">
            📖
          </span>{" "}
          Pocket Dictionary
        </h1>
        <form>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" onClick={(e) => wordLookUp(e)}>
            <span role="img" aria-label="magnifying glass">
              🔍
            </span>
          </button>
        </form>

        {isLoading ? <h4>...</h4> : null}
        {typoFound && possibleWordList ? (
          <>
            <h3>Did you mean...</h3>
            <div className="possible-words">
              {possibleWordList.map((word, i) => {
                return (
                  <div
                    key={i}
                    className="word"
                    onClick={() => clickToLookUp(word)}
                  >
                    {word}
                  </div>
                );
              })}
            </div>
          </>
        ) : null}
        {data && !typoFound && !isLoading ? (
          <>
            <h2>{displayWord}</h2>
            {data[0].shortdef.map((d, i) => {
              return (
                <h5 className="definition" key={i}>
                  {d}
                </h5>
              );
            })}
          </>
        ) : null}
        {errorMsg && <h5>{errorMsg}</h5>}
      </header>
    </div>
  );
}

export default App;
