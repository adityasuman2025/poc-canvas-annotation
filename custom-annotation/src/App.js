import React, { useEffect, useState, useRef } from "react";
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

    const [drawing, setDrawing] = useState(false);
    const drawRef = useRef(null);
    const ctxRef = useRef(null);

    useEffect(() => {
        //retriving annotations from localStorage
        const annotStorage = JSON.parse(localStorage.getItem("annot") || "[]");
        setAnnot(annotStorage);

        const imgEle = document.createElement("img");
        imgEle.src = img;
        imgEle.onload = function () {
            setImgDim({ height: imgEle.height / 2.2, width: imgEle.width / 1.5 });
            renderDraw({ height: imgEle.height / 2.2, width: imgEle.width / 1.5 }, annotStorage);
        }
    }, []);

    useEffect(() => {
        //storing annotations from localStorage
        localStorage.setItem("annot", JSON.stringify(annot));
    }, [annot]);

    function handleBtnClick(type) {
        setSelectedBtn(type);
    }

    function handleCanvasMouseMove(e) {
        setMousePos({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    }

    function handleCanvasClick() {
        if (selectedBtn === "pencil") return;

        if (selectedBtn) setAnnot([...annot, { src: selectedBtn, pos: { x: mousePos.x, y: mousePos.y } }]);
    }

    function handleAnnotClick(e, idx) {
        e.stopPropagation();

        setSelectedAnnot(idx);
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

        setTimeout(() => e.target.classList.add("invisibleAnnot"), 0);
    }

    function handleAnotMoveEnd(e, idx) {
        setTimeout(() => e.target.classList.remove("invisibleAnnot"), 0);
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

        setTimeout(() => e.target.classList.add("invisibleAnnot"), 0);
    }

    function handleAnotRotateEnd(e, idx) {
        setTimeout(() => e.target.classList.remove("invisibleAnnot"), 0);
    }

    function renderDraw({ height, width }, annot) {
        //ref: https://blog.openreplay.com/2d-sketches-with-react-and-the-canvas-api

        const canvas = drawRef.current;

        // For supporting computers with higher screen densities, we double the screen density
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        // Setting the context to enable us draw
        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 8;
        ctxRef.current = ctx;

        // loading older image/canvas data in canvas
        renderImagesInDraw(annot);
    }

    function renderImagesInDraw(annot) {
        if (!ctxRef.current || !drawRef.current) return;

        ctxRef.current.clearRect(0, 0, drawRef.current.width, drawRef.current.height); //clearing old image/canvas data

        for (let i = 0; i < annot.length; i++) {
            let { type, src } = annot[i] || {};

            if (type == "draw") {
                let imgEle = new Image();
                imgEle.src = src;
                imgEle.onload = function () {
                    ctxRef.current.drawImage(imgEle, 0, 0);
                };
            }
        }
    }

    function startDraw({ nativeEvent }) {
        const { offsetX, offsetY } = nativeEvent;
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(offsetX, offsetY);

        setDrawing(true);
    }

    function stopDraw() {
        ctxRef.current.closePath();
        setDrawing(false);

        // converting the draw into image and storing in annot state
        const canvas = drawRef.current;
        const imgData = canvas.toDataURL("image/png");
        // const imgData = ctx.getImageData(0, 0, imgDim.width, imgDim.height);

        setAnnot([...annot, { src: imgData, type: "draw" }]);
    }

    function draw({ nativeEvent }) {
        if (!drawing) return;
        const { offsetX, offsetY } = nativeEvent;
        ctxRef.current.lineTo(offsetX, offsetY);
        ctxRef.current.stroke();
    }

    function handleUndoClick() {
        const updatedAnnot = annot.slice(0, -1)
        setAnnot(updatedAnnot);

        renderImagesInDraw(updatedAnnot); //if any canvas image is undoed then it will be removed
    }

    return (
        <div onDragOver={(e) => { e.preventDefault() /* to prevent drag shadow going to old position */ }}>
            <button onClick={() => handleBtnClick(tickImg)}><img src={tickImg} /></button>
            <button onClick={() => handleBtnClick(crossImg)}><img src={crossImg} /></button>
            <button onClick={() => handleBtnClick("pencil")}>pencil</button>
            <button onClick={handleUndoClick}>undo</button>
            <br /><br />

            <div
                id="canvas"
                style={{ height: imgDim.height, width: imgDim.width, backgroundImage: `url(${img})` }}
                onMouseMove={handleCanvasMouseMove}
                onClick={handleCanvasClick}
            >
                <canvas
                    ref={drawRef}
                    onMouseDown={(e) => { if (selectedBtn === "pencil") startDraw(e) }}
                    onMouseUp={(e) => { if (selectedBtn === "pencil") stopDraw(e) }}
                    onMouseMove={(e) => { if (selectedBtn === "pencil") draw(e) }}
                />

                {
                    annot.map(({ src, pos, size, rotate = 0, type }, idx) => {
                        if (type !== "draw")
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
                                                style={size ? { width: size.width, height: size.height } : {}}
                                                onSizeChanged={(size) => handleAnnotResize(size, idx)}
                                                onDrag={(e) => myDebounce(handleAnotMoveStart, 100)(e, idx)}
                                                onDragEnd={(e) => myDebounce(handleAnotMoveEnd, 100)(e, idx)}
                                            >
                                                <img src={src} style={rotate ? { transform: `rotate(${rotate}deg)` } : {}} />
                                            </ResizeConsumer>
                                        </ResizeProvider>

                                        {
                                            idx == selectedAnnot ?
                                                <>
                                                    <img
                                                        className="anotRotateBtn"
                                                        src={rotateImg}
                                                        onDrag={(e) => myDebounce(handleAnotRotateStart, 100)(e, idx)}
                                                        onDragEnd={(e) => myDebounce(handleAnotRotateEnd, 100)(e, idx)}
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
        </div>
    );
}

export default App;