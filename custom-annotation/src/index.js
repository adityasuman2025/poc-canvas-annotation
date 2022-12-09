import React from 'react';
import ReactDOM from 'react-dom/client';
import Annotation from './Annotation';

import cicleImg from "./circle.png";
import tickImg from "./tick.png";
import crossImg from "./cross.png";

import img from "./img/amrit.jpg";
//"https://tinypng.com/images/social/website.jpg"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AnnotationWrapper />);

function AnnotationWrapper() {
    function handleChange(annot) {
        localStorage.setItem("annot", JSON.stringify(annot)); //storing annotations in localStorage
    }

    return (
        <div>
            <Annotation
                image={img}
                width={1000}
                loader={"loading"}
                error={"something went wrong"}
                shapes={{
                    tick: tickImg,
                    cross: crossImg,
                    cicle: cicleImg,
                }}
                annotationData={JSON.parse(localStorage.getItem("annot") || "[]")}
                onChange={handleChange}
            />
        </div>

    )
}