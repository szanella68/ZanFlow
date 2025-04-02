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

  return (
    <div className="canvas-container">
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