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

  // Comprehensive canvas diagnostics
  const performCanvasDiagnostics = (fabricCanvas) => {
    console.group('🔍 Comprehensive Canvas Diagnostics');
    
    if (!fabricCanvas) {
      console.error('❌ No canvas object available');
      console.groupEnd();
      return;
    }

    try {
      // Canvas element details
      console.log('Canvas DOM Element:', {
        element: canvasEl.current,
        clientWidth: canvasEl.current?.clientWidth,
        clientHeight: canvasEl.current?.clientHeight,
        offsetWidth: canvasEl.current?.offsetWidth,
        offsetHeight: canvasEl.current?.offsetHeight
      });

      // Canvas fabric details
      console.log('Canvas Fabric Details:', {
        width: fabricCanvas.getWidth(),
        height: fabricCanvas.getHeight(),
        backgroundColor: fabricCanvas.backgroundColor
      });

      // Container visibility
      const container = canvasEl.current?.parentElement;
      console.log('Container Styles:', {
        display: container?.style.display,
        visibility: container?.style.visibility,
        opacity: container?.style.opacity,
        width: container?.style.width,
        height: container?.style.height
      });

      // Object analysis
      const objects = fabricCanvas.getObjects();
      console.log(`Canvas Objects (${objects.length}):`, 
        objects.map((obj, index) => ({
          index,
          type: obj.type,
          objectType: obj.objectType,
          left: obj.left,
          top: obj.top,
          width: obj.width,
          height: obj.height
        }))
      );

    } catch (error) {
      console.error('❌ Diagnostic Error:', error);
    }
    
    console.groupEnd();
  };

  // Canvas initialization effect
  useEffect(() => {
    if (canvasEl.current && !canvas) {
      console.log('🚀 Initializing Canvas');
      
      try {
        // Calculate dimensions dynamically
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const canvasWidth = windowWidth - 400;
        const canvasHeight = windowHeight - 60;

        const fabricCanvas = new Canvas(canvasEl.current, {
          width: canvasWidth,
          height: canvasHeight,
          backgroundColor: '#f5f5f5',
          selection: true,
          preserveObjectStacking: true,
          renderOnAddRemove: true
        });

        // Extensive logging
        console.log('Canvas Creation Details:', {
          windowDimensions: { width: windowWidth, height: windowHeight },
          canvasDimensions: { width: canvasWidth, height: canvasHeight }
        });

        // Event listeners for diagnostics and interactions
        fabricCanvas.on('after:render', () => {
          console.log('🎨 Canvas Rendered');
          performCanvasDiagnostics(fabricCanvas);
        });

        // Object selection handling
        fabricCanvas.on('selection:created', (e) => {
          console.log('Object Selected:', e.selected?.[0]);
          if (e.selected && e.selected.length > 0) {
            onNodeSelected(e.selected[0]);
          }
        });

        fabricCanvas.on('selection:updated', (e) => {
          console.log('Object Updated:', e.selected?.[0]);
          if (e.selected && e.selected.length > 0) {
            onNodeSelected(e.selected[0]);
          }
        });

        fabricCanvas.on('selection:cleared', () => {
          console.log('Selection Cleared');
          onNodeSelected(null);
        });

        // Set canvas state
        setCanvas(fabricCanvas);
        setIsCanvasReady(true);

        // Initial diagnostics
        performCanvasDiagnostics(fabricCanvas);

        // Resize handler
        const handleResize = () => {
          const newWidth = window.innerWidth - 400;
          const newHeight = window.innerHeight - 60;
          
          console.log('🖥️ Window Resized', { 
            width: newWidth, 
            height: newHeight 
          });

          fabricCanvas.setDimensions({
            width: newWidth,
            height: newHeight
          });
          fabricCanvas.renderAll();
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
          window.removeEventListener('resize', handleResize);
          fabricCanvas.dispose();
        };

      } catch (error) {
        console.error('❌ Canvas Initialization Error:', error);
        setIsCanvasReady(false);
      }
    }
  }, [canvasEl, canvas, onNodeSelected]);

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    
    console.log('🖱️ Drop Event', {
      currentProject: currentProject?.name,
      canvasReady: isCanvasReady
    });
    
    if (!currentProject) {
      alert('Seleziona o crea un progetto prima di aggiungere elementi');
      return;
    }
    
    if (!canvas) {
      alert('Canvas non ancora pronto');
      return;
    }
    
    const toolType = e.dataTransfer.getData('toolType');
    if (!toolType) {
      console.error('❌ Nessun tipo di strumento identificato');
      return;
    }

    try {
      // Calculate drop position
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      console.log('📍 Drop Position', { x, y });

      // Base node data
      const baseNodeData = {
        name: toolType.charAt(0).toUpperCase() + toolType.slice(1),
        cycleTime: 0,
        piecesPerHour: 0,
        operators: 0,
        rejectRate: 0
      };

      let nodeData = { ...baseNodeData };

      // Specific node type data
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
        default:
          console.error('❌ Tipo di strumento non supportato:', toolType);
          return;
      }

      // Prepare database node data
      const nodeForDb = {
        project_id: currentProject.id,
        node_type: toolType,
        name: nodeData.name,
        position_x: x,
        position_y: y,
        data: nodeData
      };

      // Save node to database
      const savedNode = await onNodeAdded(nodeForDb);
      
      if (savedNode && savedNode.id) {
        // Create visual representation
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
          console.error('❌ Creazione oggetto visivo fallita');
        }
      }

    } catch (error) {
      console.error('❌ Errore durante il drop:', error);
      alert('Si è verificato un errore. Riprova.');
    }
  };

  // Test icon creation method
  const handleTestMachineIcon = () => {
    if (!canvas || !isCanvasReady) {
      console.error('❌ Canvas non pronto per la creazione');
      return;
    }

    console.group('🏭 Test Machine Icon');
    try {
      // Force canvas visibility
      if (canvasEl.current) {
        const container = canvasEl.current.parentElement;
        if (container) {
          container.style.width = '100%';
          container.style.height = '100%';
          container.style.visibility = 'visible';
        }

        // Reset canvas dimensions
        canvas.setWidth(window.innerWidth - 400);
        canvas.setHeight(window.innerHeight - 60);
      }

      // Create machine icon
      const machineIcon = createMachine(canvas, 200, 200);
      
      console.log('Machine Icon Details:', {
        icon: machineIcon,
        left: machineIcon?.left,
        top: machineIcon?.top,
        width: machineIcon?.width,
        height: machineIcon?.height
      });

      // Force rendering
      canvas.renderAll();
      
      // Diagnostics
      performCanvasDiagnostics(canvas);

    } catch (error) {
      console.error('❌ Errore creazione icona macchina:', error);
    }
    console.groupEnd();
  };

  // Node synchronization effect
  useEffect(() => {
    if (!isCanvasReady || !canvas || !currentProject || !Array.isArray(nodes)) {
      console.log('❌ Sincronizzazione nodi non possibile', {
        canvasReady: isCanvasReady,
        canvasExists: !!canvas,
        projectSelected: !!currentProject,
        nodesValid: Array.isArray(nodes)
      });
      return;
    }
    
    console.log(`🔄 Sincronizzazione ${nodes.length} nodi`);
    
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
            console.error('❌ Errore creazione nodo:', node, err);
          }
        });
        
        console.log(`✅ Sincronizzati ${successCount}/${nodes.length} nodi`);
        canvas.renderAll();
      }, 100);
    } catch (error) {
      console.error('❌ Errore sincronizzazione nodi:', error);
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
        <div className="canvas-loading">Inizializzazione del canvas...</div>
      )}

      {isCanvasReady && !currentProject && (
        <div className="canvas-message">
          <p>Seleziona o crea un progetto dal menu File</p>
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