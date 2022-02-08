import React from 'react';
import './App.css';

// put all necessary body elements onto page
class Body extends React.Component{
  fileProcess(){
    let selectBox = document.getElementById("file") as HTMLSelectElement;
    let selectedValue:string = selectBox.options[selectBox.selectedIndex].value;

    alert(selectedValue);
  }

  imageProcess(){
    let selectBox = document.getElementById("toolkit") as HTMLSelectElement;
    let selectedValue:string = selectBox.options[selectBox.selectedIndex].value;
    alert(selectedValue);
  }

  render() {
    return (
      <table>
        <thead>
          <tr>
            <th>File</th>
            <th>Image Processing Toolkit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <select id="file" onChange={() => this.fileProcess()}>
                <option value="">--File--</option>
                <option value="open">Open</option>
                <option value="save">Save</option>
                <option value="saveAs">Save As</option>
                <option value="close">Close</option>
              </select>
            </td>
            <td>
              <select id="toolkit" onChange={() => this.imageProcess()}>
                <option value="">--Image Processing Toolkit--</option>
                <option value="invert">Invert Image</option>
                <option value="grayscale">Grayscale</option>
                <option value="brightness">Adjust Brightness</option>
                <option value="edges">Find Edges</option>
                <option value="inpaint">Reconstruct Image</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
}

// put all necessary header elements onto webpage
class Header extends React.Component{
  render() {
    return (
      <header className="head">
        <h1>Image Processing Toolkit!</h1>
      </header>
    );
  }
}

function App() {
  return (
    <div className="App-page">
      <div className="App-head">
        <Header />
      </div>
      <div className="App-body">
        <Body />
      </div>
    </div>
  );
}

export default App;
