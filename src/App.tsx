import React from 'react';
import './App.css';

class ProcessImage extends React.Component{
  newImage: any;
  canvas: any;
  context: any;

  invert(): boolean{
    if(this.canvas && this.context){
      const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const data = imageData.data;
      for(let x: number = 0; x < data.length; x += 4){
        data[x] = 255 - data[x];
        data[x + 1] = 255 - data[x + 1];
        data[x + 2] = 255 - data[x + 2];
      }
      this.context.putImageData(imageData, 0, 0);
      return true;
    }
    else{
      alert("No image!");
    }

    return false;
  }

  grayscale(): boolean{
    if(this.canvas && this.context){
      const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const data = imageData.data;
      for(let x: number = 0; x < data.length; x += 4){
        let avg: number = (data[x] + data[x + 1] + data[x + 2])/3
        data[x] = avg;
        data[x + 1] = avg;
        data[x + 2] = avg;
      }
      this.context.putImageData(imageData, 0, 0);
      return true;
    }
    else{
      alert("No Image!");
    }

    return false;
  }

  brightness(factor: number): boolean{
    if(this.canvas && this.context){
      const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const data = imageData.data;
      if(factor > 0)
      for(let x: number = 0; x < data.length; x += 4){
        data[x] = data[x] * factor;
        data[x + 1] = data[x + 1] * factor;
        data[x + 2] = data[x + 2] * factor;
      }
      this.context.putImageData(imageData, 0, 0);
      return true;
    }
    else{
      alert("No Image!");
    }

    return false;
  }

  imageProcess(): void{
    this.canvas = document.getElementById('picture') as HTMLCanvasElement;
    if(this.canvas.getContext){
      this.context = this.canvas.getContext('2d');
    } 
    else {
      alert("No image to process!");
    }

    let selectBox = document.getElementById("toolkit") as HTMLSelectElement;
    let selectedValue:string = selectBox.options[selectBox.selectedIndex].value;

    if(selectedValue === "invert"){
      this.invert();
    } else if(selectedValue === "grayscale"){
      this.grayscale();
    } else if(selectedValue === "brightness"){
      this.brightness(0.5);
    } else{
      alert("bad choice");
    }

    selectBox.selectedIndex = 0;
  }

  render(){
    return(
      <select id="toolkit" onChange={() => this.imageProcess()}>
        <option value="">--Image Processing Toolkit--</option>
        <option value="invert">Invert Image</option>
        <option value="grayscale">Grayscale</option>
        <option value="brightness">Adjust Brightness</option>
        <option value="edges">Find Edges</option>
        <option value="inpaint">Reconstruct Image</option>
      </select>
    );
  }
}

class ProcessFile extends React.Component{
  filePath: string = "";
  canvas: any;
  context: any;
  originalImage: any;

  getFile(event: any): void {
    if(event.currentTarget.files && event.currentTarget.files[0]){
      let reader = new FileReader();
      reader.readAsDataURL(event.currentTarget.files[0]);

      let img: HTMLImageElement = new Image() as HTMLImageElement;
      reader.onload = (event: any) => {
        if(event.currentTarget){
          img.src = event.currentTarget.result;
          img.onload = () => {
            this.canvas.width = img.width;
            this.canvas.height = img.height;
            this.context.drawImage(img, 0, 0);
            this.originalImage = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
          }
        }
      }
    }
  }

  open(): boolean {
    const fileElem = document.getElementById("fileElem") as HTMLInputElement;
    if(this.originalImage){
      if(window.confirm("Save work first?")){
        this.download();
      }
    }

    if(fileElem){
      fileElem.click();
    }

    return false;
  }

  revert(): void{
    if(this.canvas && this.context && this.originalImage){
      this.context.putImageData(this.originalImage, 0, 0);
    }
    else{
      alert("No image!");
    }
  }

  download(): boolean {
    if(this.canvas){
      let a = document.createElement('a');
      a.setAttribute('href', this.canvas.toDataURL());
      a.setAttribute("download", "newFile");
      a.click();
      return true;
    }
    else{
      alert("nothing to save!");
    }
    return false;
  }

  fileProcess(): void {
    this.canvas = document.getElementById('picture') as HTMLCanvasElement;
    if(this.canvas.getContext){
      this.context = this.canvas.getContext('2d');
    }

    let selectBox = document.getElementById("file") as HTMLSelectElement;
    let selectedValue:string = selectBox.options[selectBox.selectedIndex].value;
    console.log(selectedValue);
    if(selectedValue === "open"){
      this.open();
    } else if(selectedValue === "revert"){
      this.revert();
    } else if(selectedValue === "download"){
      this.download();
    } else{
      alert("bad choice!");
    }

    selectBox.selectedIndex = 0;
  }
  

  render(){
    return(
      <div className="files">
        <select id="file" onChange={() => this.fileProcess()}>
          <option value="">--File--</option>
          <option value="open">Open</option>
          <option value="revert">Revert</option>
          <option value="download">Download</option>
          <option value="close">Close</option>
        </select>
        <input type="file" id="fileElem" accept="image/jpeg" onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.getFile(event)}/>
      </div>
    );
  }
}

// put all necessary body elements onto page
class Select extends React.Component{
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
                <ProcessFile />
              </td>
              <td>
                <ProcessImage />
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
          Select open to open an image. Then use the image processing toolkit to process the image. Download the processed image, if you want to start
          over with the original image, select revert!
        </p>
        <Select />
        <canvas id="picture" width="600" height="600" />
      </div>
    </div>
  );
}

export default App;
