import ImageList from './ImageList';
import ImageToolKit from './ImageToolKit';
// Image Processor
class ImageProcessor{
  canvas: any;
  context: any;
  images: any;
  // Constructor
  constructor(cnv: HTMLCanvasElement){
    this.canvas = cnv;
    if(cnv){
      this.context = cnv.getContext("2d");
    }
    this.images = new ImageList();
  }

  // check if canvas is empty by checking if non zero pixels exist
  emptyCanvas(): boolean{
    if(this.context){
      const pixelBuffer = new Uint32Array(this.context.getImageData(0, 0, this.canvas.width, this.canvas.height).data.buffer);
      if(pixelBuffer.some(color => color !== 0)){
        return false;
      }
    }
    return true;
  }

  // Download current image
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

  // Undo to previous image
  undo(): void{
    if(this.images.empty()){
      alert("Please open an image first!");
      return;
    }
    if(this.images.hasPrevious()){
      this.updateCanvas(this.images.previous().getImage());
    }
  }

  // Redo to next image
  redo(): void{
    if(this.images.empty()){
      alert("Please open an image first!");
      return;
    }
    if(this.images.hasNext()){
      this.updateCanvas(this.images.next().getImage());
    }
  }

  // Reset to original image
  reset(): void{
    if(this.images.empty()){
      alert("Please open an image first!");
    }
    /*
    if(this.images.current().getName() !== "Unedited"){
      if(window.confirm("Save " + this.images.current().getName() + " first?")){
        this.download();
      }
    }
    */
    this.updateCanvas(this.images.reset().getImage());
  }

  // Close and clear current case
  close(): void{
    if(this.images.empty()){
      alert("Please open an image first!");
      return;
    }
    /*
    if(this.images.current().getName() !== "Unedited"){
      if(window.confirm("Save " + this.images.current().getName() + " first?")){
        this.download();
      }
    }
    */
    this.images.clear();
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.width = 600;
    this.canvas.height = 600;
  }

  // Get file from client disk
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

  // open file from client disk
  open(useDefault: boolean = false): void{
    /*
    if(!this.images.empty() && this.images.current().getName() !== "Unedited"){
      if(window.confirm("Save " + this.images.current().getName() + " first?")){
        this.download();
      }
    }
    */
    // clear current image
    this.images.clear();
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.width = 600;
    this.canvas.height = 600;
    // use default image
    if(useDefault){
      let img = new Image();
      img.src = require("./util/boat.jpg");
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
    else{
      // open image from file
      let opener = document.createElement("input");
      opener.setAttribute("type", "file");
      opener.setAttribute("accept", "image/jpeg, image/png");
      opener.onchange = (event) => this.getFile(event);
      opener.click();
    }
  }

  updateCanvas(image: ImageData): void{
    this.canvas.width = image.width;
    this.canvas.height = image.height;
    this.context.putImageData(image, 0, 0);
  }

  // Create Inverted image
  invert(): void{
    if(this.images.empty()){
      alert("Please open an image first!");
      return;
    }
    //this.images.add(ImageToolKit.invert(this.images.current().getImage()), "Inverted");
    this.images.add(ImageToolKit.invert(this.images.first().getImage()), "Inverted");

    this.updateCanvas(this.images.current().getImage());
  }

  // Create Grayscale image
  grayscale(): void{
    if(this.images.empty()){
      alert("Please open an image first!");
      return;
    }
    //this.images.add(ImageToolKit.grayscale(this.images.current().getImage()), "Grayscale");
    this.images.add(ImageToolKit.grayscale(this.images.current().getImage()), "Grayscale");

    this.updateCanvas(this.images.current().getImage());
  }

  // Change brightness of image
  brightness(): void{
    if(this.images.empty()){
      alert("Please open an image first!");
      return;
    }
    let factor: number = Number(window.prompt("Adjustment between -1.00 and 1.00", "0"));
    if(factor < -1 || factor > 1){
      window.alert("Input must be between -1.00 and 1.00!");
    } else{
      //this.images.add(ImageToolKit.brightness(this.images.current().getImage(), factor), "Brightened");
      this.images.add(ImageToolKit.brightness(this.images.current().getImage(), factor), "Brightened");
      this.updateCanvas(this.images.current().getImage());
    }
  }

  // blur image
  blur(): void{
    if(this.images.empty()){
      alert("Please open an image first!");
      return;
    }
    let sigma: number = Number(window.prompt("Please enter a sigma", "1"));
    sigma = sigma === 0 ? 1 : sigma;
    //this.images.add(ImageToolKit.blur(this.images.current().getImage(), 5, sigma), "Blur");
    this.images.add(ImageToolKit.blur(this.images.first().getImage(), 5, sigma), "Blur");

    this.updateCanvas(this.images.current().getImage());
  }

  // Apply Sobel edge finding on image
  sobel(): void{
    if(this.images.empty()){
      alert("Please open an image first!");
      return;
    }
//    this.images.add(ImageToolKit.sobel(this.images.current().getImage()), "Sobel");
    this.images.add(ImageToolKit.sobel(this.images.first().getImage()), "Sobel");

    this.updateCanvas(this.images.current().getImage());
  }

  // Apply canny edge detection on image
  canny(lower: number, upper: number): void{
    if(this.images.empty()){
      alert("Please open an image first!");
      return;
    }
    //this.images.add(ImageToolKit.canny(this.images.current().getImage(), lower, upper), "Canny");
    this.images.add(ImageToolKit.canny(this.images.first().getImage(), lower, upper), "Canny");
    this.updateCanvas(this.images.current().getImage());
  }

  // Pad image with given pixels
  pad(): void{
    if(this.images.empty()){
      alert("Please open an image first!");
      return;
    }
    let thickness: number = Number(window.prompt("Please enter pixels to pad by", "5"));
    //this.images.add(ImageToolKit.pad(this.images.current().getImage(), thickness), "Padded");
     this.images.add(ImageToolKit.pad(this.images.first().getImage(), thickness), "Padded");
   
    this.updateCanvas(this.images.current().getImage());
  }

  laplacian(): void{
    if(this.images.empty()){
      alert("Please open an image first!");
      return;
    }
    //this.images.add(ImageToolKit.laplacian(this.images.current().getImage()), "Laplacian");
     this.images.add(ImageToolKit.laplacian(this.images.first().getImage()), "Laplacian");
    this.updateCanvas(this.images.current().getImage());
  }

  prewitt(): void{
    if(this.images.empty()){
      alert("Please open an image first!");
      return;
    }
    //this.images.add(ImageToolKit.prewitt(this.images.current().getImage()), "Prewitt");
    this.images.add(ImageToolKit.prewitt(this.images.first().getImage()), "Prewitt");

    this.updateCanvas(this.images.current().getImage());
  }
}

export default ImageProcessor;
