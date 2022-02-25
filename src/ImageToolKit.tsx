class ImageToolKit{
  // create negative or inverse the image
  static invert(img: ImageData): ImageData{
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
  static grayscale(img: ImageData): ImageData{
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
  static brightness(img: ImageData, factor: number): ImageData{
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
  static gaussian(size: number, sigma: number): number[]{
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
  static pad(img: ImageData, thickness: number): ImageData{
    let length: number = 4*((img.width + (2 * thickness)) * (img.height + (thickness * 2))); // total size of new padded array
    let output: Uint8ClampedArray = new Uint8ClampedArray(length); // create padded image 
    let padIndex: number = 0;
    let index: number = 0;
    for(let y: number = thickness; y < (img.height + thickness); y++){
      for(let x: number = thickness; x < (img.width + thickness); x++){
        padIndex = (y * (img.width + 2*thickness) + x)*4;
        index = ((y - thickness) * img.width + (x - thickness)) * 4;
        output[padIndex] = img.data[index];
        output[++padIndex] = img.data[++index];
        output[++padIndex] = img.data[++index];
        output[++padIndex] = img.data[++index];
      }
    }

    return new ImageData(output, (img.width + thickness * 2), (img.height + thickness*2));
  }

  // Apply matrix convolution
  static convolution(matrix: ImageData, kernel: number[], size: number): ImageData{
    let thickness: number = Math.floor(size/2);
    let padded = this.pad(matrix, thickness);;
    let output: Uint8ClampedArray = new Uint8ClampedArray(matrix.data.length);
    let data: Uint8ClampedArray = padded.data;

    for(let y: number = thickness; y < padded.height - thickness; y++){
      for(let x: number = thickness; x < padded.width - thickness; x++){
        let outIndex: number = ((y-thickness)*(padded.width - 2*thickness) + (x-thickness))*4;
        let sumR: number = 0;
        let sumG: number = 0;
        let sumB: number = 0;
        for(let h: number = 0; h < size; h++){
          for(let i: number = 0; i < size; i++){
            let kernelIndex: number = (h*size + i);
            let padX: number = x - thickness + i;
            let padY: number = y - thickness + h;
            let padIndex: number = (padY*padded.width + padX)*4;
            sumR += kernel[kernelIndex]*data[padIndex];
            sumG += kernel[kernelIndex]*data[++padIndex];
            sumB += kernel[kernelIndex]*data[++padIndex];
          }
        }
        output[outIndex] = sumR/size*size;
        output[++outIndex] = sumG/size*size;
        output[++outIndex] = sumB/size*size;
        output[++outIndex] = 255;
      }
    }

    return new ImageData(output, matrix.width);
  }

  // Apply Guassian Blur on image
  static blur(img: ImageData, size: number = 3, sigma: number = 1): ImageData{
    let output = this.convolution(img, this.gaussian(size, sigma), size);
    return output;
  }

  static getGx(image: ImageData): ImageData{
    let operatorX: number[] = [1, 0, -1, 
                               2, 0, -2, 
                               1, 0, -1];
    let Gx: ImageData = this.convolution(image, operatorX, 3);
    return Gx;
  }

  static getGxNeg(image: ImageData): ImageData{
    let operatorX: number[] = [-1, 0, 1,
                               -2, 0, 2,
                               -1, 0, 1];
    let GxNeg: ImageData = this.convolution(image, operatorX, 3);
    return GxNeg;
  }

  static getGyNeg(image: ImageData): ImageData{
    let operatorY: number[] = [-1,-2,-1,
                                0, 0, 0,
                                1, 2, 1];
    let GyNeg: ImageData = this.convolution(image, operatorY, 3);
    return GyNeg;
  }


  static getGy(image: ImageData): ImageData{
    let operatorY: number[] = [1, 2, 1, 
                               0, 0, 0, 
                              -1,-2,-1];
    let Gy: ImageData = this.convolution(image, operatorY, 3);
    return Gy;
  }

  // Implement Sobel Edge Detection
  static sobel(img: ImageData): ImageData{
    let gray = this.grayscale(img); // Get intensity/grayscale of pixels
    // Perform convolution in x and y vectors - produces Gradient Vector or first order partial derivative
    let Gx: ImageData = this.getGx(gray);
    let Gy: ImageData = this.getGy(gray);
    let GxN: ImageData = this.getGxNeg(gray);
    let GyN: ImageData = this.getGyNeg(gray);
    let output: Uint8ClampedArray = new Uint8ClampedArray(Gx.data.length);
    // Calculate magnitude of gradient vector
    let max = -1;
    for(let y: number = 0; y < Gx.height; y++){
      for(let x: number = 0; x < Gx.width; x++){
        let index: number = (y*Gx.width + x)*4;
        let G: number = Math.sqrt(Math.pow((Gx.data[index] + GxN.data[index])/2, 2) + Math.pow((Gy.data[index] + GyN.data[index])/2, 2));
        output[index] = G;
        output[++index] = G;
        output[++index] = G;
        output[++index] = 255;
      }
    }
    // return edged image
    return new ImageData(output, Gx.width);
  }

  // round angle to closest Compass direction
  static round(angle: number): number{
    if(angle > Math.PI){
      angle = angle - Math.PI;
    }

    if(angle > (7/8)*Math.PI){
      // East West
      return 0;
    } else if(angle > (5/8)*Math.PI){
      // North West, South East
      return 135;
    } else if(angle > (3/8) * Math.PI){
      // North, South
      return 90;
    } else if(angle > Math.PI/8){
      // North East, South West
      return 45;
    } else{
      // East-West
      return 0;
    }
  }

  // Implement Canny Edge Detection
  static canny(img: ImageData, topThreshold: number = 0.9): ImageData{
    let gray = this.grayscale(img); // Get intensity/Grayscale
    let blurred = this.blur(gray);  // Apply Gaussian blur to reduce noise
    // Perform convolution with Sobel operator
    let Gx: ImageData = this.getGx(gray);
    let Gy: ImageData = this.getGy(gray);
    let GxN: ImageData = this.getGxNeg(gray);
    let GyN: ImageData = this.getGyNeg(gray);
    // Calculate Gradient for all pixels
    let output: Uint8ClampedArray = new Uint8ClampedArray(Gx.data.length);
    let max: number = -1;
    for(let y: number = 0; y < Gx.height; y++){
      for(let x: number = 0; x < Gx.width; x++){
        let index: number = (y*Gx.width + x)*4;
        let G: number = Math.sqrt(Math.pow(Gx.data[index], 2) + Math.pow(Gy.data[index], 2) + Math.pow(GyN.data[index], 2) + Math.pow(GxN.data[index], 2));
        let angle: number = Math.atan(Gy.data[index]/Gx.data[index]);
        let round: number = this.round(angle);
        // Non-Maximum suppression for edge thinning
        let EG = 0;
        let WG = 0;
        let SG = 0;
        let NG = 0;
        let NEG = 0;
        let SWG = 0;
        let NWG = 0;
        let SEG = 0;
        if(round === 0){
          // check (x + 1, and x - 1)
          if(x === 0){
            EG = Math.sqrt(Math.pow(Gx.data[index + 4], 2) + Math.pow(Gy.data[index + 4], 2));
          } else if(x === Gx.width - 1){
            WG = output[index-4];
          } else{
            EG = Math.sqrt(Math.pow(Gx.data[index + 4], 2) + Math.pow(Gy.data[index + 4], 2));
            WG = output[index - 4];
          }
        } else if(round === 45){
          // check (x + 1, y + 1 and x - 1, y - 1)
          if((x === 0 && y === 0) || 
             (x === Gx.width - 1 && y === Gx.height - 1)){
            // do nothing
          } else if(x === 0 || y === Gx.height - 1){
            // only NE
            NEG = output[index + 4 - Gx.width*4];
          } else if(y === 0 || x === Gx.width - 1){
            // only SW
            SWG = Math.sqrt(Math.pow(Gx.data[index - 4 + Gx.width*4], 2) + Math.pow(Gy.data[index - 4 + Gy.width*4], 2));
          } else{
            // NE and SW
            NEG = output[index + 4 - Gx.width*4];
            SWG = Math.sqrt(Math.pow(Gx.data[index - 4 + Gx.width*4], 2) + Math.pow(Gy.data[index - 4 + Gy.width*4], 2));
          }
        } else if(round === 90){
          // check (y + 1, and y - 1)
          if(y === 0){
            // only SG
            SG = Math.sqrt(Math.pow(Gx.data[index + Gx.width*4], 2) + Math.pow(Gy.data[index + Gy.width*4], 2));
          } else if(y === Gx.height - 1){
            // only NG
            NG = output[index - Gx.width*4];
          } else{
            // NG and SG
            NG = output[index - Gx.width*4];
            SG = Math.sqrt(Math.pow(Gx.data[index + Gx.width*4], 2) + Math.pow(Gy.data[index + Gy.width*4], 2));
          }
        } else{
          // check (x - 1, y + 1 and x + 1, y - 1)
          if((x === Gx.width - 1 && y === 0) ||
             (x === 0 && y === Gx.height - 1)){
            // pass
          } else if(x === 0 || y === 0){
            // only SE
            SEG = Math.sqrt(Math.pow(Gx.data[index + Gx.width*4 + 4], 2) + Math.pow(Gy.data[index + Gy.width*4 + 4], 2));
          } else if(x === Gx.width - 1 || y === Gx.height - 1){
            // only NW
            NWG = output[index - Gx.width*4 - 4];
          } else{
            // NW and SE
            NWG = output[index - Gx.width*4 - 4];
            SEG = Math.sqrt(Math.pow(Gx.data[index + Gx.width*4 + 4], 2) + Math.pow(Gy.data[index + Gy.width*4 + 4], 2));
          }
        }
        // If current pixel is not max, set to black background
        if((G < EG || G < WG)   ||
           (G < SG || G < NG)   ||
           (G < NEG || G < SWG) ||
           (G < NWG || G < SEG)){
          G = 0;
        }
        // Find maximum value to use for thresholding
        if(G > max){
          max = G;
        }
        // Set to magnitude of gradient vector
        output[index] = G;
        output[++index] = G;
        output[++index] = G;
        output[++index] = 255;
      }
    }
//    return new ImageData(output, Gx.width);
    // Hysteresis Thresholding
    let upperThreshold = max*0.7;//topThreshold;
    let lowerThreshold = upperThreshold*0.3;
    for(let y = 0; y < Gx.height; y++){
      for(let x = 0; x < Gx.width; x++){
        let index = (y*Gx.width + x)*4;
        let intensity = output[index];
        if(output[index] > upperThreshold){
          intensity = 255;
        } else if(output[index] < lowerThreshold){
          intensity = 0;
        } 
        output[index] = intensity;
        output[++index] = intensity;
        output[++index] = intensity;
      }
    }

//    return new ImageData(output, Gx.width);
    
    for(let y = 0; y < Gx.height; y++){
      for(let x = 0; x < Gx.width; x++){
        let index = (y*Gx.width + x)*4;
        let intensity = 0;
        if(output[index] >= lowerThreshold && output[index] <= upperThreshold){
          if(x === 0 && y === 0){
            // EG, SEG, and SG
            if(output[index + 4] === 255 ||
               output[index + 4 + Gx.width*4] === 255 ||
               output[index + Gx.width*4] === 255){
              intensity = 255;
            }
          } else if(x === Gx.width - 1 && y === 0){
            // WG, SWG, SG
            if(output[index - 4] === 255 ||
               output[index - 4 + Gx.width*4] === 255 ||
               output[index + Gx.width*4] === 255){
              intensity = 255;
            }
          } else if(x === 0 && y === Gx.height - 1){
            // NG, NEG, EG
            if(output[index + 4] === 255 ||
               output[index + 4 - Gx.width*4] === 255 ||
               output[index - Gx.width*4] === 255){
              intensity = 255;
            }
          } else if(x === Gx.width - 1 && y === Gx.height - 1){
            // NG, NWG, WG
            if(output[index - 4] === 255 ||
               output[index - Gx.width*4] === 255 ||
               output[index - 4 - Gx.width*4] === 255){
              intensity = 255;
            }
          } else if(x === 0){
            // NG, NEG, EG, SEG, SG
            if(output[index - Gx.width*4] === 255 ||
               output[index - Gx.width*4 + 4] === 255 ||
               output[index + 4] === 255 ||
               output[index + 4 + Gx.width*4] === 255 ||
               output[index + Gx.width*4] === 255){
              intensity = 255;
            }
          } else if(x === Gx.width - 1){
            // NG, NWG, WG, SWG, SG
            if(output[index - Gx.width*4] === 255 ||
               output[index - Gx.width*4 - 4] === 255 ||
               output[index - 4] === 255 ||
               output[index + Gx.width*4 - 4] === 255 ||
               output[index + Gx.width*4] === 255){
              intensity = 255;
            }
          } else if(y === 0){
            // EG, SEG, SG, SWG, WG
            if(output[index + 4] === 255 ||
               output[index + 4 + Gx.width*4] === 255 ||
               output[index + Gx.width*4] === 255 ||
               output[index - 4 + Gx.width*4] === 255 ||
               output[index - 4] === 255){
              intensity = 255;
            }
          } else if(y === Gx.height - 1){
            // WG, NWG, NG, NEG, EG
            if(output[index - 4] === 255 ||
               output[index - 4 - Gx.width*4] === 255 ||
               output[index - Gx.width*4] === 255 ||
               output[index + 4 - Gx.width*4] === 255 ||
               output[index + 4] === 255){
              intensity = 255;

            }
          } else{
            // NG, NEG, EG, SEG, SG, SWG, WG, NWG
            if(output[index + 4] === 255 ||
               output[index - 4] === 255 ||
               output[index + Gx.width*4] === 255 ||
               output[index - Gx.width*4] === 255 ||
               output[index + 4 + Gx.width*4] === 255 ||
               output[index - 4 + Gx.width*4] === 255 ||
               output[index + 4 - Gx.width*4] === 255 ||
               output[index - 4 - Gx.width*4] === 255)
              {
              intensity = 255;
            }
          }
        }
        output[index] = intensity;
        output[++index] = intensity;
        output[++index] = intensity;
      }
    }

    return new ImageData(output, Gx.width);
  }

  // find edges in the image
  static edges(img: ImageData): ImageData{
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

export default ImageToolKit;