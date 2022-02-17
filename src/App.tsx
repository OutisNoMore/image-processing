import React from 'react';
import './App.css';
import ImageProcessor from './ImageProcessor';
import FileProcessor from './FileProcessor';

// put all necessary body elements onto page
class Select extends React.Component{
  fileProcessor: any;
  imageProcessor: any;
  canvas: any;
  context: any;

  fileProcess(): void {
    this.canvas = document.getElementById('picture') as HTMLCanvasElement;
    this.fileProcessor = new FileProcessor(this.canvas);
    let selectBox = document.getElementById("file") as HTMLSelectElement;
    let selectedValue:string = selectBox.options[selectBox.selectedIndex].value;
    const file = document.getElementById("fileElem") as HTMLInputElement;

    if(selectedValue !== "download" && this.imageProcessor && this.imageProcessor.getName() !== "unedited"){
      if(window.confirm("Save image first?")){
        this.fileProcessor.download(this.imageProcessor.getName());
      }
    }

    if(selectedValue === "download" && this.empty(this.canvas)){
      alert("Nothing to download!");
    } else if(selectedValue === "revert" && this.empty(this.canvas)){
      alert("Nothing to revert to!");
    } else if(selectedValue === "close" && this.empty(this.canvas)){
      alert("Nothing to close");
    } else if(selectedValue === "open"){
      this.fileProcessor.open(file);
    } else if(selectedValue === "revert"){
      this.fileProcessor.revert(this.imageProcessor.getOriginalImage(), this.context);
      this.imageProcessor.setName("unedited");
    } else if(selectedValue === "download"){
      this.fileProcessor.download(this.imageProcessor.getName());
    } else if(selectedValue === "close"){
      this.fileProcessor.close();
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
    let selectBox = document.getElementById("toolkit") as HTMLSelectElement;
    let selectedValue:string = selectBox.options[selectBox.selectedIndex].value;
    selectBox.selectedIndex = 0;
    
    this.canvas = document.getElementById('picture') as HTMLCanvasElement;
    if(this.empty(this.canvas)){
      // check that image exists on canvas
      alert("No image to process!");
      return;
    } 
    else {
      // initialize context
      this.context = this.canvas.getContext('2d');
      let data: ImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
      this.imageProcessor = new ImageProcessor(data);
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

    this.context.putImageData(this.imageProcessor.getNewImage(), 0, 0);
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
                  <option value="revert">Revert</option>
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
          From File select open to open an image. Then use the image processing toolkit to process the image. Download the processed image, if you want to start
          over with the original image, select revert!
        </p>
       <Select />
        <canvas id="picture" width="600" height="600" />
      </div>
    </div>
  );
}

export default App;
