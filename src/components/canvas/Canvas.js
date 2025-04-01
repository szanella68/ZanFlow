import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Rect } from 'fabric';
import IconFactory from '../icons/IconFactory';
import './Canvas.css';

const Canvas = () => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [selectedObject, setSelectedObject] = useState(null);

  useEffect(() => {
    // Inizializza il canvas quando il componente viene montato
    fabricCanvasRef.current = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth - 400, // Sottraiamo lo spazio per i pannelli laterali
      height: window.innerHeight - 60, // Sottraiamo lo spazio per il menu in alto
      backgroundColor: '#f5f5f5',
      selection: true,
      preserveObjectStacking: true,
    });

    // Funzione per ridimensionare il canvas quando cambia la dimensione della finestra
    const resizeCanvas = () => {
      fabricCanvasRef.current.setDimensions({
        width: window.innerWidth - 400,
        height: window.innerHeight - 60,
      });
      fabricCanvasRef.current.renderAll();
    };

    // Aggiungi l'event listener per il ridimensionamento
    window.addEventListener('resize', resizeCanvas);

    // Gestisce la selezione di oggetti nel canvas
    fabricCanvasRef.current.on('selection:created', (e) => {
      setSelectedObject(e.selected[0]);
    });

    fabricCanvasRef.current.on('selection:updated', (e) => {
      setSelectedObject(e.selected[0]);
    });

    fabricCanvasRef.current.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    // Funzione di pulizia
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      fabricCanvasRef.current.dispose();
    };
  }, []);

  // Funzione per aggiungere un rettangolo (esempio)
  const addRectangle = () => {
    const rect = new Rect({
      left: 100,
      top: 100,
      fill: '#deeaee',
      width: 100,
      height: 50,
      stroke: '#2b7a78',
      strokeWidth: 2,
    });
    fabricCanvasRef.current.add(rect);
  };

  // Gestisce il drag over sul canvas
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Gestisce il drop sul canvas
  const handleDrop = (e) => {
    e.preventDefault();
    
    // Recupera il tipo di strumento trascinato
    const toolType = e.dataTransfer.getData('toolType');
    
    // Calcola la posizione del drop considerando lo scroll e l'offset del canvas
    const canvasEl = fabricCanvasRef.current.getElement();
    const rect = canvasEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Crea l'oggetto appropriato in base al tipo di strumento
    // Nella funzione handleDrop, modifica lo switch per gestire anche i nuovi tipi:
// Nella funzione handleDrop:
switch (toolType) {
  case 'machine':
    IconFactory.createMachine(fabricCanvasRef.current, x, y);
    break;
  case 'transport':
    IconFactory.createTransport(fabricCanvasRef.current, x, y);
    break;
  case 'storage':
    IconFactory.createStorage(fabricCanvasRef.current, x, y);
    break;
  case 'connection':
    // La connessione verrà implementata successivamente
    console.log('Connessione selezionata, seleziona due nodi da collegare');
    break;
  default:
    console.log('Tipo di strumento non riconosciuto:', toolType);
}
  };

  return (
    <div 
      className="canvas-container"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <canvas ref={canvasRef} id="canvas" />
      <button onClick={addRectangle} className="test-button">Add Rectangle</button>
    </div>
  );
};

export default Canvas;