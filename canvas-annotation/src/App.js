import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { LABEL_TYPE, ReactCanvasAnnotation } from 'react-canvas-annotation';
import { generateEmpty, generateExample } from 'utils';
import image from './amrit.jpg';

const ZOOM_STEP = 0.1;
const onConsole = msg => id => console.info(msg, id);

const App = () => {
  // const [labels, setLabels] = useState(generateEmpty());
  // const [annotationType, setAnnotationType] = useState(LABEL_TYPE.RECTANGLE);
  // const [isImageDrag, toggleDragMode] = useReducer(p => !p, false);

  // const [zoom, setZoom] = useState(1);
  // const zoomAction = useMemo(
  //   () => ({
  //     default: () => setZoom(1),
  //     maxZoom: () => setZoom(2),
  //     zoom: (isZoomIn = true) => () => setZoom(prev => prev + (isZoomIn ? 1 : -1) * ZOOM_STEP),
  //   }),
  //   [],
  // );

  const [imageFile, setImageFile] = useState(null);
  useEffect(() => {
    const fetchImage = async () => {
      const res = await fetch(image);
      const buffer = await res.arrayBuffer();
      const file = new File([buffer], `img.jpg`, { type: `image/jpg` });
      setImageFile(file);
    };
    fetchImage();
  }, []);

  const onControlledExample = () => setLabels(generateExample());
  const onClean = () => setLabels(generateEmpty());

  return (
    <>
    {imageFile && (
        <ReactCanvasAnnotation
          zoom={zoom}
          imageFile={imageFile}
          labels={labels}
          onChange={setLabels}
          annotationType={annotationType}
          isImageDrag={isImageDrag}
          onMouseOut={onConsole(`onMouseOut`)}
          onHover={onConsole(`onHover`)}
          onClick={onConsole(`onClick`)}
        />
      )}
    </>
  );
};

export default App;