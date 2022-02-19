class FileProcessor{
  canvas: any;
  context: any;

  constructor(cnv: HTMLCanvasElement){
    this.canvas = cnv;
    this.context = cnv.getContext("2d");
  }

  download(name: string): void{
    let downloader = document.createElement('a');
    downloader.setAttribute('href', this.canvas.toDataURL());
    downloader.setAttribute("download", name);
    downloader.click();
  }

  undo(change: ImageData): void{
    if(this.canvas && this.context && change){
      this.context.putImageData(change, 0, 0);
    }else{
      alert("bad!");
    }
  }

  redo(change: ImageData): void{
    if(this.canvas && this.context && change){
      this.context.putImageData(change, 0, 0);
    } else{
      alert("bad!");
    }
  }

  close(): void{
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
            this.canvas.width = img.width > 1000 ? 1000 : img.width;
            this.canvas.height = img.height > 1000 ? 1000 : img.height;
            this.context.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
          }
        }
      }
      return true;
    }
    return false;
  }

  open(fileElem: HTMLInputElement): void{
    fileElem.click();
  }
}

export default FileProcessor;
