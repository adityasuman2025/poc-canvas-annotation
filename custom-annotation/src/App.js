import React, { useEffect, useState } from "react";
import { ResizeProvider, ResizeConsumer } from "react-resize-context"; //ref: https://codesandbox.io/embed/jjjmp4z6yy

import img from "./amrit.jpg";
import tickImg from "./tick.png";
import crossImg from "./cross.png";

import deleteImg from "./delete.png";
import rotateImg from "./rotate.png";

function myDebounce(functionToRun, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => { functionToRun.call(this, ...args) }, delay)
    }
}

function App() {
    const [imgDim, setImgDim] = useState({ height: 0, width: 0 });

    const [selectedBtn, setSelectedBtn] = useState("");
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const [annot, setAnnot] = useState([]);
    const [selectedAnnot, setSelectedAnnot] = useState("");

    useEffect(() => {
        const imgEle = document.createElement("img");
        imgEle.src = img;
        imgEle.onload = function () {
            setImgDim({ height: imgEle.height / 2.2, width: imgEle.width / 1.5 });
        }
    }, []);

    function handleBtnClick(type) {
        setSelectedBtn(type);
    }

    function handleCanvasMouseMove(e) {
        setMousePos({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    }

    function handleCanvasClick() {
        setAnnot([...annot, { src: selectedBtn, pos: { x: mousePos.x, y: mousePos.y } }]);
    }

    function handleAnnotClick(e, idx) {
        e.stopPropagation();

        setSelectedAnnot(idx);
        console.log("handleAnnotClick", idx)
    }

    function handleAnotDeleteClick(e, idx) {
        setSelectedAnnot("");
        setAnnot(annot.filter((item, i) => i != idx));
    }

    function handleAnotMoveStart(e, idx) {
        const { offsetLeft: canvasOffsetLeft, offsetTop: canvasOffsetTop } = document.getElementById("canvas") || {};

        const { width = 0, height = 0 } = annot[idx].size || {};

        const newX = e.pageX - canvasOffsetLeft - width / 2, newY = e.pageY - canvasOffsetTop - height / 2;
        if (newX >= 0 && newY >= 0) {
            //to-do add limit condition for img top-right, bottom-left and bottom right too
            setAnnot(annot.map((item, i) => {
                if (i == idx) item.pos = { x: newX, y: newY }
                return item;
            }));
        }

        setTimeout(() => e.target.style.display = "none", 0);
    }

    function handleAnotMoveEnd(e, idx) {
        e.target.style.display = "block";
    }

    function handleAnnotResize(size, idx) {
        setAnnot(annot.map((item, i) => {
            if (i == idx) item.size = size;
            return item;
        }));
    }

    function handleAnotRotateStart(e, idx) {
        const { offsetLeft: canvasOffsetLeft, offsetTop: canvasOffsetTop } = document.getElementById("canvas") || {};

        const { x = 0, y = 0 } = annot[idx].pos || {};
        const { width = 0, height = 0 } = annot[idx].size || {};

        const centerX = x + width / 2, centerY = y + height / 2;
        const newX = e.pageX - canvasOffsetLeft, newY = e.pageY - canvasOffsetTop;

        if (e.pageX && e.pageY) {
            const angle = Math.atan2(newY - centerY, newX - centerX) * (180 / Math.PI);

            // if (angle <= -86 && angle >= -87) return; //because there is a sudden jump in angle for the first tym we start rotating

            setAnnot(annot.map((item, i) => {
                if (i == idx) item.rotate = angle;
                return item;
            }));
        }

        setTimeout(() => e.target.style.display = "none", 0);
    }

    function handleAnotRotateEnd(e, idx) {
        e.target.style.display = "block";
    }

    return (
        <div>
            <br />
            <div><button onClick={() => handleBtnClick(tickImg)}><img src={tickImg} /></button></div>
            <div><button onClick={() => handleBtnClick(crossImg)}><img src={crossImg} /></button></div>
            <br /><br />

            {
                imgDim.height ?
                    <div
                        id="canvas"
                        style={{ height: imgDim.height, width: imgDim.width, backgroundImage: `url(${img})` }}
                        onMouseMove={handleCanvasMouseMove}
                        onClick={handleCanvasClick}
                    >
                        {
                            annot.map(({ src, pos, size, rotate = 0 }, idx) => {
                                return (
                                    <div
                                        className={idx == selectedAnnot ? "annot selectedAnnot" : "annot"}
                                        key={idx}
                                        style={{ top: pos.y, left: pos.x }}
                                        onClick={(e) => handleAnnotClick(e, idx)}
                                    >
                                        <div className="annotContent">
                                            <ResizeProvider>
                                                <ResizeConsumer
                                                    className="annotImg"
                                                    style={ size ? { width: size.width, height: size.height } : {} }
                                                    onSizeChanged={(size) => handleAnnotResize(size, idx)}
                                                    onDrag={(e) => myDebounce(handleAnotMoveStart, 80)(e, idx)}
                                                    onDragEnd={(e) => handleAnotMoveEnd(e, idx)}
                                                >
                                                    <img 
                                                        style={ rotate ? { transform: `rotate(${rotate}deg)` } : {} }
                                                        src={src}
                                                    />
                                                </ResizeConsumer>
                                            </ResizeProvider>

                                            {
                                                idx == selectedAnnot ?
                                                    <>
                                                        <img
                                                            className="anotRotateBtn"
                                                            src={rotateImg}
                                                            onDrag={(e) => myDebounce(handleAnotRotateStart, 80)(e, idx)}
                                                            onDragEnd={(e) => handleAnotRotateEnd(e, idx)}
                                                        />
                                                        <img
                                                            className="anotDeleteBtn"
                                                            src={deleteImg}
                                                            onClick={(e) => handleAnotDeleteClick(e, idx)}
                                                        />
                                                    </>
                                                    : null
                                            }
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                    : "loading"
            }
        </div>
    );
}

export default App;