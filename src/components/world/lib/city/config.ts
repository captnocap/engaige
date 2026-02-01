/**
 * City Configuration
 *
 * Settings for vehicle simulation and rendering.
 */

export interface CityConfig {
  vehicle: {
    speed: number;
    fadeTime: number;
    maxLifetime: number;
    spawnInterval: number;
  };
}

const config: CityConfig = {
  vehicle: {
    speed: 0.0008,
    fadeTime: 500,
    maxLifetime: 30000,
    spawnInterval: 200,
  },
};

export default config;
