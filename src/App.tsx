//import { useState } from "react";

import "./window/main.css";

import WindowControl from "./window/control";

function App() {
  //const [count, setCount] = useState(3);

  return (
    <>
      <div className="app">
        <div className="header-block">
          <WindowControl />
        </div>

        <div className="body-block"></div>

        <div className="footer-block"></div>
      </div>
    </>
  );
}

export default App;
