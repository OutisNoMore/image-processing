/** This static class represents a collection of tools that can be used to process raw ImageData */
class ImageToolKit{
  /**
   * Returns a negative of the given image
   * @param ImageData - raw image data to process
   * @return ImageData - Inverted image
   */
  static invert(img: ImageData): ImageData{
    let output = new ImageData(new Uint8ClampedArray(img.data), img.width); // create new ImageData to return
    let data = output.data; // get raw image bytes as array
    // iterate through all pixels of image
    for(let x: number = 0; x < data.length; x += 4){
      data[x] = 255 - data[x];         // invert red value
      data[x + 1] = 255 - data[x + 1]; // invert green value
      data[x + 2] = 255 - data[x + 2]; // invert blue value
    }
    // return processed image
    return output;
  }

  /**
   * Creates a grayscale version of the image based on color intensity
   * @param ImageData - raw image data to process
   * @return ImageData - grayscale of image
   */
  static grayscale(img: ImageData): ImageData{
    let output = new ImageData(new Uint8ClampedArray(img.data), img.width); // create new imageData to return
    let data = output.data; // get raw image bytes as array
    // iterate through all pixels of image
    for(let x: number = 0; x < data.length; x += 4){
      let avg: number = (0.2126*data[x] + 0.7152*data[x + 1] + 0.0722*data[x + 2]) // calculate intensity
      data[x] = avg;     // set red to intensity/gray
      data[x + 1] = avg; // set green to intensity/gray
      data[x + 2] = avg; // set blue to intensity/gray
    }
    // return processed image
    return output;
  }

  /**
   * Adjusts the brightness of the image 
   * @param ImageData - raw image data to process
   * @param number - factor to adjust brightness by
   * @return ImageData - brightness adjusted image
   */
  static brightness(img: ImageData, factor: number): ImageData{
    let output = new ImageData(new Uint8ClampedArray(img.data), img.width); // create a new ImageData to return
    let data = output.data; // get raw image bytes as array
    let adjust: number = (1 + factor); // calculate factor to adjust brightness by
    // iterate through all pixels of image
    for(let x: number = 0; x < data.length; x += 4){
      data[x] = data[x] * adjust;         // scale brightness by value
      data[x + 1] = data[x + 1] * adjust; // scale brightness
      data[x + 2] = data[x + 2] * adjust; // scale brightness
    }
    // return processed image
    return output;
  }

  /**
   * Generate an array of gaussian values to blur with 
   * @param size (number) - size of Gaussian matrix to return
   * @param sigma (number) - sigma to use to create Gaussian values, higher sigma = more blur
   * @return number[] - array of gaussian values
   */
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

  /**
   * Pad image with white space 
   * @param ImageData - raw image data to process
   * @param thickness (number) - number of pixels to pad image with
   * @return ImageData - image with padding
   */
  static pad(img: ImageData, thickness: number): ImageData{
    let length: number = 4*((img.width + (2 * thickness)) * (img.height + (thickness * 2))); // total size of new padded array
    let output: Uint8ClampedArray = new Uint8ClampedArray(length); // create padded image 
    let padIndex: number = 0; // index of padded image
    let index: number = 0; // index of current image
    // iterate through all pixels of image
    for(let y: number = thickness; y < (img.height + thickness); y++){
      for(let x: number = thickness; x < (img.width + thickness); x++){
        padIndex = (y * (img.width + 2*thickness) + x)*4; // calculate index of padded image
        index = ((y - thickness) * img.width + (x - thickness)) * 4; // calculate index of current image
        output[padIndex] = img.data[index];     // copy red pixels
        output[++padIndex] = img.data[++index]; // copy green pixels
        output[++padIndex] = img.data[++index]; // copy blue pixels
        output[++padIndex] = img.data[++index]; // copy alpha/transparency
      }
    }
    // return padded image
    return new ImageData(output, (img.width + thickness * 2), (img.height + thickness*2));
  }

  /**
   * Does matrix convolution between given matrix and kernel
   * @param ImageData - raw image data to process
   * @param kernel (number[]) - kernel to do convolution
   * @param size (number) - size of kernel
   * @return ImageData - result of convolution
   */
  static convolution(matrix: ImageData, kernel: number[], size: number): ImageData{
    let thickness: number = Math.floor(size/2); // calculate how much border is needed for kernel with given size
    let padded = this.pad(matrix, thickness);   // create padded matrix to convolve
    let output: Uint8ClampedArray = new Uint8ClampedArray(matrix.data.length); // image to return
    let data: Uint8ClampedArray = padded.data; // get raw image data
    // iterate through all pixels of image
    for(let y: number = thickness; y < padded.height - thickness; y++){
      for(let x: number = thickness; x < padded.width - thickness; x++){
        let outIndex: number = ((y-thickness)*(padded.width - 2*thickness) + (x-thickness))*4; // get index
        let sumR: number = 0; // add up all red values
        let sumG: number = 0; // add up all green values
        let sumB: number = 0; // add up all blue values
        // Convolution around pixel
        for(let h: number = 0; h < size; h++){
          for(let i: number = 0; i < size; i++){
            let kernelIndex: number = (h*size + i);
            let padX: number = x - thickness + i; // get x of bigger matrix
            let padY: number = y - thickness + h; // get y of bigger matrix
            let padIndex: number = (padY*padded.width + padX)*4; // calculate index
            sumR += kernel[kernelIndex]*data[padIndex];   // add up red value
            sumG += kernel[kernelIndex]*data[++padIndex]; // add up green value
            sumB += kernel[kernelIndex]*data[++padIndex]; // add up blue value
          }
        }
        // Normalize output
        output[outIndex] = sumR/size*size;
        output[++outIndex] = sumG/size*size;
        output[++outIndex] = sumB/size*size;
        output[++outIndex] = 255;
      }
    }
    // return result of convolution
    return new ImageData(output, matrix.width);
  }

  /**
   * Blur image using Gaussian
   * @param ImageData - raw image data to process
   * @param size (number) - size of Gaussian to create
   * @param sigma (number) - sigma of Gaussian
   * @return ImageData - Blurred image
   */
  static blur(img: ImageData, size: number = 3, sigma: number = 1): ImageData{
    let output = this.convolution(img, this.gaussian(size, sigma), size); // do convolution
    return output; // return output
  }

  /**
   * Apply sobel in x direction
   * @param ImageData - raw image data to process
   * @return ImageData - Sobel in x direction
   */
  static getGx(image: ImageData): ImageData{
    // Sobel operator in X direction
    let operatorX: number[] = [1, 0, -1, 
                               2, 0, -2, 
                               1, 0, -1];
    // Sobel operator in opposite X direction
    let operatorXn: number[] = [-1, 0, 1,
                               -2, 0, 2,
                               -1, 0, 1];
    // Caluclate both Sobel operations
    let GxNeg: ImageData = this.convolution(image, operatorXn, 3);
    let Gx: ImageData = this.convolution(image, operatorX, 3);
    // Combine results of both to get all edges in x direction
    for(let y = 0; y < Gx.height; y++){
      for(let x = 0; x < Gx.width; x++){
        let index = (y*Gx.width + x)*4;
        Gx.data[index] = (Gx.data[index] + GxNeg.data[index])/2;
      }
    }
    // return output of edges in x direction
    return Gx;
  }

  /**
   * Apply Sobel in y direction
   * @param ImageData - raw image data to process
   * @return ImageData - Sobel in y direction
   */
  static getGy(image: ImageData): ImageData{
    // Sobel operator in y direction
    let operatorY: number[] = [1, 2, 1, 
                               0, 0, 0, 
                              -1,-2,-1];
    // Sobel operator in opposite y direction
    let operatorYn: number[] = [-1,-2,-1,
                                 0, 0, 0,
                                 1, 2, 1];
    // Calculate Sobel in Y direction using convolution
    let GyNeg: ImageData = this.convolution(image, operatorYn, 3);
    let Gy: ImageData = this.convolution(image, operatorY, 3);
    // Combine both y directions
    for(let y = 0; y < Gy.height; y++){
      for(let x = 0; x < Gy.width; x++){
        let index = (y*Gy.width + x)*4;
        Gy.data[index] = (Gy.data[index] + GyNeg.data[index])/2;
      }
    }
    // Return all edges in y found using Sobel
    return Gy;
  }

  /**
   * Get edges using Sobel operator
   * @param ImageData - raw image data to process
   * @return ImageData - Edges found using Sobel
   */
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

  /**
   * Apply Prewitt in the x direction 
   * @param ImageData - raw image data to process
   * @return ImageData - edges in image found using Prewitt
   */
  static getGxP(image: ImageData): ImageData{
    // Apply in x direction
    let operatorX: number[] = [1, 0, -1, 
                               1, 0, -1,
                               1, 0, -1];
    // Apply in opposite x direction
    let operatorXn: number[] = [-1, 0, 1,
                               -1, 0, 1,
                               -1, 0, 1];
    // Apply convolution
    let GxNeg: ImageData = this.convolution(image, operatorXn, 3);
    let Gx: ImageData = this.convolution(image, operatorX, 3);
    // Combine both directions for complete edges
    for(let y = 0; y < Gx.height; y++){
      for(let x = 0; x < Gx.width; x++){
        let index = (y*Gx.width + x)*4;
        Gx.data[index] = (Gx.data[index] + GxNeg.data[index])/2;
      }
    }
    // Return all edges in x direction
    return Gx;
  }

  /**
   * Apply Prewitt Operator in the y direction
   * @param ImageData - raw image data to process
   * @return ImageData - Edges in y direction
   */
  static getGyP(image: ImageData): ImageData{
    // Get edges in y direction
    let operatorY: number[] = [1, 1, 1, 
                               0, 0, 0, 
                              -1,-1,-1];
    // Get edges in opposite y direction
    let operatorYn: number[] = [-1,-1,-1,
                                0, 0, 0,
                                1, 1, 1];
    // Apply convolution on both y direction
    let GyNeg: ImageData = this.convolution(image, operatorYn, 3);
    let Gy: ImageData = this.convolution(image, operatorY, 3);
    // Combine results for all y values
    for(let y = 0; y < Gy.height; y++){
      for(let x = 0; x < Gy.width; x++){
        let index = (y*Gy.width + x)*4;
        Gy.data[index] = (Gy.data[index] + GyNeg.data[index])/2;
      }
    }
    // Return all edges in y direction
    return Gy;
  }

  /**
   * Use Prewitt operator to get edges of image
   * @param ImageData - raw image data to process
   * @return ImageData - Edges of image based on Prewitt
   */
  static prewitt(img: ImageData): ImageData{
    let gray: ImageData = this.grayscale(img); // Calculate intensity values of image
    let Gx: ImageData = this.getGxP(gray);     // get all edges in x direction
    let Gy: ImageData = this.getGyP(gray);     // get all edges in y direction
    let output: Uint8ClampedArray = new Uint8ClampedArray(Gx.data.length); // output matrix
    // Iterate through all Gx and Gy values
    for(let y: number = 0; y < Gx.height; y++){
      for(let x: number = 0; x < Gx.width; x++){
        let index: number = (y*Gx.width + x)*4;
        let G: number = Math.sqrt(Math.pow(Gx.data[index], 2) + Math.pow(Gy.data[index], 2)); // calculate magnitude of gradient
        // create map of magnitudes
        output[index] = G;
        output[++index] = G;
        output[++index] = G;
        output[++index] = 255;
      }
    }
    // Return magnitude of gradient
    return new ImageData(output, Gx.width);
  }

  /**
   * Apply Laplacian Operator on image
   * @param ImageData - raw image data to process
   * @return ImageData - Edges found using Laplace
   */
  static laplaceTransform(img: ImageData): ImageData{
    // Laplace operator
    let matrix: number[] = [-1,-1,-1,
                            -1, 8,-1,
                            -1,-1,-1];
    // Apply convolution with operator
    let convolved: ImageData = this.convolution(img, matrix, 3);
    // return edges found
    return convolved;
  }

  /**
   * Use Laplacian operator to detect edges
   * @param ImageData - raw image data to process
   * @return ImageData - Edges found using Laplace
   */
  static laplacian(img: ImageData): ImageData{
    let gray: ImageData = this.grayscale(img); // get intesity values
    let transformed: ImageData = this.laplaceTransform(gray); // apply operator
    // return edges
    return transformed;
  }


  /**
   * Round angles to correspond to neighboring pixel
   * @param angle (number) - angle to round
   * @return number - rounded version of angle
   */
  static round(angle: number): number{
    // convert from radians to degrees
    angle = 180 * (angle/Math.PI);
    // Round to East pixel
    if ((angle >= 337.5) && (angle < 22.5)) { return 0; } 
    // Round to North East pixel
  	else if ((angle >= 22.5) && (angle < 67.5)) { return 45; } 
    // Round to North pixel
  	else if ((angle >= 67.5) && (angle < 112.5)) { return 90; } 
    // Round to North West pixel
  	else if ((angle >= 112.5) && (angle < 157.5)) { return 135; } 
    // Round to west pixel
  	else if ((angle >= 157.5) && (angle < 202.5)) { return 0; } 
    // Round to South West pixel
  	else if ((angle >=202.5) && (angle < 247.5)) { return 45; } 
    // Round to South pixel
  	else if ((angle >=247.5) && (angle < 292.5)) { return 90; } 
    // Round to South East pixel
  	else if ((angle >= 292.5) && (angle < 337.5)) { return 135; }
    return 0; // default value
  }

  /**
   * Hysteresis Thresholding helper function
   * @param ImageData - raw image data to process
   * @param x (number) - x value to start from - of strong edge
   * @param y (number) - y value to start from - of strong edge
   * @param upper (number) - upper threshold
   * @param lower (number) - lower threshold
   */
  static thresholding(img: ImageData, x: number, y: number, upper: number, lower: number): void{
    // start from immediate neighboring pixels
    for(let i = y-1; i < y + 1; i++){
      for(let j = x - 1; j < x + 1; j++){
        // Make sure to stay within bounds
        if(i >= 0 && j >= 0 && i < img.height && j < img.width){
          let index = (i*img.width + j)*4;
          // if pixel is within lower and upper thresholds - is connected to strong edge
          if(img.data[index] >= lower && img.data[index] <= upper){
            img.data[index] = 255;
            img.data[++index] = 255;
            img.data[++index] = 255;
            img.data[++index] = 255;
            this.thresholding(img, j, i, upper ,lower); // recursive call - check other surrounding pixels
          }
        }
      }
    }
  }

  /**
   * Apply Hysteresis Thresholding
   * @param ImageData - raw image data to process
   * @param lowerThreshold (number) - lower threshold
   * @param upperThreshold (number) - upper threshold
   * @return ImageData - brightness adjusted image
   */
  static hysteresis(img: ImageData, lowerThreshold: number, upperThreshold: number): void{
    // Pre-processing: find all string and weak edges
    for(let y = 0; y < img.height; y++){
      for(let x = 0; x < img.width; x++){
        let index = (y*img.width + x)*4;
        // greater than upper threshold - mark as strong edge
        if(img.data[index] > upperThreshold){
          img.data[index] = 255;
          img.data[++index] = 255;
          img.data[++index] = 255;
        } 
        // Lower than lower threshold - mark as not an edge
        else if(img.data[index] < lowerThreshold){
          img.data[index] = 0;
          img.data[++index] = 0;
          img.data[++index] = 0;
        } 
      }
    }
    // Threshold to handle edges in-between upper and lower threshold
    for(let y = 0; y < img.height; y++){
      for(let x = 0; x < img.width; x++){
        let index = (y*img.width + x)*4;
        let isStrong: boolean = false;
        // If edge is in-between weak and strong
        if(img.data[index] >= lowerThreshold && img.data[index] <= upperThreshold){
          // Check neighboring pixels to see if current pixel is connected to a strong one
          for(let h = y - 1; h < y + 1; h++){
            for(let i = x - 1; i < x + 1; i++){
              // Check that pixel is within bounds
              if(h >= 0 && i >= 0 && h < img.height && i < img.width){
                let index2 = (h*img.width + i)*4;
                // If one of the neighbor pixels is a strong edge - apply thresholding
                if(img.data[index2] >= upperThreshold){
                  isStrong = true;
                  this.thresholding(img, x, y, upperThreshold, lowerThreshold);
                }
              }
            }
          }
          if(!isStrong){
            img.data[index] = 0;
            img.data[++index] = 0;
            img.data[++index] = 0;
          }
        }
      }
    }
  }

  /**
   * Canny edge detection 
   * @param ImageData - raw image data to process
   * @param lower (number) - lower threshold
   * @param topThreshold (number) - upper threshold
   * @return ImageData - edges of image
   */
  static canny(img: ImageData, lower: number = 0.40, topThreshold: number = 0.50): ImageData{
    let gray = this.grayscale(img); // Get intensity/Grayscale
    let blurred = this.blur(gray, 5, 2);  // blur image
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
        // Calculate magnitude
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
    let outImage = new ImageData(output, Gx.width); // image to return
    this.hysteresis(outImage, lower*topThreshold*max, topThreshold*max); // apply hysteresis thresholding
    // Return edges
    return outImage;
  }
}

export default ImageToolKit;
