import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import './App.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [transcripts, setTranscripts] = useState([]);

  const onDrop = (acceptedFiles) => {
    setSelectedFile(acceptedFiles[0]);
  };

  const handleConvert = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const response = await fetch('http://localhost:5000/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setTranscripts([...transcripts, data]);
        } else {
          console.error('API request failed');
        }
      } catch (error) {
        console.error('An error occurred:', error);
      }
    }
  };

    const handleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const reorderedTranscripts = Array.from(transcripts);
    const [movedItem] = reorderedTranscripts.splice(result.source.index, 1);
    reorderedTranscripts.splice(result.destination.index, 0, movedItem);

    setTranscripts(reorderedTranscripts);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="App">
      <h1>
        <img
          src={require('./SpeechtoText.png')} 
          alt="Speech to Text Conversion App"
          className="app-logo"
        />
        Speech to Text Conversion App
      </h1>
      <div className="container">
        <div {...getRootProps()} className="file-input">
          <input {...getInputProps()} accept=".wav" />
          <p>{selectedFile ? selectedFile.name : "Dosya sürükleyin veya tıklayın"}</p>
        </div>
        <button className="convert-button" onClick={handleConvert}>
          Convert
        </button>
        <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <ul
              className="transcript-list"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {transcripts.map((item, index) => (
                <Draggable
                  key={item.fileName}
                  draggableId={item.fileName}
                  index={index}
                >
                  {(provided) => (
                    <li
                      className="transcript-card"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      >
                        <h2>
                          <img
                            src={require('./icons8-wav-64.png')} // Dosya yolu düzeltildi
                            alt="Wave Icon"
                            className="wav-icon"
                          />
                          {item.fileName}
                        </h2>
                        <p><strong>Google Transcript:</strong> {item['Google Transcript']}</p>
                        <p><strong>Google Confidence:</strong> {item['Google Confidence']}</p>
                        <p><strong>Google Duration:</strong> {item['Google Duration']}</p>
                        <p><strong>Amazon Transcript:</strong> {item['Amazon Transcript']}</p>
                        <p><strong>Amazon Confidence:</strong> {item['Amazon Confidence']}</p>
                        <p><strong>Amazon Duration:</strong> {item['Amazon Duration']}</p>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}

export default App;