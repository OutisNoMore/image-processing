class ImageProcessor{
  originalImage: ImageData
  newImage: ImageData;

  constructor(original: ImageData){
    this.originalImage = original;
    this.newImage = this.originalImage;
  }

  getNewImage(): ImageData{
    return this.newImage;
  }

  getOriginalImage(): ImageData{
    return this.originalImage;
  }

  setNewImage(newImage: ImageData): void{
    this.newImage = newImage;
  }

  setOriginalImage(original: ImageData): void{
    this.originalImage = original;
  }

  invert(): void{
    let data = this.newImage.data;
    for(let x: number = 0; x < data.length; x += 4){
      data[x] = 255 - data[x];
      data[x + 1] = 255 - data[x + 1];
      data[x + 2] = 255 - data[x + 2];
    }
  }

  grayscale(): void{
    let data = this.newImage.data;
    for(let x: number = 0; x < data.length; x += 4){
      let avg: number = (data[x] + data[x + 1] + data[x + 2])/3
      data[x] = avg;
      data[x + 1] = avg;
      data[x + 2] = avg;
    }
  }

  brightness(factor: number): void{
    let data = this.newImage.data;
    let adjust: number = (1 + factor);
    for(let x: number = 0; x < data.length; x += 4){
      data[x] = data[x] * adjust;
      data[x + 1] = data[x + 1] * adjust;
      data[x + 2] = data[x + 2] * adjust;
    }
  }
}

export default ImageProcessor;
