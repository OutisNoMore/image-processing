class ImageProcessor{
  // create negative or inverse the image
  invert(img: ImageData): ImageData{
    let output = new ImageData(new Uint8ClampedArray(img.data), img.width);
    let data = output.data;
    for(let x: number = 0; x < data.length; x += 4){
      data[x] = 255 - data[x];
      data[x + 1] = 255 - data[x + 1];
      data[x + 2] = 255 - data[x + 2];
    }

    return output;
  }

  // create grayscale of image
  grayscale(img: ImageData): ImageData{
    let output = new ImageData(new Uint8ClampedArray(img.data), img.width);
    let data = output.data;
    for(let x: number = 0; x < data.length; x += 4){
      let avg: number = (data[x] + data[x + 1] + data[x + 2])/3
      data[x] = avg;
      data[x + 1] = avg;
      data[x + 2] = avg;
    }

    return output;
  }

  // adjust brightness of image
  brightness(img: ImageData, factor: number): ImageData{
    let output = new ImageData(new Uint8ClampedArray(img.data), img.width);
    let data = output.data;
    let adjust: number = (1 + factor);
    for(let x: number = 0; x < data.length; x += 4){
      data[x] = data[x] * adjust;
      data[x + 1] = data[x + 1] * adjust;
      data[x + 2] = data[x + 2] * adjust;
    }

    return output;
  }

  // Create Gaussian filter
  gaussian(size: number, sigma: number): number[]{
    let output: number[] = [];            // output array of Gaussian filter kernel
    let sum: number = 0.0;                // sum to normalize kernel
    let variance: number = sigma * sigma; // variance or sigma squared
    let r: number = 0;                    // numerator
    let center: number = Math.floor(size/2); // Square matrix so center is (size/2, size/2)
    // calculate gaussian filter
    for(let y: number = -1*center; y <= center; y++){
      for(let x: number= -1*center; x <= center; x++){
         r = x*x + y*y;
         output[(x+center) + (y+center)*size] = Math.exp(-1*(r/(2*variance))) / (2 * Math.PI * variance);
         sum += output[(x + center) + (y + center) * size];
      }
    }
    // normalize kernel
    for(let i: number = 0; i < output.length; i++){
      output[i] = output[i]/sum;
    }
    // return Gaussian filter
    return output;
  }

  // Pad image with zeroes
  pad(img: ImageData, thickness: number): ImageData{
    let total: number = 4 * ((img.width + (2 * thickness)) * (img.height + (thickness * 2))); // total size of new padded array
    let output: Uint8ClampedArray = new Uint8ClampedArray(total); // create padded imagedata output
    let padIndex: number = 0; 
    let index: number = 0;
    for(let y: number = thickness; y < img.height + thickness; y++){
      for(let x: number = thickness; x < img.width + thickness; x++){
        padIndex = (y * (img.width + 2*thickness) + x)*4;
        index = ((y-thickness) * img.width + (x-thickness)) * 4;
        output[padIndex] = img.data[index];
        output[++padIndex] = img.data[++index];
        output[++padIndex] = img.data[++index];
        output[++padIndex] = img.data[++index];
      }
    }

    return new ImageData(output, img.width + thickness * 2, img.height + thickness*2);
  }

  // Apply matrix convolution
  convolution(padded: ImageData, kernel: number[], size: number): ImageData{
    let thickness: number = Math.floor(size/2);
    let total: number = 4 * ((padded.width - 2 * thickness) * (padded.height - 2 * thickness));
    let output: Uint8ClampedArray = new Uint8ClampedArray(total);
    let data: Uint8ClampedArray = padded.data;
    
    for(let y: number = thickness; y < (padded.height - thickness); y++){
      for(let x: number = thickness; x < (padded.width - thickness); x++){
        let outIndex: number = ((y-thickness)*(padded.width - 2*thickness) + (x-thickness))*4;

        let sumR: number = 0;
        let sumG: number = 0;
        let sumB: number = 0;
        for(let h: number = 0; h < size; h++){
          for(let i: number = 0; i < size; i++){
            let kernelIndex: number = h*size + i;
            let padX: number = x - thickness + i;
            let padY: number = y - thickness + h;
            let padIndex: number = (padY*(padded.width) + padX)*4;
            sumR += kernel[kernelIndex]*data[padIndex];
            sumG += kernel[kernelIndex]*data[++padIndex];
            sumB += kernel[kernelIndex]*data[++padIndex];
          }
        }
        output[outIndex] = sumR;
        output[++outIndex] = sumG;
        output[++outIndex] = sumB;
        output[++outIndex] = 255;
      }
    }

    return new ImageData(output, padded.width - 2 * thickness);
  }

  // Apply Guassian Blur on image
  blur(img: ImageData): ImageData{
    let output = this.convolution(this.pad(img, 2), this.gaussian(5, 1), 5);
    return output;
  }

  // find edges in the image
  edges(img: ImageData): ImageData{
    let output = this.grayscale(img);
    let data = output.data;
    // get 3 neighboring pixels
    let East: number = 0;
    let SouthEast: number = 0;
    let South: number = 0;
    // loop through every pixel in the image
    for(let x: number = 0; x < data.length; x += 4){
      // reset neighbor pixel values
      East = 0;
      SouthEast = 0;
      South = 0;
      // get correct neighbor pixels
      if((x/4 + 1) % output.width === 0 && Math.floor(x / output.width) === output.height - 1){
        // bottom right corner - no pixels
        continue;
      } 
      else if((x/4 + 1) % output.width === 0){
        // last column - only get south pixel
        South = data[x + output.width * 4];
      }
      else if(Math.floor((x/4) / output.width) === output.height - 1){
        // last row - only get east pixel
        East = data[x + 4];
      }
      else{
        // get all 3 neighbors otherwise
        East = data[x + 4];
        South = data[x + output.width * 4];
        SouthEast = data[x + 4 + output.width * 4];
      }
      // get average intensity for neighboring pixels
      let intensity: number = (East + South + SouthEast) / 3;
      // calculate distance or how different current pixel is from neighbors
      let distance: number = Math.abs(data[x] - intensity);
      if(distance > 10){
        // threshold of 10, means there is an edge - color white
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
    return output;
  }
}

export default ImageProcessor;
