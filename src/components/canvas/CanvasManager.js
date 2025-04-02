import React, { useEffect, useRef, useState } from 'react';
import { Canvas, Rect } from 'fabric';
import { createMachine } from '../icons/Machine';
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

  // Enhanced diagnostics function
  const performCanvasDiagnostics = (fabricCanvas) => {
    if (!fabricCanvas) {
      console.error('DIAGNOSTIC: No canvas object');
      return;
    }

    console.group('🔍 Canvas Diagnostics');
    try {
      console.log('Canvas Element:', canvasEl.current);
      console.log('Canvas Dimensions:', {
        width: fabricCanvas.getWidth(),
        height: fabricCanvas.getHeight(),
        clientWidth: canvasEl.current?.clientWidth,
        clientHeight: canvasEl.current?.clientHeight,
        windowInnerWidth: window.innerWidth,
        windowInnerHeight: window.innerHeight
      });

      // Visibility and rendering checks
      const canvasContainer = canvasEl.current?.parentElement;
      console.log('Canvas Container Styles:', {
        display: canvasContainer?.style.display,
        visibility: canvasContainer?.style.visibility,
        opacity: canvasContainer?.style.opacity
      });

      // Check existing objects
      const objects = fabricCanvas.getObjects();
      console.log('Existing Canvas Objects:', objects.length);
      objects.forEach((obj, index) => {
        console.log(`Object ${index}:`, {
          type: obj.type,
          left: obj.left,
          top: obj.top,
          width: obj.width,
          height: obj.height
        });
      });
    } catch (error) {
      console.error('DIAGNOSTIC Error:', error);
    }
    console.groupEnd();
  };

  useEffect(() => {
    if (canvasEl.current && !canvas) {
      console.log('🚀 Initializing Canvas');
      
      try {
        const fabricCanvas = new Canvas(canvasEl.current, {
          width: window.innerWidth - 400,
          height: window.innerHeight - 60,
          backgroundColor: '#f5f5f5',
          selection: true,
          preserveObjectStacking: true,
          renderOnAddRemove: true
        });

        // Extensive logging for canvas creation
        console.log('Canvas Created:', {
          element: canvasEl.current,
          fabricCanvas: fabricCanvas
        });

        // Attach diagnostic listeners
        fabricCanvas.on('after:render', () => {
          console.log('🎨 Canvas Rendered');
          performCanvasDiagnostics(fabricCanvas);
        });

        setCanvas(fabricCanvas);
        setIsCanvasReady(true);

        // Initial diagnostics
        performCanvasDiagnostics(fabricCanvas);

        // Window resize handler
        const handleResize = () => {
          console.log('🖥️ Window Resized');
          fabricCanvas.setDimensions({
            width: window.innerWidth - 400,
            height: window.innerHeight - 60
          });
          fabricCanvas.renderAll();
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          fabricCanvas.dispose();
        };

      } catch (error) {
        console.error('❌ Canvas Initialization Error:', error);
      }
    }
  }, [canvasEl, canvas]);

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    
    console.log('DEBUG: Drop avvenuto');
    
    // Se non c'è un progetto selezionato o il canvas non è inizializzato, mostra un messaggio di errore
    if (!currentProject) {
      console.log('DEBUG: Progetto corrente non disponibile durante drop');
      alert('Seleziona o crea un progetto prima di aggiungere elementi');
      return;
    }
    
    // Verifica che il canvas sia inizializzato
    if (!canvas) {
      console.log('DEBUG: Canvas non inizializzato durante drop');
      alert('Il canvas non è ancora pronto. Attendi qualche istante e riprova.');
      return;
    }
    
    console.log('DEBUG: Drop con progetto corrente:', currentProject.name);
    
    // Recupera il tipo di strumento trascinato
    const toolType = e.dataTransfer.getData('toolType');
    if (!toolType) {
      console.error('DEBUG: Nessun tipo di strumento disponibile nel drop');
      return;
    }
    
    console.log('DEBUG: Tipo di strumento trascinato:', toolType);
    
    // Calcola la posizione del drop in modo sicuro
    try {
      // Calcola la posizione in base all'offset del canvas
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      console.log('DEBUG: Posizione drop calcolata:', { x, y });
      
      // Dati di base per ogni tipo di nodo
      const baseNodeData = {
        name: toolType.charAt(0).toUpperCase() + toolType.slice(1),
        cycleTime: 0,
        piecesPerHour: 0,
        operators: 0,
        rejectRate: 0
      };
      
      // Crea l'oggetto appropriato in base al tipo di strumento
      let nodeData = { ...baseNodeData };
      
      console.log('DEBUG: Creazione oggetto per tipo:', toolType);
      
      try {
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
            console.log('DEBUG: Connessione selezionata, da implementare');
            return;
          default:
            console.log('DEBUG: Tipo di strumento non riconosciuto');
            return;
        }
      } catch (createError) {
        console.error('DEBUG: Errore durante la creazione dell\'oggetto:', createError);
        alert('Errore durante la creazione dell\'elemento. Riprova.');
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
      
      console.log('DEBUG: Tentativo di salvataggio nel database');
      
      // Salva il nodo nel database
      try {
        const savedNode = await onNodeAdded(nodeForDb);
        
        // Se il salvataggio ha successo, aggiungi l'oggetto al canvas
        if (savedNode && savedNode.id) {
          console.log('DEBUG: Nodo salvato nel DB, ID:', savedNode.id);
          
          // Usa NodeFactory per creare l'oggetto visivo
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
      } catch (saveError) {
        console.error('DEBUG: Errore durante il salvataggio nel database:', saveError);
        alert('Errore nel salvataggio dell\'elemento. Riprova.');
      }
    } catch (error) {
      console.error('DEBUG: Errore globale durante il processo di drop:', error);
      alert('Si è verificato un errore. Riprova.');
    }
  };

  // Enhanced Test Button Handler
  const handleTestMachineIcon = () => {
    if (!canvas || !isCanvasReady) {
      console.error('❌ Canvas Not Ready for Machine Icon');
      return;
    }

    console.group('🏭 Machine Icon Test');
    try {
      // Force canvas visibility
      if (canvasEl.current) {
        canvasEl.current.style.border = '3px solid red';
        canvasEl.current.style.visibility = 'visible';
        canvasEl.current.style.opacity = '1';
      }

      // Create machine with detailed logging
      const machineIcon = createMachine(canvas, 200, 200);
      
      console.log('Machine Icon Created:', {
        icon: machineIcon,
        left: machineIcon?.left,
        top: machineIcon?.top,
        width: machineIcon?.width,
        height: machineIcon?.height
      });

      // Force rendering with maximum verbosity
      canvas.renderAll();
      
      // Perform diagnostics after rendering
      performCanvasDiagnostics(canvas);

    } catch (error) {
      console.error('❌ Machine Icon Creation Error:', error);
    }
    console.groupEnd();
  };

  // Synchronize nodes when project or nodes change
  useEffect(() => {
    if (!isCanvasReady || !canvas || !currentProject || !Array.isArray(nodes)) {
      console.log('Canvas not ready or invalid data for synchronization:', {
        isCanvasReady, 
        canvas: !!canvas, 
        currentProject: !!currentProject, 
        nodesArray: Array.isArray(nodes)
      });
      return;
    }
    
    console.log('Synchronizing nodes with canvas...', nodes.length);
    
    try {
      // Remove existing objects
      canvas.getObjects().slice().forEach(obj => canvas.remove(obj));
      
      // Add a slight delay for safety
      setTimeout(() => {
        // Add each node
        let successCount = 0;
        nodes.forEach(node => {
          try {
            const obj = NodeFactory.createNodeFromData(canvas, node);
            if (obj) successCount++;
          } catch (err) {
            console.error('Error creating node:', node, err);
          }
        });
        
        console.log(`Synchronized ${successCount}/${nodes.length} nodes`);
        canvas.renderAll();
      }, 100);
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
      <canvas 
        ref={canvasEl} 
        id="canvas" 
        style={{
          border: '3px solid green',
          visibility: 'visible',
          opacity: '1',
          pointerEvents: 'auto'
        }}
      />

      {!isCanvasReady && (
        <div className="canvas-loading">Initializing canvas...</div>
      )}

      {isCanvasReady && !currentProject && (
        <div className="canvas-message">
          <p>Select or create a project from the File menu</p>
        </div>
      )}

      <button 
        className="test-button" 
        onClick={handleTestMachineIcon}
        style={{
          position: 'absolute', 
          bottom: '20px', 
          left: '20px',
          zIndex: 1000
        }}
      >
        Test Machine Icon
      </button>
    </div>
  );
};

export default CanvasManager;