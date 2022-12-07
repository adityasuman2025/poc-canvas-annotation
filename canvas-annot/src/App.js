import React, { useEffect, useState } from 'react';
import { ReactCanvasAnnotation } from 'react-canvas-annotation';

import image from './amrit.jpg';

function App() {
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

  return (
    <div className="App">
      {/* <img src={image} /> */}

      {imageFile && (
        <ReactCanvasAnnotation
          imageFile={imageFile}
          
          // zoom={zoom}
          // labels={labels}
          // onChange={setLabels}
          // annotationType={annotationType}
          // isImageDrag={isImageDrag}
          // onMouseOut={onConsole(`onMouseOut`)}
          // onHover={onConsole(`onHover`)}
          // onClick={onConsole(`onClick`)}
        />
      )}
    </div>
  );
}

export default App;
