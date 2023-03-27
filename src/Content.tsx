import React, { useState } from "react";
import reactLogo from "./assets/react.svg";
import testImg from "./assets/test.png";
import { invoke } from "@tauri-apps/api/tauri";
import "./Content.css";
import { listen } from '@tauri-apps/api/event'
import { tauri } from "@tauri-apps/api";

function App() {

  let testChunkArray = [
    {
      name: "TEXT",
      text: "some cool text"
    },
    {
      name: "TEXT222",
      text: "another cool text"
    }
  ]

  const [chunkArray, setChunkArray] = useState(testChunkArray)

  let chunkElements = chunkArray.map((item, index) => {
    return (
      <div className="chunk" key={index.toString()}>
        <div className="chunk_header">
          <div className="chunk_name" onDoubleClick={(e) => spawnInput(e.currentTarget, index)}>{item.name}</div>
          <a className="delete_chunk_button button" onClick={() => deleteChunk(index)}>Delete</a>
        </div>
        <p className="chunk_text" onDoubleClick={(e) => spawnInput(e.currentTarget, index)}>{item.text}</p>
      </div>
    )
  })

  function autoGrow(element: HTMLElement) {
    element.style.height = "auto";
    element.style.height = (element.scrollHeight) + "px";
  }
  function spawnInput(element: HTMLElement, index: number) {
    let val: string = element.textContent as string;
    var input = document.createElement("textarea");
    input.setAttribute("class", "editable_textarea");

    input.oninput = function () {
      autoGrow(input)
    }

    input.value = val;
    input.onblur = function () {
      var val = input.value;
      element.textContent = val;

      let list = [...chunkArray];
      var listElement = list[index];

      if (element.tagName == 'DIV') {

        listElement["name"] = input.value;
      }
      else {
        listElement["text"] = input.value;
      }

      setChunkArray(list);
    }
    element.innerHTML = "";
    element.appendChild(input);
    input.focus();

    input.style.height = (input.scrollHeight) + "px";
  }

  function addChunk() {
    setChunkArray([...chunkArray, { name: "New Chunk", text: "" }]);
  }

  function deleteChunk(index: number) {
    let list = [...chunkArray];
    list.splice(index, 1);
    setChunkArray(list);
  }


  function dropHandler(ev: React.DragEvent<HTMLDivElement> , element:HTMLDivElement) {
    console.log("File(s) dropped");

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      [...ev.dataTransfer.items].forEach((item, i) => {
        // If dropped items aren't files, reject them
        if (item.kind === "file") {
          const file = item.getAsFile();
          console.log(`… file[${i}] = ${file?.name}`);
          element.innerText = `${file?.name}`;
        }
      });
    } else {
      // Use DataTransfer interface to access the file(s)
      [...ev.dataTransfer.files].forEach((file, i) => {
        console.log(`… file[${i}].name = ${file.name}`);
        element.innerText = `${file?.name}`;
      });
    }
  }

  function dragOverHandler(ev: React.DragEvent<HTMLDivElement>) {
    console.log("File(s) in drop zone");
    
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
  }

  listen('tauri://file-drop', event => { 
    var a = event.payload as Array<any>;
    var img = document.getElementById("preview") as HTMLImageElement;
    console.log(a[0]);
    let apiPath = tauri.convertFileSrc(a[0])
    console.log(apiPath);
    img.src = apiPath;
  })

  return (
    <div id="#container">
      <div id="image_container">
        <img id="preview" src={testImg} />
      </div>

      <div id="chunk_container">
        {chunkElements}
        <a id="add_chunk_button" className="button" onClick={addChunk}>+</a>
      </div>
      <div id="toolbar_container">
        <button className="toolbar_button">Test</button>
      </div>
    </div>
    // <div className="container">
    //   <h1>Welcome to Tauri!</h1>

    //   <div className="row">
    //     <a href="https://vitejs.dev" target="_blank">
    //       <img src="/vite.svg" className="logo vite" alt="Vite logo" />
    //     </a>
    //     <a href="https://tauri.app" target="_blank">
    //       <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
    //     </a>
    //     <a href="https://reactjs.org" target="_blank">
    //       <img src={reactLogo} className="logo react" alt="React logo" />
    //     </a>
    //   </div>

    //   <p>Click on the Tauri, Vite, and React logos to learn more.</p>

    //   <div className="row">
    //     <form
    //       onSubmit={(e) => {
    //         e.preventDefault();
    //         greet();
    //       }}
    //     >
    //       <input
    //         id="greet-input"
    //         onChange={(e) => setName(e.currentTarget.value)}
    //         placeholder="Enter a name..."
    //       />
    //       <button type="submit">Greet</button>
    //     </form>
    //   </div>
    //   <p>{greetMsg}</p>
    // </div>
  );
}

export default App;
