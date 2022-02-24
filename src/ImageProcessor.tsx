import ImageList from './ImageList';
import ImageToolKit from './ImageToolKit';
// Image Processor
class ImageProcessor{
  canvas: any;
  context: any;
  images: any;

  constructor(cnv: HTMLCanvasElement){
    this.canvas = cnv;
    if(cnv){
      this.context = cnv.getContext("2d");
    }
    this.images = new ImageList();
  }

  emptyCanvas(): boolean{
    // check if canvas is empty by checking if non zero pixels exist
    if(this.context){
      const pixelBuffer = new Uint32Array(this.context.getImageData(0, 0, this.canvas.width, this.canvas.height).data.buffer);
      if(pixelBuffer.some(color => color !== 0)){
        return false;
      }
    }
    return true;
  }

  download(): void{
    if(this.images.empty()){
      alert("Please open an image first!");
      return;
    }
    let downloader = document.createElement('a');
    downloader.setAttribute('href', this.canvas.toDataURL());
    downloader.setAttribute("download", this.images.current().getName());
    downloader.click();
  }

  undo(): void{
    if(this.images.empty()){
      alert("Please open an image first!");
      return;
    }
    if(this.images.hasPrevious()){
      this.context.putImageData(this.images.previous().getImage(), 0, 0);
    }
  }

  redo(): void{
    if(this.images.empty()){
      alert("Please open an image first!");
      return;
    }
    if(this.images.hasNext()){
      this.context.putImageData(this.images.next().getImage(), 0, 0);
    }
  }

  reset(): void{
    if(this.images.empty()){
      alert("Please open an image first!");
    }
    if(this.images.current().getName() !== "Unedited"){
      if(window.confirm("Save " + this.images.current().getName() + " first?")){
        this.download();
      }
    }
    this.context.putImageData(this.images.reset().getImage(), 0, 0);
  }

  close(): void{
    if(this.images.empty()){
      alert("Please open an image first!");
      return;
    }
    if(this.images.current().getName() !== "Unedited"){
      if(window.confirm("Save " + this.images.current().getName() + " first?")){
        this.download();
      }
    }
    this.images.clear();
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.width = 600;
    this.canvas.height = 600;
  }

  getFile(event: any): boolean{
    if(event.currentTarget.files && event.currentTarget.files[0]){
      let reader = new FileReader();
      reader.readAsDataURL(event.currentTarget.files[0]);

      let img: HTMLImageElement = new Image() as HTMLImageElement;
      reader.onload = (event: any) => {
        if(event.currentTarget){
          img.src = event.currentTarget.result;
          img.onload = () => {
            let ratio: number = img.width / img.height;
            let w = img.width;
            let h = img.height;
            if(img.width > 1000){
              w = 1000;
              h = 1000 / ratio;
            }
            this.canvas.width = w;
            this.canvas.height = h;
            this.context.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
            this.images.add(this.context.getImageData(0, 0, this.canvas.width, this.canvas.height), "Unedited");
          }
        }
      }
      return true;
    }
    return false;
  }

  open(): void{
    if(!this.images.empty() && this.images.current().getName() !== "Unedited"){
      if(window.confirm("Save " + this.images.current().getName() + " first?")){
        this.download();
      }
    }
    this.images.clear();
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.width = 600;
    this.canvas.height = 600;
    let opener = document.createElement("input");
    opener.setAttribute("type", "file");
    opener.setAttribute("accept", "image/jpeg, image/png");
    opener.onchange = (event) => this.getFile(event);
    opener.click();
  }

  invert(): void{
    if(this.images.empty()){
      alert("Please open an image first!");
      return;
    }
    this.images.add(ImageToolKit.invert(this.images.current().getImage()), "Inverted");
    this.context.putImageData(this.images.current().getImage(), 0, 0);
  }

  grayscale(): void{
    if(this.images.empty()){
      alert("Please open an image first!");
      return;
    }
    this.images.add(ImageToolKit.grayscale(this.images.current().getImage()), "Grayscale");
    this.context.putImageData(this.images.current().getImage(), 0, 0);
  }

  brightness(): void{
    if(this.images.empty()){
      alert("Please open an image first!");
      return;
    }
    let factor: number = Number(window.prompt("Adjustment between -1.00 and 1.00", "0"));
    if(factor < -1 || factor > 1){
      window.alert("Input must be between -1.00 and 1.00!");
    } else{
      this.images.add(ImageToolKit.brightness(this.images.current().getImage(), factor), "Brightened");
      this.context.putImageData(this.images.current().getImage(), 0, 0);
    }
  }

  edges(): void{
    if(this.images.empty()){
      alert("Please open an image first!");
      return;
    }
      this.images.add(ImageToolKit.edges(this.images.current().getImage()), "Edges");
      this.context.putImageData(this.images.current().getImage(), 0, 0);
  }

  blur(): void{
    if(this.images.empty()){
      alert("Please open an image first!");
      return;
    }
    let sigma: number = Number(window.prompt("Please enter a sigma", "1"));
    this.images.add(ImageToolKit.blur(this.images.current().getImage(), 5, sigma), "Blur");
    this.context.putImageData(this.images.current().getImage(), 0, 0);
  }

  sobel(): void{
    if(this.images.empty()){
      alert("Please open an image first!");
      return;
    }
    this.images.add(ImageToolKit.sobel(this.images.current().getImage()), "Sobel");
    this.context.putImageData(this.images.current().getImage(), 0, 0);
  }

  canny(): void{
    if(this.images.empty()){
      alert("Please open an image first!");
      return;
    }
    let upperThreshold: number = Number(window.prompt("Please enter a threshold value between 0 and 1.00", "0.75"));
    this.images.add(ImageToolKit.canny(this.images.current().getImage(), upperThreshold), "Canny");
    this.context.putImageData(this.images.current().getImage(), 0, 0);
  }

  pad(): void{
    if(this.images.empty()){
      alert("Please open an image first!");
      return;
    }
    this.images.add(ImageToolKit.pad(this.images.current().getImage(), 5), "Padded");
    this.context.putImageData(this.images.current().getImage(), 0, 0);
  }
}

export default ImageProcessor;
