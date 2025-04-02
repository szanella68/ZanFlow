// FILE: NodeFactory.js
import { createMachine } from './Machine';
import { createTransport } from './Transport';
import { createStorage } from './Storage';

const NodeFactory = {
  createNodeFromData: (canvas, nodeData) => {
    if (!canvas || !nodeData || !nodeData.node_type) {
      console.warn('⚠️ Dati nodo non validi:', nodeData);
      return null;
    }

    const position = {
      left: nodeData.position_x || 100,
      top: nodeData.position_y || 100
    };

    const data = typeof nodeData.data === 'string'
      ? JSON.parse(nodeData.data)
      : nodeData.data;

    let fabricObject = null;

    switch (nodeData.node_type) {
      case 'machine':
        fabricObject = createMachine(canvas, position, data);
        break;
      case 'transport':
        fabricObject = createTransport(canvas, position, data);
        break;
      case 'storage':
        fabricObject = createStorage(canvas, position, data);
        break;
      default:
        console.error(`❌ Nodo di tipo sconosciuto: ${nodeData.node_type}`);
        return null;
    }

    if (fabricObject) {
      fabricObject.set({
        id: nodeData.id,
        objectType: nodeData.node_type
      });
      canvas.add(fabricObject);
    }

    return fabricObject;
  }
};

export default NodeFactory;