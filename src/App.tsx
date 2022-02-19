import React from 'react';
import './App.css';
import ImageProcessor from './ImageProcessor';
import FileProcessor from './FileProcessor';

// put all necessary body elements onto page
class Select extends React.Component{
  fileProcessor: any;
  imageProcessor: any = new ImageProcessor();
  canvas: any;
  context: any;

  fileProcess(): void {
    this.canvas = document.getElementById("picture") as HTMLCanvasElement;
    if(this.canvas){
      this.context = this.canvas.getContext('2d');
    }
    this.fileProcessor = new FileProcessor(this.canvas);
    let selectBox = document.getElementById("file") as HTMLSelectElement;
    let selectedValue:string = selectBox.options[selectBox.selectedIndex].value;
    const file = document.getElementById("fileElem") as HTMLInputElement;

    if(this.empty(this.canvas) && selectedValue !== "open"){
      alert("Please open an image first");
    } else if(selectedValue === "open"){
        if(!this.empty(this.canvas) && this.imageProcessor && this.imageProcessor.currentName() !== "Unedited"){
         if(window.confirm("Save " + this.imageProcessor.currentName() + " first?")){
            this.fileProcessor.download(this.imageProcessor.currentName());
          }
        }
      this.fileProcessor.open(file);
    } else if(selectedValue === "undo"){
      if(this.imageProcessor.hasPrevious()){
        this.fileProcessor.undo(this.imageProcessor.previous());
      }
    } else if(selectedValue === "redo"){
      if(this.imageProcessor.hasNext()){
        this.fileProcessor.redo(this.imageProcessor.next());
      }
    } else if(selectedValue === "reset"){
      if(this.imageProcessor && this.imageProcessor.currentName() !== "Unedited"){
        if(window.confirm("Save " + this.imageProcessor.currentName() + " first?")){
          this.fileProcessor.download(this.imageProcessor.currentName());
        }
      }
      this.context.putImageData(this.imageProcessor.reset(), 0, 0);
    } else if(selectedValue === "download"){
      this.fileProcessor.download(this.imageProcessor.currentName());
    } else if(selectedValue === "close"){
      if(this.imageProcessor && this.imageProcessor.currentName() !== "Unedited"){
        if(window.confirm("Save " + this.imageProcessor.currentName() + " first?")){
          this.fileProcessor.download(this.imageProcessor.currentName());
        }
      }
      this.fileProcessor.close();
      this.imageProcessor.clear();
      file.value = "";
    } else{
      alert("bad choice!");
    }

    selectBox.selectedIndex = 0;
  }

  empty(cnv: HTMLCanvasElement): boolean{
    // check if canvas is empty by checking if non zero pixels exist
    const context = cnv.getContext('2d');
    if(context){
      const pixelBuffer = new Uint32Array(context.getImageData(0, 0, cnv.width, cnv.height).data.buffer);
      if(pixelBuffer.some(color => color !== 0)){
        return false;
      }
    }
    return true;
  }

  imageProcess(): void{
    this.canvas = document.getElementById("picture") as HTMLCanvasElement;
    let selectBox = document.getElementById("toolkit") as HTMLSelectElement;
    let selectedValue: string = selectBox.options[selectBox.selectedIndex].value;
    selectBox.selectedIndex = 0;

    if(this.empty(this.canvas)){
      // check that image exists on canvas
      alert("No image to process!");
      return;
    } 
    else {
      // initialize context
      this.context = this.canvas.getContext("2d");
      if(this.imageProcessor.empty()){
        this.imageProcessor.add(this.context.getImageData(0, 0, this.canvas.width, this.canvas.height), "Unedited");
      }
    }

    if(selectedValue === "invert"){
      this.imageProcessor.invert();
    } else if(selectedValue === "grayscale"){
      this.imageProcessor.grayscale();
    } else if(selectedValue === "brightness"){
      let factor: number = Number(window.prompt("Adjustment between -1.00 and 1.00", "0"));
      if(factor < -1 || factor > 1){
        window.alert("Input must be between -1.00 and 1.00!");
      } else{
        this.imageProcessor.brightness(factor);
      }
    } else if(selectedValue === "edges"){
      this.imageProcessor.edges();
    }
    else{
      alert("bad choice");
    }

    this.context.putImageData(this.imageProcessor.currentImage(), 0, 0);
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
                <input type="file" id="fileElem" accept="image/jpeg" onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.fileProcessor.getFile(event)} />
              </td>
              <td>
                <select id="toolkit" onChange={() => this.imageProcess()}>
                  <option value="">--Image Processing Toolkit--</option>
                  <option value="invert">Invert Image</option>
                  <option value="grayscale">Grayscale</option>
                  <option value="brightness">Adjust Brightness</option>
                  <option value="edges">Find Edges</option>
                  <option value="inpaint">Reconstruct Image</option>
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
       <Select />
        <canvas id="picture" width="600" height="600" />
      </div>
    </div>
  );
}

export default App;
