class ImageProcessor{
  originalImage: ImageData; // image data is stored from top left corner, to right in rows
  newImage: ImageData;     // update image without destroying original
  name: string;            // name of new image or edited image

  constructor(original: ImageData){
    this.originalImage = new ImageData(new Uint8ClampedArray(original.data), original.width);
    this.newImage = new ImageData(new Uint8ClampedArray(original.data), original.width);
    this.name = "unedited";
  }

  // access the new updated image
  getNewImage(): ImageData{
    return this.newImage;
  }

  // access the original unchanged image
  getOriginalImage(): ImageData{
    return this.originalImage;
  }

  // get name of new image
  getName(): string{
    return this.name;
  }

  // change the image to process
  setImage(original: ImageData): void{
    this.originalImage = original;
    this.newImage = original;
  }

  // set name for new image
  setName(str: string): void{
    this.name = str;
  }

  // create negative or inverse the image
  invert(): void{
    let data = this.newImage.data;
    for(let x: number = 0; x < data.length; x += 4){
      data[x] = 255 - data[x];
      data[x + 1] = 255 - data[x + 1];
      data[x + 2] = 255 - data[x + 2];
    }
    this.name = "Inverted";
  }

  // create grayscale of image
  grayscale(): void{
    let data = this.newImage.data;
    for(let x: number = 0; x < data.length; x += 4){
      let avg: number = (data[x] + data[x + 1] + data[x + 2])/3
      data[x] = avg;
      data[x + 1] = avg;
      data[x + 2] = avg;
    }
    this.name = "Grayscale";
  }

  // adjust brightness of image
  brightness(factor: number): void{
    let data = this.newImage.data;
    let adjust: number = (1 + factor);
    for(let x: number = 0; x < data.length; x += 4){
      data[x] = data[x] * adjust;
      data[x + 1] = data[x + 1] * adjust;
      data[x + 2] = data[x + 2] * adjust;
    }
    this.name = "Brightness";
  }

  // find edges in the image
  edges(): void{
    let data = this.newImage.data; // pixel representation of image
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
      if((x/4 + 1) % this.newImage.width === 0 && Math.floor(x / this.newImage.width) === this.newImage.height - 1){
        // bottom right corner - no pixels
        continue;
      } 
      else if((x/4 + 1) % this.newImage.width === 0){
        // last column - only get south pixel
        South[0] = data[x + this.newImage.width * 4];
        South[1] = data[x + 1 + this.newImage.width * 4];
        South[2] = data[x + 2 + this.newImage.width * 4];
      }
      else if(Math.floor((x/4) / this.newImage.width) === this.newImage.height - 1){
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
        South[0] = data[x + this.newImage.width * 4];
        South[1] = data[x + 1 + this.newImage.width * 4];
        South[2] = data[x + 2 + this.newImage.width * 4];
        SouthEast[0] = data[x + 4 + this.newImage.width * 4];
        SouthEast[1] = data[x + 5 + this.newImage.width * 4];
        SouthEast[2] = data[x + 6 + this.newImage.width * 4];
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
    this.name = "Edges";
  }
}

export default ImageProcessor;
