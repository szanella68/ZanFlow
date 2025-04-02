import { Circle, Rect, Group, Textbox } from 'fabric';

const createMachine = (canvas, left, top) => {
  console.group('🏭 Machine Icon Creation');
  
  // Validate canvas
  if (!canvas) {
    console.error('❌ FATAL: Canvas is not initialized');
    console.groupEnd();
    return null;
  }

  console.log('Canvas Verification:', {
    canvasExists: !!canvas,
    hasAddMethod: typeof canvas.add === 'function',
    hasRenderAllMethod: typeof canvas.renderAll === 'function'
  });

  // Detailed configuration logging
  console.log('Machine Creation Parameters:', { left, top });

  try {
    // Main machine rectangle
    const rect = new Rect({
      width: 120,
      height: 60,
      fill: '#deeaee',
      stroke: '#2b7a78',
      strokeWidth: 2,
      rx: 5,
      ry: 5,
      originX: 'center',
      originY: 'center'
    });

    // Gear representation
    const gear = new Circle({
      radius: 10,
      fill: '#2b7a78',
      left: -40,
      top: -15,
      originX: 'center',
      originY: 'center'
    });

    // Connection points
    const inputPoint = new Circle({
      left: -60,
      top: 0,
      radius: 5,
      fill: '#17252a',
      stroke: '#3aafa9',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center'
    });

    const outputPoint = new Circle({
      left: 60,
      top: 0,
      radius: 5,
      fill: '#17252a',
      stroke: '#3aafa9',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center'
    });

    // Background for text
    const textBg = new Rect({
      width: 80,
      height: 20,
      fill: '#deeaee',
      stroke: 'transparent',
      originX: 'center',
      originY: 'center',
      top: 15
    });

    // Text
    const textbox = new Textbox('Macchina', {
      width: 80,
      fontSize: 14,
      textAlign: 'center',
      fill: '#17252a',
      originX: 'center',
      originY: 'center',
      top: 15
    });

    // Group all components
    const group = new Group(
      [rect, gear, inputPoint, outputPoint, textBg, textbox], 
      {
        left: left,
        top: top,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        objectType: 'machine',
        data: {
          name: 'Macchina',
          cycleTime: 0,
          piecesPerHour: 0,
          operators: 0,
          rejectRate: 0
        }
      }
    );

    // Log group details before adding
    console.log('Machine Group Details:', {
      left: group.left,
      top: group.top,
      width: group.width,
      height: group.height
    });

    // Attempt to add to canvas
    try {
      canvas.add(group);
      console.log('✅ Machine Group Added to Canvas');
    } catch (addError) {
      console.error('❌ Error Adding Machine to Canvas:', addError);
      console.groupEnd();
      return null;
    }

    // Force render
    try {
      canvas.renderAll();
      console.log('🎨 Canvas Rendered');
    } catch (renderError) {
      console.error('❌ Rendering Error:', renderError);
    }

    console.groupEnd();
    return group;

  } catch (error) {
    console.error('❌ Machine Creation Fatal Error:', error);
    console.groupEnd();
    return null;
  }
};

export { createMachine };