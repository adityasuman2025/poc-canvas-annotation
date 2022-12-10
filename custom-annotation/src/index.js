import React from 'react';
import ReactDOM from 'react-dom/client';
import Annotation from './Annotation';

import cicleImg from "./circle.png";
import tickImg from "./tick.png";
import crossImg from "./cross.png";

import img from "./img/amrit.jpg";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AnnotationWrapper />);

function AnnotationWrapper({
    annotationData = JSON.parse(localStorage.getItem("annotData") || "{}"),
}) {
    function handleChange(annotData) {
        localStorage.setItem("annotData", JSON.stringify(annotData)); //storing annotations in localStorage
    }

    return (
        <Annotation
            image={"https://tinypng.com/images/social/website.jpg"} //"https://tinypng.com/images/social/website.jpg"
            width={annotationData.width}
            loader={"loading"}
            error={"something went wrong"}
            shapes={{
                tick: tickImg,
                cross: crossImg,
                cicle: cicleImg,
            }}
            annotationData={annotationData.annotations}
            onChange={handleChange}
        />
    )
}