class MyImage{
  image: ImageData;
  name: string;
  
  constructor(name: string, img?: ImageData){
    if(img){
      this.image = new ImageData(new Uint8ClampedArray(img.data), img.width);
    }
    else{
      this.image = new ImageData(0, 0);
    }
    if(name){
      this.name = name;
    }
    else{
      this.name = "";
    }
  }

  setName(name: string): void{
    this.name = name;
  }

  setImage(img: ImageData): void{
    this.image = new ImageData(new Uint8ClampedArray(img.data), img.width);
  }

  getName(): string{
    return this.name;
  }

  getImage(): ImageData{
    return this.image;
  }

  getData(): Uint8ClampedArray{
    return this.image.data;
  }

  getWidth(): number{
    return this.image.width;
  }

  getHeight(): number{
    return this.image.height;
  }
}

export default MyImage;
