import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric'; // Importazione corretta di fabric.js
import './Canvas.css'; // Riutilizziamo lo stile esistente
import { createMachine } from '../icons/Machine';
import createTransport from '../icons/Transport';
import createStorage from '../icons/Storage';
import NodeFactory from '../icons/NodeFactory';

const CanvasManager = ({ 
  currentProject, 
  nodes, 
  onNodeAdded, 
  onNodeSelected, 
  onNodeUpdated 
}) => {
  const canvasEl = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  
  // Inizializzazione del canvas
  useEffect(() => {
    if (canvasEl.current && !canvas) {
      try {
        console.log('Inizializzazione canvas in CanvasManager...');
        
        // Usa fabric.Canvas invece di una importazione diretta
        const fabricCanvas = new fabric.Canvas(canvasEl.current, {
          width: window.innerWidth - 400,
          height: window.innerHeight - 60,
          backgroundColor: '#f5f5f5',
          selection: true,
          preserveObjectStacking: true
        });
        
        setCanvas(fabricCanvas);
        
        // Gestione del ridimensionamento
        const handleResize = () => {
          if (fabricCanvas) {
            fabricCanvas.setDimensions({
              width: window.innerWidth - 400,
              height: window.innerHeight - 60
            });
            fabricCanvas.renderAll();
          }
        };
        
        window.addEventListener('resize', handleResize);
        
        // Gestione delle selezioni
        fabricCanvas.on('selection:created', (e) => {
          if (e.selected && e.selected.length > 0) {
            onNodeSelected(e.selected[0]);
          }
        });
        
        fabricCanvas.on('selection:updated', (e) => {
          if (e.selected && e.selected.length > 0) {
            onNodeSelected(e.selected[0]);
          }
        });
        
        fabricCanvas.on('selection:cleared', () => {
          onNodeSelected(null);
        });
        
        console.log('Canvas inizializzato con successo');
        
        // Pulizia
        return () => {
          window.removeEventListener('resize', handleResize);
          fabricCanvas.dispose();
        };
      } catch (error) {
        console.error('Errore durante l\'inizializzazione del canvas:', error);
      }
    }
  }, [canvas, onNodeSelected]);
  
  // Effetto per segnalare che il canvas è pronto
  useEffect(() => {
    if (canvas) {
      setIsCanvasReady(true);
      console.log('Canvas segnalato come pronto');
    }
  }, [canvas]);
  
  // Effetto per sincronizzare i nodi dal database col canvas
  useEffect(() => {
    if (!isCanvasReady || !canvas || !Array.isArray(nodes) || !currentProject) {
      return;
    }
    
    console.log(`Sincronizzazione di ${nodes.length} nodi sul canvas`);
    
    try {
      // Pulisci il canvas
      canvas.clear();
      
      // Aggiungi tutti i nodi
      nodes.forEach(node => {
        NodeFactory.createNodeFromData(canvas, node);
      });
      
      canvas.renderAll();
      console.log('Nodi sincronizzati sul canvas');
    } catch (error) {
      console.error('Errore durante la sincronizzazione dei nodi:', error);
    }
  }, [isCanvasReady, canvas, nodes, currentProject]);
  
  // Funzioni di drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    
    if (!currentProject || !isCanvasReady || !canvas) {
      alert('Seleziona o crea un progetto prima di aggiungere elementi');
      return;
    }
    
    const toolType = e.dataTransfer.getData('toolType');
    if (!toolType) {
      console.error('Nessun tipo di strumento disponibile nel drop');
      return;
    }
    
    try {
      // Calcola posizione in modo sicuro
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Crea l'oggetto base
      let fabricObject;
      const baseNodeData = {
        name: toolType.charAt(0).toUpperCase() + toolType.slice(1),
        cycleTime: 0,
        piecesPerHour: 0,
        operators: 0,
        rejectRate: 0
      };
      
      // Aggiungi proprietà specifiche per tipo
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
          fabricObject = createMachine(canvas, x, y);
          break;
        case 'transport':
          nodeData = {
            ...nodeData,
            transportType: 'manuale',
            throughputTime: 0,
            distance: 0,
            minBatch: 1
          };
          fabricObject = createTransport(canvas, x, y);
          break;
        case 'storage':
          nodeData = {
            ...nodeData,
            capacity: 0,
            averageStayTime: 0,
            managementMethod: 'FIFO',
            storageCost: 0
          };
          fabricObject = createStorage(canvas, x, y);
          break;
        case 'connection':
          // La connessione verrà implementata successivamente
          console.log('Connessione selezionata, da implementare');
          return;
        default:
          console.error('Tipo di strumento non riconosciuto');
          return;
      }
      
      if (fabricObject) {
        // Prepara i dati per il salvataggio
        const nodeForDb = {
          project_id: currentProject.id,
          node_type: toolType,
          name: nodeData.name,
          position_x: x,
          position_y: y,
          data: nodeData
        };
        
        // Notifica il contesto del progetto
        onNodeAdded(nodeForDb, (savedNode) => {
          if (savedNode && savedNode.id) {
            fabricObject.set('dbId', savedNode.id);
            canvas.renderAll();
            
            // Seleziona l'oggetto appena creato
            canvas.setActiveObject(fabricObject);
            onNodeSelected(fabricObject);
          }
        });
      }
    } catch (error) {
      console.error('Errore durante il drop:', error);
      alert('Si è verificato un errore durante l\'aggiunta dell\'elemento.');
    }
  };
  
  return (
    <div 
      className="canvas-container" 
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <canvas ref={canvasEl}></canvas>
      
      {!isCanvasReady && (
        <div className="canvas-loading">Inizializzazione del canvas...</div>
      )}
      
      {isCanvasReady && !currentProject && (
        <div className="canvas-message">
          <p>Seleziona o crea un progetto dal menu File</p>
        </div>
      )}
      
      <button 
        className="test-button" 
        onClick={() => {
          if (canvas) {
            try {
              const rect = new fabric.Rect({
                left: 100,
                top: 100,
                width: 50,
                height: 50,
                fill: 'red'
              });
              canvas.add(rect);
              canvas.renderAll();
              console.log('Test canvas completato con successo');
            } catch (error) {
              console.error('Errore durante il test del canvas:', error);
            }
          } else {
            console.error('Canvas non disponibile per il test');
          }
        }}
      >
        Test Canvas
      </button>
    </div>
  );
};

export default CanvasManager;