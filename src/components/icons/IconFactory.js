import { createMachine } from './Machine';
import createTransport from './Transport';
import createStorage from './Storage';

const IconFactory = {
  createMachine,
  createTransport,
  createStorage,
};

export default IconFactory;