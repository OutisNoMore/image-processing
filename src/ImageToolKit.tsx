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
      let avg: number = (0.2126*data[x] + 0.7152*data[x + 1] + 0.0722*data[x + 2])
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

  // Sobel operator in x direction
  static getGx(image: ImageData): ImageData{
    let operatorX: number[] = [1, 0, -1, 
                               2, 0, -2, 
                               1, 0, -1];
    let operatorXn: number[] = [-1, 0, 1,
                               -2, 0, 2,
                               -1, 0, 1];
    let GxNeg: ImageData = this.convolution(image, operatorXn, 3);
    let Gx: ImageData = this.convolution(image, operatorX, 3);
    for(let y = 0; y < Gx.height; y++){
      for(let x = 0; x < Gx.width; x++){
        let index = (y*Gx.width + x)*4;
        Gx.data[index] = (Gx.data[index] + GxNeg.data[index])/2;
      }
    }

    return Gx;
  }

  // Sobel operator in y direction
  static getGy(image: ImageData): ImageData{
    let operatorY: number[] = [1, 2, 1, 
                               0, 0, 0, 
                              -1,-2,-1];
    let operatorYn: number[] = [-1,-2,-1,
                                 0, 0, 0,
                                 1, 2, 1];
    let GyNeg: ImageData = this.convolution(image, operatorYn, 3);
    let Gy: ImageData = this.convolution(image, operatorY, 3);
    for(let y = 0; y < Gy.height; y++){
      for(let x = 0; x < Gy.width; x++){
        let index = (y*Gy.width + x)*4;
        Gy.data[index] = (Gy.data[index] + GyNeg.data[index])/2;
      }
    }
    return Gy;
  }

  // Implement Sobel Edge Detection
  static sobel(img: ImageData): ImageData{
    let gray = this.grayscale(img); // Get intensity/grayscale of pixels
    // Perform convolution in x and y vectors - produces Gradient Vector or first order partial derivative
    let Gx: ImageData = this.getGx(gray);
    let Gy: ImageData = this.getGy(gray);
    let output: Uint8ClampedArray = new Uint8ClampedArray(Gx.data.length);
    let max = -1;
    // Calculate magnitude of gradient vector
    for(let y: number = 0; y < Gx.height; y++){
      for(let x: number = 0; x < Gx.width; x++){
        let index: number = (y*Gx.width + x)*4;
        let G: number = Math.sqrt(Math.pow(Gx.data[index], 2) + Math.pow(Gy.data[index], 2));
        if(G > max){
          max = G
        }
        output[index] = G;
        output[++index] = G;
        output[++index] = G;
        output[++index] = 255;
      }
    }
    // return edged image
    return new ImageData(output, Gx.width);
  }

  // Prewitt operator x direction
  static getGxP(image: ImageData): ImageData{
    let operatorX: number[] = [1, 0, -1, 
                               1, 0, -1,
                               1, 0, -1];
    let operatorXn: number[] = [-1, 0, 1,
                               -1, 0, 1,
                               -1, 0, 1];
    let GxNeg: ImageData = this.convolution(image, operatorXn, 3);

    let Gx: ImageData = this.convolution(image, operatorX, 3);
    for(let y = 0; y < Gx.height; y++){
      for(let x = 0; x < Gx.width; x++){
        let index = (y*Gx.width + x)*4;
        Gx.data[index] = (Gx.data[index] + GxNeg.data[index])/2;
      }
    }

    return Gx;
  }

  // Prewitt operator y direction
  static getGyP(image: ImageData): ImageData{
    let operatorY: number[] = [1, 1, 1, 
                               0, 0, 0, 
                              -1,-1,-1];
    let operatorYn: number[] = [-1,-1,-1,
                                0, 0, 0,
                                1, 1, 1];
    let GyNeg: ImageData = this.convolution(image, operatorYn, 3);
    let Gy: ImageData = this.convolution(image, operatorY, 3);
    for(let y = 0; y < Gy.height; y++){
      for(let x = 0; x < Gy.width; x++){
        let index = (y*Gy.width + x)*4;
        Gy.data[index] = (Gy.data[index] + GyNeg.data[index])/2;
      }
    }
    return Gy;
  }

  // Prewitt Edge Detection
  static prewitt(img: ImageData): ImageData{
    let gray: ImageData = this.grayscale(img);
    let Gx: ImageData = this.getGxP(gray);
    let Gy: ImageData = this.getGyP(gray);
    let output: Uint8ClampedArray = new Uint8ClampedArray(Gx.data.length);
    for(let y: number = 0; y < Gx.height; y++){
      for(let x: number = 0; x < Gx.width; x++){
        let index: number = (y*Gx.width + x)*4;
        let G: number = Math.sqrt(Math.pow(Gx.data[index], 2) + Math.pow(Gy.data[index], 2));
        output[index] = G;
        output[++index] = G;
        output[++index] = G;
        output[++index] = 255;
      }
    }
    return new ImageData(output, Gx.width);
  }

  // Laplacian transform for second derivative
  static laplaceTransform(img: ImageData): ImageData{
    let matrix: number[] = [-1,-1,-1,
                            -1, 8,-1,
                            -1,-1,-1];
    let convolved: ImageData = this.convolution(img, matrix, 3);
    return convolved;
  }

  // Laplacian edge detection
  static laplacian(img: ImageData): ImageData{
    let gray: ImageData = this.grayscale(img);
    let transformed: ImageData = this.laplaceTransform(gray);
    return transformed;
  }


  // round angle to closest Compass direction
  static round(angle: number): number{
    angle = 180 * (angle/Math.PI);

    if ((angle >= 337.5) && (angle < 22.5)) { return 0; } 
  	else if ((angle >= 22.5) && (angle < 67.5)) { return 45; } 
  	else if ((angle >= 67.5) && (angle < 112.5)) { return 90; } 
  	else if ((angle >= 112.5) && (angle < 157.5)) { return 135; } 
  	else if ((angle >= 157.5) && (angle < 202.5)) { return 0; } 
  	else if ((angle >=202.5) && (angle < 247.5)) { return 45; } 
  	else if ((angle >=247.5) && (angle < 292.5)) { return 90; } 
  	else if ((angle >= 292.5) && (angle < 337.5)) { return 135; }
    return 0;

    /*
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
    */
  }

  static thresholding(img: ImageData, x: number, y: number, upper: number, lower: number): void{
    for(let i = y-1; i < y + 1; i++){
      for(let j = x - 1; j < x + 1; j++){
        if(i >= 0 && j >= 0 && i < img.height && j < img.width){
          let index = (i*img.width + j)*4;
          if(img.data[index] >= lower && img.data[index] <= upper){
            img.data[index] = 255;
            img.data[++index] = 255;
            img.data[++index] = 255;
            img.data[++index] = 255;
            this.thresholding(img, j, i, upper ,lower);
          }
        }
      }
    }
  }

  // Apply recursive hysteresis thresholding on image
  // pass ImageData by reference
  static hysteresis(img: ImageData, lowerThreshold: number, upperThreshold: number): void{
    // Mark all pixels greater or lower than thresholds
    for(let y = 0; y < img.height; y++){
      for(let x = 0; x < img.width; x++){
        let index = (y*img.width + x)*4;
        if(img.data[index] > upperThreshold){
          img.data[index] = 255;
          img.data[++index] = 255;
          img.data[++index] = 255;
        } else if(img.data[index] < lowerThreshold){
          img.data[index] = 0;
          img.data[++index] = 0;
          img.data[++index] = 0;
        } 
      }
    }

    for(let y = 0; y < img.height; y++){
      for(let x = 0; x < img.width; x++){
        let index = (y*img.width + x)*4;
        if(img.data[index] >= lowerThreshold && img.data[index] <= upperThreshold){
          this.thresholding(img, x, y, upperThreshold, lowerThreshold);
        }
      }
    }
  }
  // Implement Canny Edge Detection
  static canny(img: ImageData, lower: number = 0.40, topThreshold: number = 0.50): ImageData{
    let gray = this.grayscale(img); // Get intensity/Grayscale
    let blurred = this.blur(gray);
    // Perform convolution with Sobel operator
    let Gx: ImageData = this.getGx(blurred);
    let Gy: ImageData = this.getGy(blurred);
    // Calculate Gradient for all pixels
    let output: Uint8ClampedArray = new Uint8ClampedArray(Gx.data.length);
    //let edgeThin: ImageData = this.NMS(Gx, Gy);
    let max: number = -1;
    for(let y: number = 0; y < Gx.height; y++){
      for(let x: number = 0; x < Gx.width; x++){
        let index: number = (y*Gx.width + x)*4;
        let G: number = Math.sqrt(Math.pow(Gx.data[index], 2) + Math.pow(Gy.data[index], 2));
        if(G > max){
          max = G;
        }
        output[index] = G;
        output[++index] = G;
        output[++index] = G;
        output[++index] = 255;
      }
    }

    // Non-Maximum suppression for edge thinning
    for(let y = 0; y < Gx.height; y++){
      for(let x = 0; x < Gx.width; x++){
        let index: number = (y*Gx.width + x)*4;
        let G = output[index];
        let angle: number = Math.atan(Gy.data[index]/Gx.data[index]);
        let round: number = this.round(angle);
        let EG: number = 0;
        let WG: number = 0;
        let SG: number = 0;
        let NG: number = 0;
        let NEG: number = 0;
        let SWG: number = 0;
        let NWG: number = 0;
        let SEG: number = 0;
        if(round === 0){
          // check (x + 1, and x - 1)
          if(x === 0){
            EG = Math.sqrt(Math.pow(Gx.data[index + 4], 2) + Math.pow(Gy.data[index + 4], 2));
          } else if(x === Gx.width - 1){
            WG = Math.sqrt(Math.pow(Gx.data[index - 4], 2) + Math.pow(Gy.data[index - 4], 2));
          } else{
            EG = Math.sqrt(Math.pow(Gx.data[index + 4], 2) + Math.pow(Gy.data[index + 4], 2));
            WG = Math.sqrt(Math.pow(Gx.data[index - 4], 2) + Math.pow(Gy.data[index - 4], 2));
          }
        } else if(round === 45){
          // check (x + 1, y + 1 and x - 1, y - 1)
          if((x === 0 && y === 0) || 
             (x === Gx.width - 1 && y === Gx.height - 1)){
            // do nothing
          } else if(x === 0 || y === Gx.height - 1){
            // only NE
            NEG = Math.sqrt(Math.pow(Gx.data[index + 4 - Gx.width*4], 2) + Math.pow(Gy.data[index + 4 - Gy.width*4], 2));
          } else if(y === 0 || x === Gx.width - 1){
            // only SW
            SWG = Math.sqrt(Math.pow(Gx.data[index - 4 + Gx.width*4], 2) + Math.pow(Gy.data[index - 4 + Gy.width*4], 2));
          } else{
            // NE and SW
            NEG = Math.sqrt(Math.pow(Gx.data[index + 4 - Gx.width*4], 2) + Math.pow(Gy.data[index + 4 - Gy.width*4], 2));
            SWG = Math.sqrt(Math.pow(Gx.data[index - 4 + Gx.width*4], 2) + Math.pow(Gy.data[index - 4 + Gy.width*4], 2));
          }
        } else if(round === 90){
          // check (y + 1, and y - 1)
          if(y === 0){
            // only SG
            SG = Math.sqrt(Math.pow(Gx.data[index + Gx.width*4], 2) + Math.pow(Gy.data[index + Gx.width*4], 2));
          } else if(y === Gx.height - 1){
            // only NG
            NG = Math.sqrt(Math.pow(Gx.data[index - Gx.width*4], 2) + Math.pow(Gy.data[index - Gy.width*4], 2));
          } else{
            // NG and SG
            NG = Math.sqrt(Math.pow(Gx.data[index - Gx.width*4], 2) + Math.pow(Gy.data[index - Gy.width*4], 2));
            SG = Math.sqrt(Math.pow(Gx.data[index + Gx.width*4], 2) + Math.pow(Gy.data[index + Gx.width*4], 2));
          }
        } else{
          // check (x - 1, y + 1 and x + 1, y - 1)
          if((x === Gx.width - 1 && y === 0) ||
             (x === 0 && y === Gx.height - 1)){
            // pass
          } else if(x === 0 || y === 0){
            // only SE
            SEG = Math.sqrt(Math.pow(Gx.data[index + 4 +Gx.width*4], 2) + Math.pow(Gy.data[index + 4+Gx.width*4], 2));
          } else if(x === Gx.width - 1 || y === Gx.height - 1){
            // only NW
            NWG = Math.sqrt(Math.pow(Gx.data[index - 4 - Gx.width*4], 2) + Math.pow(Gy.data[index - 4 - Gx.width*4], 2));
          } else{
            // NW and SE
            NWG = Math.sqrt(Math.pow(Gx.data[index - 4 - Gx.width*4], 2) + Math.pow(Gy.data[index - 4 - Gx.width*4], 2));
            SEG = Math.sqrt(Math.pow(Gx.data[index + 4 +Gx.width*4], 2) + Math.pow(Gy.data[index + 4+Gx.width*4], 2));
          }
        }
        // If current pixel is not max, set to black background
        if((G < EG || G < WG)   ||
           (G < SG || G < NG)   ||
           (G < NEG || G < SWG) ||
           (G < NWG || G < SEG)){
          G = 0;
        }
        // Set to magnitude of gradient vector
        output[index] = G;
        output[++index] = G;
        output[++index] = G;
        output[++index] = 255;
      }
    }
    let outImage = new ImageData(output, Gx.width);
    this.hysteresis(outImage, lower*topThreshold*max, topThreshold*max);
    return outImage; 
  }
}

export default ImageToolKit;
