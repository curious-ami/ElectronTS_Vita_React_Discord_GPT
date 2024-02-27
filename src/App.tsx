//import { useState } from "react";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";

import theme from "./window/theme.ts";

import "./window/main.css";

import WindowControl from "./window/control";
import Body from "./window/body";

function App() {
  //const [count, setCount] = useState(3);

  return (
    <>
      <div className="app">
        <div className="header-block">
          <WindowControl />
        </div>
        <div className="body-block">
          <ChakraProvider theme={theme}>
            <ColorModeScript initialColorMode={theme.config.initialColorMode} />

            <Body />
          </ChakraProvider>
        </div>
        <div className="footer-block"></div>
      </div>
    </>
  );
}

export default App;
