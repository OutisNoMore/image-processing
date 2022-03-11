import React from 'react';
import './App.css';
import ImageProcessor from './ImageProcessor';

// put all necessary body elements onto page
class Select extends React.Component{
  imageProcessor: any;

  fileProcess(): void {
    if(!this.imageProcessor){
      this.imageProcessor = new ImageProcessor(document.getElementById("picture") as HTMLCanvasElement);
    }
    let selectBox = document.getElementById("file") as HTMLSelectElement;
    let selectedValue:string = selectBox.options[selectBox.selectedIndex].value;

    if(selectedValue === "open"){
      this.imageProcessor.open();
    } else if(selectedValue === "undo"){
      this.imageProcessor.undo();
    } else if(selectedValue === "redo"){
      this.imageProcessor.redo();
    } else if(selectedValue === "reset"){
      this.imageProcessor.reset();
    } else if(selectedValue === "download"){
      this.imageProcessor.download();
    } else if(selectedValue === "close"){
      this.imageProcessor.close();
    } else{
      alert("bad choice!");
    }

    selectBox.selectedIndex = 0;
  }

  imageProcess(): void{
    let selectBox = document.getElementById("toolkit") as HTMLSelectElement;
    let selectedValue: string = selectBox.options[selectBox.selectedIndex].value;
    selectBox.selectedIndex = 0;

    if(selectedValue === "invert"){
      this.imageProcessor.invert();
    } else if(selectedValue === "grayscale"){
      this.imageProcessor.grayscale();
    } else if(selectedValue === "brightness"){
      this.imageProcessor.brightness();
    } else if(selectedValue === "edges"){
      this.imageProcessor.edges();
    } else if(selectedValue === "blur"){
      this.imageProcessor.blur();
    } else if(selectedValue === "sobel"){
      this.imageProcessor.sobel();
    } else if(selectedValue === "prewitt"){
      this.imageProcessor.prewitt();
    } else if(selectedValue === "laplacian"){
      this.imageProcessor.laplacian();
    } else if(selectedValue === "canny"){
      let lower = document.getElementById("low") as HTMLInputElement;
      let upper = document.getElementById("high") as HTMLInputElement;
      let l: number = +lower.value;
      let u: number = +upper.value;
      this.imageProcessor.canny(l/100, u/100);
    } else if(selectedValue === "pad"){
      this.imageProcessor.pad();
    }
    else{
      alert("bad choice");
    }
  }

  render() {
    return (
      <div className="body">
        <table>
          <thead>
            <tr>
              <th>File</th>
              <th>Image Processing Toolkit</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <select id="file" onChange={() => this.fileProcess()}>
                  <option value="">--File--</option>
                  <option value="open">Open</option>
                  <option value="undo">Undo</option>
                  <option value="redo">Redo</option>
                  <option value="reset">Reset</option>
                  <option value="download">Download</option>
                  <option value="close">Close</option>
                </select>
              </td>
              <td>
                <select id="toolkit" onChange={() => this.imageProcess()}>
                  <option value="">--Image Processing Toolkit--</option>
                  <option value="invert">Invert Image</option>
                  <option value="grayscale">Grayscale</option>
                  <option value="brightness">Adjust Brightness</option>
                  <option value="edges">Find Edges</option>
                  <option value="sobel">Sobel Edge Detection</option>
                  <option value="prewitt">Prewitt Edge Detection</option>
                  <option value="laplacian">Laplacian Edge Detection</option>
                  <option value="canny">Canny Edge Detection</option>
                  <option value="blur">Gaussian Blur</option>
                  <option value="pad">Pad Image</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

// put all necessary header elements onto webpage
class Header extends React.Component{
  render() {
    return (
      <header className="head">
        <h1>Image Processing Toolkit!</h1>
      </header>
    );
  }
}

function Threshold(){
  return (
    <div className="Threshold">
      <table>
        <thead>
          <tr>
            <th>Lower</th>
            <th>Higher</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><input type="range" min="1" max="100" id="low"/></td>
            <td><input type="range" min="1" max="100" id="high"/></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function App() {
  return (
    <div className="App-page">
      <div className="App-head">
        <Header />
      </div>
      <div className="App-body">
        <p>
          Welcome to the Image Processing Toolkit!
          <br/>
          Use this website to process an image however you like. To get started: select open to open an image. Then use the image processing toolkit to process the image. Download the processed image to save your work, and if you want to start over with the original image, select revert!
        </p>
        <div className="ImageProcessor">
          <Select />
          <Threshold />
          <canvas id="picture" width="600" height="600" />
        </div>
      </div>
    </div>
  );
}

export default App;
