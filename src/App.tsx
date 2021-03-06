import React from 'react';
import './App.css';
import ImageProcessor from './ImageProcessor';

// put all necessary body elements onto page
class Select extends React.Component{
  imageProcessor: any;
  fileSelect: any;
  toolSelect: any;
  lower: any;
  upper: any;

  err(): void{
    // Should never be called because choices are limited
    alert("Choice does not exist");
  }

  setUp(): void{
    if(!this.imageProcessor){
      this.imageProcessor = new ImageProcessor(document.getElementById("picture") as HTMLCanvasElement);
      this.fileSelect = document.getElementById("file") as HTMLSelectElement;
      this.toolSelect = document.getElementById("toolkit") as HTMLSelectElement;
      this.lower = document.getElementById("low") as HTMLInputElement;
      this.upper = document.getElementById("high") as HTMLInputElement;
    }
  }

  fileProcess(): void {
    this.setUp();
    let selectedValue:string = this.fileSelect.options[this.fileSelect.selectedIndex].value;
    this.fileSelect.selectedIndex = 0;

    if(selectedValue === "default"){
      this.imageProcessor.open(true);
    } else if(selectedValue === "open"){
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
      this.err();
    }
  }

  imageProcess(): void{
    this.setUp();
    let selectedValue: string = this.toolSelect.options[this.toolSelect.selectedIndex].value;
    this.toolSelect.selectedIndex = 0;

    if(selectedValue === "invert"){
      this.imageProcessor.invert();
    } else if(selectedValue === "grayscale"){
      this.imageProcessor.grayscale();
    } else if(selectedValue === "brightness"){
      this.imageProcessor.brightness();
    } else if(selectedValue === "blur"){
      this.imageProcessor.blur();
    } else if(selectedValue === "sobel"){
      this.imageProcessor.sobel();
    } else if(selectedValue === "prewitt"){
      this.imageProcessor.prewitt();
    } else if(selectedValue === "laplacian"){
      this.imageProcessor.laplacian();
    } else if(selectedValue === "canny"){
      let l: number = +this.lower.value; // convert to int
      let u: number = +this.upper.value; // convert to int
      this.imageProcessor.canny(l/200, u/200);
    } else{
      this.err();
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
                  <option value="default">Default Image</option>
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
                  <option value="sobel">Sobel Edge Detection</option>
                  <option value="prewitt">Prewitt Edge Detection</option>
                  <option value="laplacian">Laplacian Edge Detection</option>
                  <option value="canny">Canny Edge Detection</option>
                  <option value="blur">Gaussian Blur</option>
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
          Use this website to process an image however you like.<br/>
          To get started: select open to open an image, or select a default image.<br/>
          Then use the image processing toolkit to process the image.<br/>
          The thresholds are used for the Canny Edge Detection<br/>
          Download the processed image to save your work, and if you want to start over with the original image, select Reset!<br/>
          For more information visit: <a href="https://outisnomore.github.io/project/research.html">Differential Equations and Edge Detection</a><br/>
          To see the source code visit: <a href="https://github.com/OutisNoMore/image-processing/blob/master/src/ImageToolKit.tsx">Image Tool Kit</a>
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
