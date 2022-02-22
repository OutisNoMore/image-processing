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
