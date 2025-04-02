// FILE: CanvasManager.js
import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from 'fabric';
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

  const performCanvasDiagnostics = (fabricCanvas) => {
    console.group('🔍 Comprehensive Canvas Diagnostics');
    if (!fabricCanvas) {
      console.error('❌ No canvas object available');
      console.groupEnd();
      return;
    }
    try {
      console.log('Canvas DOM Element:', {
        element: canvasEl.current,
        clientWidth: canvasEl.current?.clientWidth,
        clientHeight: canvasEl.current?.clientHeight,
        offsetWidth: canvasEl.current?.offsetWidth,
        offsetHeight: canvasEl.current?.offsetHeight
      });
      console.log('Canvas Fabric Details:', {
        width: fabricCanvas.getWidth(),
        height: fabricCanvas.getHeight(),
        backgroundColor: fabricCanvas.backgroundColor
      });
      const container = canvasEl.current?.parentElement;
      console.log('Container Styles:', {
        display: container?.style.display,
        visibility: container?.style.visibility,
        opacity: container?.style.opacity,
        width: container?.style.width,
        height: container?.style.height
      });
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

  useEffect(() => {
    if (canvasEl.current && !canvas) {
      console.log('🚀 Initializing Canvas');
      try {
        const container = canvasEl.current.parentElement;
        const w = container.clientWidth || window.innerWidth - 400;
        const h = container.clientHeight || window.innerHeight - 60;

        const fabricCanvas = new Canvas(canvasEl.current, {
          width: w,
          height: h,
          backgroundColor: '#f5f5f5',
          selection: true,
          preserveObjectStacking: true,
          renderOnAddRemove: true
        });

        setCanvas(fabricCanvas);
        setIsCanvasReady(true);
        performCanvasDiagnostics(fabricCanvas);

        const handleResize = () => {
          const container = canvasEl.current.parentElement;
          const newWidth = container.clientWidth || window.innerWidth - 400;
          const newHeight = container.clientHeight || window.innerHeight - 60;
          fabricCanvas.setDimensions({ width: newWidth, height: newHeight });
          fabricCanvas.renderAll();
        };

        window.addEventListener('resize', handleResize);
        return () => {
          window.removeEventListener('resize', handleResize);
          fabricCanvas.dispose();
        };
      } catch (error) {
        console.error('❌ Canvas Initialization Error:', error);
        setIsCanvasReady(false);
      }
    }
  }, [canvasEl, canvas]);

  useEffect(() => {
    if (!isCanvasReady || !canvas || !currentProject || !Array.isArray(nodes)) {
      return;
    }

    canvas.getObjects().forEach(obj => canvas.remove(obj));

    let created = 0;
    nodes.forEach((node, index) => {
      const obj = NodeFactory.createNodeFromData(canvas, node);
      if (obj) {
        created++;
      }
    });
    canvas.renderAll();
    console.log(`✅ Synced ${created}/${nodes.length} nodes`);
  }, [isCanvasReady, canvas, nodes, currentProject]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    if (!currentProject || !canvas) return;

    const toolType = e.dataTransfer.getData('toolType');
    if (!toolType) return;

    const rect = canvasEl.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const baseNode = {
      name: toolType.charAt(0).toUpperCase() + toolType.slice(1),
      cycleTime: 0,
      piecesPerHour: 0,
      operators: 0,
      rejectRate: 0
    };

    let nodeData = { ...baseNode };
    switch (toolType) {
      case 'machine':
        nodeData = { ...nodeData, throughputTime: 0, supplier: 'interno', hourlyCost: 0, availability: 100 };
        break;
      case 'transport':
        nodeData = { ...nodeData, transportType: 'manuale', throughputTime: 0, distance: 0, minBatch: 1 };
        break;
      case 'storage':
        nodeData = { ...nodeData, capacity: 0, averageStayTime: 0, managementMethod: 'FIFO', storageCost: 0 };
        break;
      default:
        return;
    }

    const nodeForDb = {
      project_id: currentProject.id,
      node_type: toolType,
      name: nodeData.name,
      position_x: x,
      position_y: y,
      data: nodeData
    };

    try {
      const savedNode = await onNodeAdded(nodeForDb);
      const fabricObject = NodeFactory.createNodeFromData(canvas, {
        ...savedNode,
        position_x: x,
        position_y: y
      });
      if (fabricObject) {
        canvas.renderAll();
        canvas.setActiveObject(fabricObject);
        canvas.fire('selection:created', { selected: [fabricObject] });
      }
    } catch (err) {
      console.error('❌ Errore nel drop:', err);
    }
  };

  return (
    <div className="canvas-container" onDragOver={handleDragOver} onDrop={handleDrop}>
      <canvas ref={canvasEl} id="fabric-canvas" style={{ border: '2px solid #3aafa9' }} />
      {!isCanvasReady && <div className="canvas-loading">Inizializzazione del canvas...</div>}
      {isCanvasReady && !currentProject && (
        <div className="canvas-message">
          <p>Seleziona o crea un progetto dal menu File</p>
        </div>
      )}
    </div>
  );
};

export default CanvasManager;