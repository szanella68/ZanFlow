// FILE: CanvasManager.js
import React, { useEffect, useRef, useState } from 'react';
import { Canvas, Rect, Shadow }  from 'fabric';

import './Canvas.css';
import NodeFactory from '../icons/NodeFactory';

const setupSelectionListeners = (fabricCanvas, onNodeSelected) => {
  fabricCanvas.off('selection:created');
  fabricCanvas.off('selection:updated');
  fabricCanvas.off('selection:cleared');

  fabricCanvas.on('selection:created', (e) => {
    const selected = e.selected?.[0];
    if (selected && typeof onNodeSelected === 'function') {
      onNodeSelected(selected);
      console.log('🎯 Nodo selezionato (created):', selected);
    }
  });

  fabricCanvas.on('selection:updated', (e) => {
    const selected = e.selected?.[0];
    if (selected && typeof onNodeSelected === 'function') {
      onNodeSelected(selected);
      console.log('🔄 Nodo selezionato (updated):', selected);
    }
  });

  fabricCanvas.on('selection:cleared', () => {
    if (typeof onNodeSelected === 'function') {
      onNodeSelected(null);
      console.log('🚫 Selezione annullata');
    }
  });
};

const CanvasManager = ({ 
  currentProject, 
  nodes, 
  onNodeAdded, 
  onNodeSelected, 
  onNodeUpdated 
}) => {
  const canvasEl = useRef(null);
  const canvasInstance = useRef(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  // Inizializzazione del canvas
  useEffect(() => {
    if (canvasEl.current && !canvasInstance.current) {
      console.log('🚀 Initializing Canvas');
      try {
        const container = canvasEl.current.parentElement;
        // Imposta dimensioni ragionevoli per il canvas
        const w = container.clientWidth || window.innerWidth - 400;
        const h = container.clientHeight || window.innerHeight - 60;

        console.log('Dimensioni canvas:', { w, h });

        const fabricCanvas = new Canvas(canvasEl.current, {
          width: w,
          height: h,
          backgroundColor: '#f5f5f5',
          selection: true,
          preserveObjectStacking: true,
          renderOnAddRemove: true
        });

        // Test: aggiungi un rettangolo per verificare che il canvas funzioni
        const rect = new Rect({
          left: 50,
          top: 50,
          width: 50,
          height: 50,
          fill: 'red',
          stroke: 'blue',
          strokeWidth: 2,
          shadow: new Shadow({
            color: 'rgba(0,0,0,0.3)',
            blur: 10,
            offsetX: 5,
            offsetY: 5
          })
        });
        fabricCanvas.add(rect);
        fabricCanvas.renderAll();

        canvasInstance.current = fabricCanvas;
        setIsCanvasReady(true);
        setupSelectionListeners(fabricCanvas, onNodeSelected);

        // Handler per il ridimensionamento
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
          canvasInstance.current = null;
        };
      } catch (error) {
        console.error('❌ Canvas Initialization Error:', error);
        setIsCanvasReady(false);
      }
    }
  }, [canvasEl, onNodeSelected]);

  // Sincronizzazione dei nodi quando cambiano
  useEffect(() => {
    if (!isCanvasReady || !canvasInstance.current || !currentProject) {
      return;
    }

    console.log('🔄 Syncing nodes:', nodes);
    
    // Rimuovi tutti gli oggetti esistenti
    canvasInstance.current.clear();
    
    if (!Array.isArray(nodes) || nodes.length === 0) {
      console.log('Nessun nodo da sincronizzare');
      canvasInstance.current.renderAll();
      return;
    }

    let created = 0;
    nodes.forEach((node) => {
      try {
        console.log('Creazione nodo:', node);
        const obj = NodeFactory.createNodeFromData(canvasInstance.current, node);
        if (obj) {
          created++;
        }
      } catch (err) {
        console.error('Errore creazione nodo:', err);
      }
    });

    console.log(`✅ Synced ${created}/${nodes.length} nodes`);
    canvasInstance.current.renderAll();
  }, [isCanvasReady, nodes, currentProject]);

  // Gestione del drag-and-drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    if (!currentProject || !canvasInstance.current) return;

    const toolType = e.dataTransfer.getData('toolType');
    if (!toolType) return;

    const rect = canvasEl.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log(`📌 Drop at x:${x}, y:${y} for type:${toolType}`);

    // Crea i dati base per il nuovo nodo
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

    // Crea un nuovo nodo
    const nodeForDb = {
      project_id: currentProject.id,
      node_type: toolType,
      name: nodeData.name,
      position_x: x,
      position_y: y,
      data: nodeData
    };

    try {
      // Test: crea un nodo direttamente nel canvas prima di chiamare l'API
      console.log('Creazione nodo temporaneo nel canvas');
      const tempNode = {
        node_type: toolType,
        name: nodeData.name,
        position_x: x,
        position_y: y,
        data: nodeData
      };
      
      const tempObj = NodeFactory.createNodeFromData(canvasInstance.current, tempNode);
      if (tempObj) {
        canvasInstance.current.renderAll();
        canvasInstance.current.setActiveObject(tempObj);
      }

      // Salva il nodo tramite API
      const savedNode = await onNodeAdded(nodeForDb);
      console.log('Nodo salvato:', savedNode);
      
      // Rimuovi l'oggetto temporaneo e crea quello definitivo
      if (tempObj) {
        canvasInstance.current.remove(tempObj);
      }
      
      const fabricObject = NodeFactory.createNodeFromData(canvasInstance.current, savedNode);
      if (fabricObject) {
        canvasInstance.current.renderAll();
        canvasInstance.current.setActiveObject(fabricObject);
      }
    } catch (err) {
      console.error('❌ Errore nel drop:', err);
    }
  };

  return (
    <div className="canvas-container" onDragOver={handleDragOver} onDrop={handleDrop}>
      <canvas ref={canvasEl} id="fabric-canvas" />
      {!isCanvasReady && <div className="canvas-loading">Inizializzazione del canvas...</div>}
      {isCanvasReady && !currentProject && (
        <div className="canvas-message">
          <p>Seleziona o crea un progetto dal menu File</p>
        </div>
      )}
      {isCanvasReady && currentProject && nodes && nodes.length === 0 && (
        <div className="canvas-message">
          <p>Trascina gli elementi dal pannello strumenti al canvas per iniziare</p>
        </div>
      )}
    </div>
  );
};

export default CanvasManager;