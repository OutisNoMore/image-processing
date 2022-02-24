import MyImage from './MyImage';

class ImageList{
  List: MyImage[] = [];
  currentIndex: number = -1;
  size: number = 0;

  empty(): boolean {
    console.log(!(this.size === 0));
    return this.size === 0;
  }

  clear(): void {
    this.List = [];
    this.currentIndex = -1;
    this.size = 0;
  }

  reset(): MyImage{
    if(!this.empty()){
      this.List = this.List.slice(0, 1);
      this.size = 1;
      this.currentIndex = 0;
    }
    return this.List[0];
  }

  hasPrevious(): boolean{
    return this.currentIndex !== 0;
  }

  previous(): MyImage{
    if(this.hasPrevious()){
      this.currentIndex--;
      return this.List[this.currentIndex];
    }
    return new MyImage("", undefined);
  }

  hasNext(): boolean{
    return this.currentIndex !== (this.size - 1);
  }

  next(): MyImage{
    if(this.hasNext()){
      this.currentIndex++;
      return this.List[this.currentIndex];
    }
    return new MyImage("", undefined);
  }

  current(): MyImage{
    if(!this.empty()){
      return this.List[this.currentIndex];
    }
    return new MyImage("", undefined);
  }

  top(): MyImage{
    if(!this.empty()){
      return this.List[this.size - 1];
    }
    return new MyImage("", undefined);
  }

  add(image: ImageData, name: string): void{
    this.List = this.List.slice(0, this.currentIndex + 1);
    this.List.push(new MyImage(name, image));
    this.size = this.List.length;
    this.currentIndex++;
  }
}

export default ImageList;
