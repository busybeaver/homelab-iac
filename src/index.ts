import cloud from './cloud';

export = async () => {
  return {
    cloud: await cloud(),
  };
};
