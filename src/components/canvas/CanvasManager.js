import React, { useEffect, useRef, useState } from 'react';
import { Canvas, Rect } from 'fabric';
import { createMachine } from '../icons/Machine'; // Aggiungi questa importazione all'inizio del file
import './Canvas.css';
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

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    console.log('Handling drop event...');

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
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      console.log(`Dropped tool type: "${toolType}" at coordinates: (${x}, ${y})`);

      // Creiamo i dati di base per il nodo
      const baseNodeData = {
        name: toolType.charAt(0).toUpperCase() + toolType.slice(1),
        cycleTime: 0,
        piecesPerHour: 0,
        operators: 0,
        rejectRate: 0
      };

      let nodeData = { ...baseNodeData };

      // Aggiungiamo i dati specifici per tipo
      switch (toolType) {
        case 'machine':
          nodeData = {
            ...nodeData,
            throughputTime: 0,
            supplier: 'interno',
            hourlyCost: 0,
            availability: 100
          };
          break;
        case 'transport':
          nodeData = {
            ...nodeData,
            transportType: 'manuale',
            throughputTime: 0,
            distance: 0,
            minBatch: 1
          };
          break;
        case 'storage':
          nodeData = {
            ...nodeData,
            capacity: 0,
            averageStayTime: 0,
            managementMethod: 'FIFO',
            storageCost: 0
          };
          break;
        case 'connection':
          console.log('Connessione selezionata, da implementare');
          return;
        default:
          console.error('Tipo di strumento non riconosciuto');
          return;
      }

      // Prepariamo i dati per il database
      const nodeForDb = {
        project_id: currentProject.id,
        node_type: toolType,
        name: nodeData.name,
        position_x: x,
        position_y: y,
        data: nodeData
      };

      // Salviamo il nodo nel database
      onNodeAdded(nodeForDb, (savedNode) => {
        if (savedNode && savedNode.id) {
          // Creiamo l'oggetto visual DOPO aver salvato nel database
          const fabricObject = NodeFactory.createNodeFromData(canvas, {
            ...savedNode,
            position_x: x,
            position_y: y
          });
          
          if (fabricObject) {
            canvas.renderAll();
            canvas.setActiveObject(fabricObject);
            onNodeSelected(fabricObject);
          } else {
            console.error('Failed to create visual representation for node:', savedNode);
          }
        }
      });
    } catch (error) {
      console.error('Error during drop handling:', error);
      alert('Si è verificato un errore durante l\'aggiunta dell\'elemento.');
    }
  };

  // Inizializzazione del canvas
  useEffect(() => {
    if (canvasEl.current && !canvas) {
      console.log('Inizializzazione canvas...');
      try {
        const fabricCanvas = new Canvas(canvasEl.current, {
          width: window.innerWidth - 400,
          height: window.innerHeight - 60,
          backgroundColor: '#f5f5f5',
          selection: true,
          preserveObjectStacking: true
        });

        // Registriamo gli event listener per la selezione
        fabricCanvas.on('selection:created', (e) => {
          console.log('Selection created:', e.selected);
          if (e.selected && e.selected.length > 0) {
            onNodeSelected(e.selected[0]);
          }
        });

        fabricCanvas.on('selection:updated', (e) => {
          console.log('Selection updated:', e.selected);
          if (e.selected && e.selected.length > 0) {
            onNodeSelected(e.selected[0]);
          }
        });

        fabricCanvas.on('selection:cleared', () => {
          console.log('Selection cleared');
          onNodeSelected(null);
        });

        // Gestiamo il ridimensionamento della finestra
        const handleResize = () => {
          fabricCanvas.setDimensions({
            width: window.innerWidth - 400,
            height: window.innerHeight - 60
          });
          fabricCanvas.renderAll();
        };

        window.addEventListener('resize', handleResize);

        // Imposta il canvas e segna che è pronto
        setCanvas(fabricCanvas);
        setIsCanvasReady(true);
        console.log('Canvas inizializzato con successo!');

        return () => {
          window.removeEventListener('resize', handleResize);
          fabricCanvas.dispose();
        };
      } catch (error) {
        console.error('Errore durante l\'inizializzazione del canvas:', error);
      }
    }
  }, [canvasEl, canvas, onNodeSelected]);

useEffect(() => {
  if (canvasEl.current) {
    console.log('Canvas DOM element:', {
      width: canvasEl.current.width,
      height: canvasEl.current.height,
      offsetWidth: canvasEl.current.offsetWidth,
      offsetHeight: canvasEl.current.offsetHeight,
      style: canvasEl.current.style,
      clientRect: canvasEl.current.getBoundingClientRect()
    });
  }
}, [canvasEl]);


  // Sincronizzazione dei nodi
  useEffect(() => {
    if (!isCanvasReady || !canvas || !currentProject || !Array.isArray(nodes)) {
      console.log('Canvas non pronto o dati non validi per la sincronizzazione:', {
        isCanvasReady, 
        canvas: !!canvas, 
        currentProject: !!currentProject, 
        nodesArray: Array.isArray(nodes)
      });
      return;
    }
    
    console.log('Sincronizzazione nodi con canvas...', nodes.length);
    
    try {
      // Rimuoviamo gli oggetti esistenti
      canvas.getObjects().slice().forEach(obj => canvas.remove(obj));
      
      // Aggiungiamo un ritardo per sicurezza
      setTimeout(() => {
        // Aggiungiamo ogni nodo
        let successCount = 0;
        nodes.forEach(node => {
          try {
            const obj = NodeFactory.createNodeFromData(canvas, node);
            if (obj) successCount++;
          } catch (err) {
            console.error('Errore durante la creazione del nodo:', node, err);
          }
        });
        
        console.log(`Sincronizzati ${successCount}/${nodes.length} nodi`);
        canvas.renderAll();
      }, 100);
    } catch (error) {
      console.error('Errore durante la sincronizzazione dei nodi:', error);
    }
  }, [isCanvasReady, canvas, nodes, currentProject]);

 return (
  <div 
    className="canvas-container" 
    onDragOver={handleDragOver}
    onDrop={handleDrop}
  >
    <canvas 
      ref={canvasEl}
      id="canvas"
      style={{
        border: '3px solid red',
        visibility: 'visible !important',
        opacity: '1 !important',
        pointerEvents: 'auto !important'
      }}
    ></canvas>

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
        // Codice esistente del bottone di test
      }}
    >
      Test Canvas
    </button>

    {/* Nuovo bottone di test che disegna direttamente sul canvas */}
   <button 
  className="test-button" 
  style={{
    position: 'absolute',
    bottom: '50px',
    left: '20px',
    padding: '8px 16px',
    background: 'red',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    zIndex: 1000
  }}
  onClick={() => {
    if (canvas && isCanvasReady) {
      console.log('Test button clicked - creating machine icon');
      try {
        // Usa direttamente la funzione createMachine
        const machineIcon = createMachine(canvas, 200, 200);
        console.log('Created machine icon:', machineIcon);
        
        // Forza il rendering
        canvas.renderAll();
        
        // Prova a selezionare l'oggetto appena creato
        if (machineIcon) {
          canvas.setActiveObject(machineIcon);
          console.log('Machine icon selected');
        }
      } catch (error) {
        console.error('Error during machine icon creation:', error);
      }
    } else {
      console.error('Canvas not ready for machine icon test');
    }
  }}
>
  Test Machine Icon
</button>

  </div>
);
}; 

export default CanvasManager;