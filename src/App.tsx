import React from 'react';
import './App.css';

class ProcessImage extends React.Component{
  newImage: any;
  canvas: any;
  context: any;

  invert(): boolean{

    return false;
  }

  grayscale(): boolean{

    return false;
  }

  brightness(factor: number): boolean{

    return false;
  }

  imageProcess(): void{
    this.canvas = document.getElementById('picture') as HTMLCanvasElement;
    if(this.canvas.getContext){
      this.context = this.canvas.getContext('2d');
      this.context.fillStyle = 'green';
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    } else {
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

          }
        }
      }
    }
  }

  open(): boolean {
    const fileElem = document.getElementById("fileElem") as HTMLInputElement;
    if(fileElem){
      fileElem.click();
    }

    return false;
  }

  download(): boolean {
    return false;
  }

  close(): boolean {

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
    } else if(selectedValue === "download"){
      this.download();
    }

    selectBox.selectedIndex = 0;
  }
  

  render(){
    return(
      <div className="files">
        <select id="file" onChange={() => this.fileProcess()}>
          <option value="">--File--</option>
          <option value="open">Open</option>
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
        <Select />
        <canvas id="picture" width="600" height="600"></canvas>
      </div>
    </div>
  );
}

export default App;
