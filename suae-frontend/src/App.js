// /* eslint-disable react-hooks/exhaustive-deps */
// import React, { useState, useEffect } from 'react';
// import { BrowserRouter } from 'react-router-dom';
// import AppRoutes from "./AppRoutes";
// import { sdx } from "./sdx";
// import './index.css';
// import './App.css';
// import { SessionProvider } from './context/SessionContext';

// function App() {
//     const [state, changeState] = useState(false);
//     sdx.changeState = () => {
//         changeState(!state);
//     }

//     const init = () => { }

//     useEffect(() => {
//         init();
//     }, []);

//     return (
//         <SessionProvider>
//             <React.Fragment>
//                 <BrowserRouter basename={"/"}>
//                     <AppRoutes />
//                 </BrowserRouter>
//             </React.Fragment>
//         </SessionProvider>
//     );
// }

// export default App;

/* eslint-disable react-hooks/exhaustive-deps */




// import React, { useState, useEffect } from 'react';
// import { BrowserRouter } from 'react-router-dom';
// import AppRoutes from "./AppRoutes";
// import { sdx } from "./sdx";
// import './index.css';
// import './App.css';
// import { SessionProvider } from './context/SessionContext';
// import { ChoiceFillingProvider } from './contexts/ChoiceFillingContext';

// function App() {
//     const [state, changeState] = useState(false);
//     sdx.changeState = () => {
//         changeState(!state);
//     }

//     const init = () => {
//         // Theme loading is handled in Header component after login
//     }

//     useEffect(() => {
//         init();
//     }, []);

//     return (
//         <ChoiceFillingProvider>
//             <SessionProvider>
//                 <React.Fragment>
//                     <BrowserRouter basename={"/"}>
//                         <AppRoutes />
//                     </BrowserRouter>
//                 </React.Fragment>
//             </SessionProvider>
//         </ChoiceFillingProvider>
//     );
// }

// export default App;




import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { sdx } from './sdx';
import './index.css';
import './App.css';
import { SessionProvider } from './context/SessionContext';
import { ChoiceFillingProvider } from './contexts/ChoiceFillingContext';

function App() {
  const [, setRefreshKey] = useState(0);

  useEffect(() => {
    sdx.changeState = () => {
      setRefreshKey((prev) => prev + 1);
    };

    // Theme loading is handled in Header component after login

    return () => {
      sdx.changeState = null;
    };
  }, []);

  return (
    <BrowserRouter basename="/">
      <SessionProvider>
        <ChoiceFillingProvider>
          <AppRoutes />
        </ChoiceFillingProvider>
      </SessionProvider>
    </BrowserRouter>
  );
}

export default App;