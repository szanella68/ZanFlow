import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import IconFactory from '../icons/IconFactory';
import { useProject } from '../../context/ProjectContext';
import './Canvas.css';

const Canvas = ({ selectedTool, onSelectObject }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const canvasInitializedRef = useRef(false);
  const { currentProject, addNode, setCanvasRef } = useProject();
  
  // Una sola inizializzazione del canvas quando il componente viene montato
  useEffect(() => {
    if (!canvasInitializedRef.current && canvasRef.current) {
      console.log('DEBUG: Inizializzazione canvas primaria');
      
      try {
        fabricCanvasRef.current = new FabricCanvas(canvasRef.current, {
          width: window.innerWidth - 400,
          height: window.innerHeight - 60,
          backgroundColor: '#f5f5f5',
          selection: true,
          preserveObjectStacking: true,
        });
        
        console.log('DEBUG: Canvas inizializzato con dimensioni:', { 
          width: window.innerWidth - 400, 
          height: window.innerHeight - 60 
        });
        
        canvasInitializedRef.current = true;
        
        // Registra il riferimento del canvas nel context solo dopo inizializzazione completa
        setTimeout(() => {
          if (setCanvasRef && fabricCanvasRef.current) {
            console.log('DEBUG: Registrazione canvas nel context');
            setCanvasRef(fabricCanvasRef.current);
          }
        }, 100);
        
        // Gestisce il ridimensionamento
        const resizeCanvas = () => {
          if (fabricCanvasRef.current) {
            fabricCanvasRef.current.setDimensions({
              width: window.innerWidth - 400,
              height: window.innerHeight - 60,
            });
            fabricCanvasRef.current.renderAll();
          }
        };
        
        // Gestisce la selezione
        if (fabricCanvasRef.current) {
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
        }
        
        window.addEventListener('resize', resizeCanvas);
        
        return () => {
          window.removeEventListener('resize', resizeCanvas);
          if (fabricCanvasRef.current) {
            console.log('DEBUG: Pulizia canvas durante smontaggio componente');
            fabricCanvasRef.current.dispose();
          }
        };
      } catch (error) {
        console.error('DEBUG: Errore durante l\'inizializzazione del canvas:', error);
        canvasInitializedRef.current = false;
      }
    }
  }, [onSelectObject, setCanvasRef]);

  // Gestisce il drag over sul canvas
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Gestisce il drop sul canvas
  const handleDrop = async (e) => {
    e.preventDefault();
    
    console.log('DEBUG: Drop avvenuto');
    
    // Se non c'è un progetto selezionato o il canvas non è inizializzato, mostra un messaggio di errore
    if (!currentProject) {
      console.log('DEBUG: Progetto corrente non disponibile durante drop');
      alert('Seleziona o crea un progetto prima di aggiungere elementi');
      return;
    }
    
    if (!fabricCanvasRef.current) {
      console.log('DEBUG: Canvas non inizializzato durante drop');
      alert('Errore nell\'inizializzazione del canvas. Ricarica la pagina.');
      return;
    }
    
    console.log('DEBUG: Drop con progetto corrente:', currentProject.name);
    
    // Recupera il tipo di strumento trascinato
    const toolType = e.dataTransfer.getData('toolType');
    console.log('DEBUG: Tipo di strumento trascinato:', toolType);
    
    // Calcola la posizione del drop
    try {
      const canvasEl = fabricCanvasRef.current.getElement();
      if (!canvasEl) {
        console.error('DEBUG: Elemento canvas non disponibile durante drop');
        return;
      }
      
      const rect = canvasEl.getBoundingClientRect();
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
      let fabricObject = null;
      let nodeData = { ...baseNodeData };
      
      console.log('DEBUG: Creazione oggetto per tipo:', toolType);
      
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
          console.log('DEBUG: Connessione selezionata, da implementare');
          return;
          
        default:
          console.log('DEBUG: Tipo di strumento non riconosciuto');
          return;
      }
      
      if (!fabricObject) {
        console.error('DEBUG: Creazione oggetto fallita');
        return;
      }
      
      console.log('DEBUG: Oggetto creato con successo');
      
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
      const savedNode = await addNode(nodeForDb);
      
      // Se il salvataggio ha successo, associa l'ID del database all'oggetto fabric
      if (savedNode && fabricObject) {
        console.log('DEBUG: Nodo salvato nel DB, ID:', savedNode.id);
        fabricObject.set('dbId', savedNode.id);
        fabricCanvasRef.current.renderAll();
        
        // Seleziona l'oggetto appena creato
        fabricCanvasRef.current.setActiveObject(fabricObject);
        onSelectObject(fabricObject);
      }
    } catch (error) {
      console.error('DEBUG: Errore durante il processo di drop:', error);
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
      
      {/* Messaggio di aiuto visibile solo quando non c'è un progetto selezionato */}
      {!currentProject && (
        <div className="canvas-message">
          <p>Seleziona o crea un progetto dal menu File</p>
        </div>
      )}
    </div>
  );
};

export default Canvas;