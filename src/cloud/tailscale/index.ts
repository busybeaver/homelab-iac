import { ComponentData } from '../../util/types';
import { getDefaultTailnet } from './tailnet_default';

export interface TailscaleData extends ComponentData {
  // if we want to expose further data
}

export const getTailscale = async (): Promise<TailscaleData> => {
  return {
    resources: [
      await getDefaultTailnet(),
    ],
  };
};
