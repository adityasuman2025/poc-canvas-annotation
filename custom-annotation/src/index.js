import React from 'react';
import ReactDOM from 'react-dom/client';
import Annotation from './Annotation';

import img from "./img/amrit.jpg";
//"https://tinypng.com/images/social/website.jpg"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Annotation
        image={img}
        width={900}
        loader={"loading"}
        error={"something went wrong"}
    />
);
