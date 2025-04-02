import React, { useEffect, useRef, useState } from 'react';
import { Canvas, Rect } from 'fabric';
import './Canvas.css';
import { createMachine } from '../icons/Machine';
import createTransport from '../icons/Transport';
import { createStorage } from '../icons/Storage';
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

      let fabricObject;
      const baseNodeData = {
        name: toolType.charAt(0).toUpperCase() + toolType.slice(1),
        cycleTime: 0,
        piecesPerHour: 0,
        operators: 0,
        rejectRate: 0
      };

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
          console.log('Connessione selezionata, da implementare');
          return;
        default:
          console.error('Tipo di strumento non riconosciuto');
          return;
      }

      if (fabricObject) {
        console.log('Fabric object created successfully:', fabricObject);
        const nodeForDb = {
          project_id: currentProject.id,
          node_type: toolType,
          name: nodeData.name,
          position_x: x,
          position_y: y,
          data: nodeData
        };

        onNodeAdded(nodeForDb, (savedNode) => {
          if (savedNode && savedNode.id) {
            fabricObject.set('dbId', savedNode.id);
            canvas.renderAll();
            canvas.setActiveObject(fabricObject);
            onNodeSelected(fabricObject);
          }
        });
      } else {
        console.warn('Failed to create fabric object for tool type:', toolType);
      }
    } catch (error) {
      console.error('Error during drop handling:', error);
      alert('Si è verificato un errore durante l\'aggiunta dell\'elemento.');
    }
  };

  useEffect(() => {
    if (canvasEl.current && !canvas) {
      console.log('Initializing canvas...');
      try {
        const fabricCanvas = new Canvas(canvasEl.current, {
          width: window.innerWidth - 400,
          height: window.innerHeight - 60,
          backgroundColor: '#f5f5f5',
          selection: true,
          preserveObjectStacking: true
        });

        setCanvas(fabricCanvas);
        setIsCanvasReady(true);

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

        return () => {
          window.removeEventListener('resize', handleResize);
          fabricCanvas.dispose();
        };
      } catch (error) {
        console.error('Errore durante l\'inizializzazione del canvas:', error);
      }
    }
  }, [canvas, onNodeSelected]);

  useEffect(() => {
    if (!isCanvasReady || !canvas || !Array.isArray(nodes) || !currentProject) {
      console.warn('Canvas is not ready or invalid data for synchronization:', {
        isCanvasReady,
        canvas,
        nodes,
        currentProject
      });
      return;
    }
    
    try {
      console.log('Synchronizing nodes with canvas...', nodes);
      canvas.getObjects().forEach(obj => canvas.remove(obj));

      nodes.forEach(node => {
        NodeFactory.createNodeFromData(canvas, node);
      });

      canvas.renderAll();
      console.log('Canvas synchronization completed.');
    } catch (error) {
      console.error('Error during node synchronization:', error);
    }
  }, [isCanvasReady, canvas, nodes, currentProject]);

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
              const rect = new Rect({
                left: 100,
                top: 100,
                width: 50,
                height: 50,
                fill: 'red'
              });
              canvas.add(rect);
              canvas.renderAll();
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
