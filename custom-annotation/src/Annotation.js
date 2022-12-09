import React, { useEffect, useState, useRef } from "react";
import { ResizeProvider, ResizeConsumer } from "react-resize-context"; //ref: https://codesandbox.io/embed/jjjmp4z6yy

import deleteImg from "./delete.png";
import rotateImg from "./rotate.png";
import './index.css';

function myDebounce(functionToRun, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => { functionToRun.call(this, ...args) }, delay)
    }
}

const MIN_HEIGHT = 100;
const PENCIL = "pencil";

function Annotation({
    image = "",
    width = window.innerWidth,
    loader = "loading",
    error = "something went wrong",
    shapes = {},
    annotationData = [],
    onChange,
}) {
    const [height, setHeight] = useState(10); //height 10 is loading, 400 is error

    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [isDrawingInCanvas, setIsDrawingInCanvas] = useState(false);

    const [selectedToolBarBtn, setSelectedToolBarBtn] = useState("");
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const [annot, setAnnot] = useState([]);
    const [selectedAnnot, setSelectedAnnot] = useState("");

    useEffect(() => {
        const imgEle = document.createElement("img");
        imgEle.src = image;
        imgEle.onload = function () {
            const calcHeight = width / imgEle.width * imgEle.height;
            setHeight(calcHeight);

            setAnnot(annotationData || []);
            renderCanvas(calcHeight, annotationData);
        }
        imgEle.onerror = function () {
            setHeight(-400);
        }
    }, []);

    useEffect(() => {
        if (height > 10 && onChange) onChange(annot);
    }, [annot]);


    /* ---- canvas stuffs ---- */
    function renderCanvas(height, annot) {
        //ref: https://blog.openreplay.com/2d-sketches-with-react-and-the-canvas-api
        const canvas = canvasRef.current;
        canvas.width = width;
        canvas.height = height;

        // Setting the context to enable draw
        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 8;
        ctxRef.current = ctx;

        // loading older image/canvas data in canvas
        renderImagesInCanvas(annot);
    }

    function renderImagesInCanvas(annot) {
        if (!ctxRef.current || !canvasRef.current) return;

        ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); //clearing old image/canvas data

        for (let i = 0; i < annot.length; i++) {
            let { type, src } = annot[i] || {};

            if (type == PENCIL) {
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

        setIsDrawingInCanvas(true);
    }

    function stopDraw() {
        ctxRef.current.closePath();
        setIsDrawingInCanvas(false);

        // converting the drawing into image and storing in annot state
        const canvas = canvasRef.current;
        const imgData = canvas.toDataURL("image/png");
        // const imgData = ctx.getImageData(0, 0, imgDim.width, imgDim.height);

        setAnnot([...annot, { src: imgData, type: PENCIL }]);
    }

    function draw({ nativeEvent }) {
        if (!isDrawingInCanvas) return;
        const { offsetX, offsetY } = nativeEvent;
        ctxRef.current.lineTo(offsetX, offsetY);
        ctxRef.current.stroke();
    }
    /* ---- canvas stuffs ---- */


    /* ---- annotations stuffs ---- */
    function handleBtnClick(type) {
        setSelectedToolBarBtn(type);
    }

    function handleAreaMouseMove({ nativeEvent = {} } = {}) {
        setMousePos({ x: nativeEvent.offsetX, y: nativeEvent.offsetY });
    }

    function handleAreaClick() {
        if (selectedToolBarBtn === PENCIL) return;

        if (selectedToolBarBtn) setAnnot([...annot, { type: selectedToolBarBtn, pos: { x: mousePos.x, y: mousePos.y } }]);
    }

    function handleAnnotClick(e, idx) {
        e.stopPropagation();

        setSelectedAnnot(idx);
    }

    function handleAnnotDeleteClick(e, idx) {
        setSelectedAnnot("");
        setAnnot(annot.filter((item, i) => i != idx));
    }

    function handleAnnotResize(size, idx) {
        setAnnot(annot.map((item, i) => {
            if (i == idx) item.size = size;
            return item;
        }));
    }

    function handleAnnotMoveStart(e, idx) {
        const { offsetLeft: canvasOffsetLeft, offsetTop: canvasOffsetTop } = document.getElementById("area") || {};

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

    function handleAnnotMoveEnd(e, idx) {
        setTimeout(() => e.target.classList.remove("invisibleAnnot"), 0);
    }

    function handleAnnotRotateStart(e, idx) {
        const { offsetLeft: canvasOffsetLeft, offsetTop: canvasOffsetTop } = document.getElementById("area") || {};

        const { x = 0, y = 0 } = annot[idx].pos || {};
        const { width = 0, height = 0 } = annot[idx].size || {};

        const centerX = x + width / 2, centerY = y + height / 2;
        const newX = e.pageX - canvasOffsetLeft, newY = e.pageY - canvasOffsetTop;

        if (e.pageX && e.pageY) {
            const angle = Math.atan2(newY - centerY, newX - centerX) * (180 / Math.PI);

            setAnnot(annot.map((item, i) => {
                if (i == idx) item.rotate = angle;
                return item;
            }));
        }

        setTimeout(() => e.target.classList.add("invisibleAnnot"), 0);
    }

    function handleAnnotRotateEnd(e, idx) {
        setTimeout(() => e.target.classList.remove("invisibleAnnot"), 0);
    }
    /* ---- annotations stuffs ---- */


    function handleUndoClick(undoAll) {
        let updatedAnnot = annot.slice(0, -1)
        if (undoAll === true) updatedAnnot = [];

        setAnnot(updatedAnnot);

        renderImagesInCanvas(updatedAnnot); //if any canvas image is undoed then it will be removed
    }

    return (
        <div id="annotationComp" >
            <div id="toolBar" className={height <= 10 ? "disabledToolBar" : ""}>
                {
                    Object.keys(shapes).map(type => (
                        <div className={selectedToolBarBtn === type ? "toolBarBtn selectedToolBarBtn" : "toolBarBtn"} key={type} onClick={() => handleBtnClick(type)}><img src={shapes[type]} /></div>
                    ))
                }

                <div className={selectedToolBarBtn === PENCIL ? "toolBarBtn selectedToolBarBtn" : "toolBarBtn"} onClick={() => handleBtnClick(PENCIL)}>{PENCIL}</div>
                <div className="toolBarBtn" onClick={handleUndoClick}>undo</div>
                <div className="toolBarBtn" onClick={() => handleUndoClick(true)}>clear</div>
            </div>

            <div
                id="area"
                style={{ minWidth: width, maxWidth: width, height, minHeight: MIN_HEIGHT }}
                onMouseMove={handleAreaMouseMove}
                onClick={handleAreaClick}
                onDragOver={(e) => { e.preventDefault() /* to prevent drag shadow going to old position */ }}
            >
                <canvas
                    id="canvasEle"
                    ref={canvasRef}
                    onMouseDown={(e) => { if (selectedToolBarBtn === PENCIL) startDraw(e) }}
                    onMouseUp={(e) => { if (selectedToolBarBtn === PENCIL) stopDraw(e) }}
                    onMouseMove={(e) => { if (selectedToolBarBtn === PENCIL) draw(e) }}
                />

                {
                    height <= 10 ? <div id="loaderOrError">{height === -400 ? error : loader}</div> :
                        <>
                            <img id="areaImg" src={image} />

                            {
                                annot.map(({ pos, size, rotate = 0, type }, idx) => {
                                    if (type !== PENCIL)
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
                                                            onDrag={(e) => myDebounce(handleAnnotMoveStart, 100)(e, idx)}
                                                            onDragEnd={(e) => myDebounce(handleAnnotMoveEnd, 100)(e, idx)}
                                                        >
                                                            <img src={shapes[type]} style={rotate ? { transform: `rotate(${rotate}deg)` } : {}} />
                                                        </ResizeConsumer>
                                                    </ResizeProvider>

                                                    {
                                                        idx == selectedAnnot ?
                                                            <>
                                                                <img
                                                                    className="annotRotateBtn"
                                                                    src={rotateImg}
                                                                    onDrag={(e) => myDebounce(handleAnnotRotateStart, 100)(e, idx)}
                                                                    onDragEnd={(e) => myDebounce(handleAnnotRotateEnd, 100)(e, idx)}
                                                                />
                                                                <img
                                                                    className="annotDeleteBtn"
                                                                    src={deleteImg}
                                                                    onClick={(e) => handleAnnotDeleteClick(e, idx)}
                                                                />
                                                            </>
                                                            : null
                                                    }
                                                </div>
                                            </div>
                                        )
                                })
                            }
                        </>
                }
            </div>
        </div>
    );
}

export default Annotation;