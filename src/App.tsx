import React from 'react';
import './App.css';

class ProcessImage extends React.Component{
  newImage: any;
  canvas: any;
  context: any;
  blank: any = document.createElement("canvas") as HTMLCanvasElement;

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
      let adjust: number = (1 + factor);
      for(let x: number = 0; x < data.length; x += 4){
        data[x] = data[x] * adjust;
        data[x + 1] = data[x + 1] * adjust;
        data[x + 2] = data[x + 2] * adjust;
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
    let selectBox = document.getElementById("toolkit") as HTMLSelectElement;
    let selectedValue:string = selectBox.options[selectBox.selectedIndex].value;
    
    this.canvas = document.getElementById('picture') as HTMLCanvasElement;
    this.blank.width = this.canvas.width;
    this.blank.height = this.canvas.height;
    if(this.blank.toDataURL() === this.canvas.toDataURL()){
      // check that image exists on canvas
      alert("No image to process!");
      selectBox.selectedIndex = 0;
      return;
    } 
    else {
      // initialize context
      this.context = this.canvas.getContext('2d');
    }

    if(selectedValue === "invert"){
      this.invert();
    } else if(selectedValue === "grayscale"){
      this.grayscale();
    } else if(selectedValue === "brightness"){
      let factor: number = Number(window.prompt("Adjustment between -1.00 and 1.00", "0"));
      if(factor < -1 || factor > 1){
        window.alert("Input must be between -1.00 and 1.00!");
      } else{
        this.brightness(factor);
      }
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
            let width: number = img.width > 1000 ? 1000 : img.width;
            let height: number = img.height > 1000 ? 1000 : img.height;
            this.canvas.width = width;
            this.canvas.height = height;
            this.context.drawImage(img, 0, 0, width, height);
            this.originalImage = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
          }
        }
      }
    }
    else{
      alert("File does not exist");
    }
  }

  open(): boolean {
    const fileElem = document.getElementById("fileElem") as HTMLInputElement;
    if(this.originalImage){
      if(window.confirm("Download work first?")){
        this.download();
      }
      else{
        return true;
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
    if(this.canvas && this.originalImage){
      let downloader = document.createElement('a');
      downloader.setAttribute('href', this.canvas.toDataURL());
      downloader.setAttribute("download", "Edited");
      downloader.click();
      return true;
    }
    else{
      alert("nothing to save!");
    }
    return false;
  }

  close(): void {
    if(this.originalImage){
      if(window.confirm("Save work first?")){
        this.download();
      } 
    }

    if(this.context){
      const fileElem = document.getElementById("fileElem") as HTMLInputElement;
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.canvas.width = 600;
      this.canvas.height = 600;
      this.originalImage = null;
      fileElem.value = "";
    }

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
    } else if(selectedValue === "close"){
      this.close();
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
        <input type="file" id="fileElem" accept="image/jpeg" onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.getFile(event)} />
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
