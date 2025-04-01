import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Rect } from 'fabric';
import IconFactory from '../icons/IconFactory';
import { useProject } from '../../context/ProjectContext';
import './Canvas.css';

const Canvas = ({ selectedTool, onSelectObject }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const { currentProject, addNode } = useProject();
  
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
      if (e.selected && e.selected.length > 0) {
        onSelectObject(e.selected[0]);
      }
    });

    fabricCanvasRef.current.on('selection:updated', (e) => {
      if (e.selected && e.selected.length > 0) {
        onSelectObject(e.selected[0]);
      }
    });

    fabricCanvasRef.current.on('selection:cleared', () => {
      onSelectObject(null);
    });

    // Funzione di pulizia
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      fabricCanvasRef.current.dispose();
    };
  }, [onSelectObject]);

  // Gestisce il drag over sul canvas
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Gestisce il drop sul canvas
  const handleDrop = async (e) => {
    e.preventDefault();
    
    // Se non c'è un progetto selezionato, mostra un messaggio di errore
    if (!currentProject) {
      alert('Seleziona o crea un progetto prima di aggiungere elementi');
      return;
    }
    
    // Recupera il tipo di strumento trascinato
    const toolType = e.dataTransfer.getData('toolType');
    
    // Calcola la posizione del drop considerando lo scroll e l'offset del canvas
    const canvasEl = fabricCanvasRef.current.getElement();
    const rect = canvasEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Dati di base per ogni tipo di nodo
    const baseNodeData = {
      name: toolType.charAt(0).toUpperCase() + toolType.slice(1),
      cycleTime: 0,
      piecesPerHour: 0,
      operators: 0,
      rejectRate: 0
    };
    
    // Crea l'oggetto appropriato in base al tipo di strumento
    let fabricObject = null;
    let nodeData = { ...baseNodeData };
    
    switch (toolType) {
      case 'machine':
        nodeData = {
          ...nodeData,
          throughputTime: 0,
          supplier: 'interno',
          hourlyCost: 0,
          availability: 100
        };
        fabricObject = IconFactory.createMachine(fabricCanvasRef.current, x, y);
        console.log('Oggetto creato:', fabricObject);
        console.log('Canvas riferimento:', fabricCanvasRef.current);
        break;
        
      case 'transport':
        nodeData = {
          ...nodeData,
          transportType: 'manuale',
          throughputTime: 0,
          distance: 0,
          minBatch: 1
        };
        fabricObject = IconFactory.createTransport(fabricCanvasRef.current, x, y);
        break;
        
      case 'storage':
        nodeData = {
          ...nodeData,
          capacity: 0,
          averageStayTime: 0,
          managementMethod: 'FIFO',
          storageCost: 0
        };
        fabricObject = IconFactory.createStorage(fabricCanvasRef.current, x, y);
        break;
        
      case 'connection':
        // La connessione verrà implementata successivamente
        console.log('Connessione selezionata, seleziona due nodi da collegare');
        return;
        
      default:
        console.log('Tipo di strumento non riconosciuto:', toolType);
        return;
    }
    
    // Prepara i dati per il salvataggio nel database
    const nodeForDb = {
      project_id: currentProject.id,
      node_type: toolType,
      name: nodeData.name,
      position_x: x,
      position_y: y,
      data: nodeData
    };
    
    try {
      // Salva il nodo nel database
      const savedNode = await addNode(nodeForDb);
      
      // Se il salvataggio ha successo, associa l'ID del database all'oggetto fabric
      if (savedNode && fabricObject) {
        fabricObject.set('dbId', savedNode.id);
        fabricCanvasRef.current.renderAll();
      }
      
      // Seleziona l'oggetto appena creato per mostrarne le proprietà
      fabricCanvasRef.current.setActiveObject(fabricObject);
      onSelectObject(fabricObject);
    } catch (error) {
      console.error('Errore nel salvataggio del nodo:', error);
      alert('Errore nel salvataggio dell\'elemento. Riprova.');
    }
  };

  // Per mostrare visivamente all'utente che il canvas è pronto per il drag and drop
  const canvasContainerClass = "canvas-container" + (selectedTool ? " canvas-container-ready" : "");

  return (
    <div 
      className={canvasContainerClass}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      data-tool={selectedTool}
    >
      <canvas ref={canvasRef} id="canvas" />
      
      {/* Aggiungiamo un messaggio di aiuto visibile solo quando non c'è un progetto selezionato */}
      {!currentProject && (
        <div className="canvas-message">
          <p>Seleziona o crea un progetto dal menu File</p>
        </div>
      )}
    </div>
  );
};

export default Canvas;