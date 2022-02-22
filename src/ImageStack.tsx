import MyImage from './MyImage';

class ImageStack{
  Stack: MyImage[] = [];
  currentIndex: number = -1;
  size: number = 0;

  empty(): boolean {
    return this.size === 0;
  }

  clear(): void {
    this.Stack = [];
    this.currentIndex = -1;
    this.size = 0;
  }

  reset(): MyImage{
    if(!this.empty()){
      this.Stack = this.Stack.slice(0, 1);
      this.size = 1;
      this.currentIndex = 0;
    }
    return this.Stack[0];
  }

  hasPrevious(): boolean{
    return this.currentIndex !== 0;
  }

  previous(): MyImage{
    if(this.hasPrevious()){
      this.currentIndex--;
      return this.Stack[this.currentIndex];
    }
    return new MyImage("", undefined);
  }

  hasNext(): boolean{
    return this.currentIndex !== (this.size - 1);
  }

  next(): MyImage{
    if(this.hasNext()){
      this.currentIndex++;
      return this.Stack[this.currentIndex];
    }
    return new MyImage("", undefined);
  }

  current(): MyImage{
    if(!this.empty()){
      return this.Stack[this.currentIndex];
    }
    return new MyImage("", undefined);
  }

  top(): MyImage{
    if(!this.empty()){
      return this.Stack[this.size - 1];
    }
    return new MyImage("", undefined);
  }

  add(image: ImageData, name: string): void{
    this.Stack = this.Stack.slice(0, this.currentIndex + 1);
    this.Stack.push(new MyImage(name, image));
    this.size = this.Stack.length;
    this.currentIndex++;
  }
}

export default ImageStack;
