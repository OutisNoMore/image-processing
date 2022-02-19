class ImageProcessor{
  imageArray: ImageData[] = []; // stack of images
  name: string[] = [];          // stack of names
  index: number = -1;

  empty(): boolean{
    return this.name.length === 0;
  }

  clear(): void{
    this.imageArray = [];
    this.name = [];
    this.index = -1;
  }

  reset(): ImageData{
    this.imageArray = this.imageArray.slice(0, 1);
    this.name = this.name.slice(0, 1);
    this.index = 0;
    return this.imageArray[0];
  }

  hasPrevious(): boolean{
    return this.index !== 0;
  }

  previous(): ImageData{
    if(this.index !== 0){
      this.index--;
      return this.imageArray[this.index];
    } else{
      return new ImageData(0, 0);
    }
  }

  hasNext(): boolean{
    return this.index !== (this.imageArray.length - 1);
  }

  next(): ImageData{
    if(this.index !== this.imageArray.length - 1){
      this.index++;
      return this.imageArray[this.index];
    }
    return new ImageData(0, 0);
  }

  currentImage(): ImageData{
    if(!this.empty()){
      return this.imageArray[this.index];
    }
    return new ImageData(0, 0);
  }

  currentName(): string{
    if(!(this.name.length === 0)){
      return this.name[this.index];
    }
    return "";
  }

  topImage(): ImageData{
    if(!this.empty()){
      return this.imageArray[this.imageArray.length - 1];
    }
    return new ImageData(0, 0);
  }

  add(image: ImageData, name: string){
    this.imageArray = this.imageArray.slice(0, this.index + 1);
    this.name = this.name.slice(0, this.index + 1);
    this.imageArray.push(new ImageData(new Uint8ClampedArray(image.data), image.width));
    this.name.push(name);
    this.index++;
  }

  // create negative or inverse the image
  invert(): void{
    this.add(this.currentImage(), "Inverted");
    let data = this.topImage().data;
    for(let x: number = 0; x < data.length; x += 4){
      data[x] = 255 - data[x];
      data[x + 1] = 255 - data[x + 1];
      data[x + 2] = 255 - data[x + 2];
    }
  }

  // create grayscale of image
  grayscale(): void{
    this.add(this.currentImage(), "Grayscale");
    let data = this.topImage().data;
    for(let x: number = 0; x < data.length; x += 4){
      let avg: number = (data[x] + data[x + 1] + data[x + 2])/3
      data[x] = avg;
      data[x + 1] = avg;
      data[x + 2] = avg;
    }
  }

  // adjust brightness of image
  brightness(factor: number): void{
    this.add(this.currentImage(), "Brightened");
    let data = this.topImage().data;
    let adjust: number = (1 + factor);
    for(let x: number = 0; x < data.length; x += 4){
      data[x] = data[x] * adjust;
      data[x + 1] = data[x + 1] * adjust;
      data[x + 2] = data[x + 2] * adjust;
    }
  }

  // find edges in the image
  edges(): void{
    this.add(this.currentImage(), "Edges");
    let data = this.topImage().data;
    // get 3 neighboring pixels
    let East: number[] = [0, 0, 0]      // east neighbor pixel
    let SouthEast: number[] = [0, 0, 0] // south east neighbor pixel
    let South: number[] = [0, 0, 0]     // south neighbor pixel
    // loop through every pixel in the image
    for(let x: number = 0; x < data.length; x += 4){
      // reset neighbor pixel values
      East = [0, 0, 0] 
      SouthEast = [0, 0, 0]
      South = [0, 0, 0]
      // get correct neighbor pixels
      if((x/4 + 1) % this.topImage().width === 0 && Math.floor(x / this.topImage().width) === this.topImage().height - 1){
        // bottom right corner - no pixels
        continue;
      } 
      else if((x/4 + 1) % this.topImage().width === 0){
        // last column - only get south pixel
        South[0] = data[x + this.topImage().width * 4];
        South[1] = data[x + 1 + this.topImage().width * 4];
        South[2] = data[x + 2 + this.topImage().width * 4];
      }
      else if(Math.floor((x/4) / this.topImage().width) === this.topImage().height - 1){
        // last row - only get east pixel
        East[0] = data[x + 4];
        East[1] = data[x + 5];
        East[2] = data[x + 6];
      }
      else{
        // get all 3 neighbors otherwise
        East[0] = data[x + 4];
        East[1] = data[x + 5];
        East[2] = data[x + 6];
        South[0] = data[x + this.topImage().width * 4];
        South[1] = data[x + 1 + this.topImage().width * 4];
        South[2] = data[x + 2 + this.topImage().width * 4];
        SouthEast[0] = data[x + 4 + this.topImage().width * 4];
        SouthEast[1] = data[x + 5 + this.topImage().width * 4];
        SouthEast[2] = data[x + 6 + this.topImage().width * 4];
      }
      // get average rgb for neighboring pixels
      let red: number = (East[0] + South[0] + SouthEast[0]) / 3;
      let green: number = (East[1] + South[1] + SouthEast[1]) / 3;
      let blue: number = (East[2] + South[2] + SouthEast[2]) / 3;
      // calculate distance or how different current pixel is from neighbors
      let distance: number = Math.pow(Math.pow(data[x] - red, 2) + Math.pow(data[x + 1] - green, 2) + Math.pow(data[x + 2] - blue, 2), 0.5);
      if(distance > 25){
        // threshold of 25, means there is an edge - color white
        data[x] = 255;
        data[x + 1] = 255;
        data[x + 2] = 255;
      } else{
        // otherwise no difference, color black
        data[x] = 0;
        data[x + 1] = 0;
        data[x + 2] = 0;
      }
    }
  }
}

export default ImageProcessor;
