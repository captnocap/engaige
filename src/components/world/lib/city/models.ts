/**
 * City Models Registry
 *
 * Complete registry of all 260+ GLB models available for the city.
 * Ported from the city project with updated paths.
 */

export interface ModelMeta {
  type:
    | 'zone'
    | 'power'
    | 'road'
    | 'terrain'
    | 'vehicle'
    | 'water-vehicle'
    | 'air-vehicle'
    | 'rail-vehicle'
    | 'service'
    | 'prop'
    | 'nature';
  filename: string;
  scale?: number;
  rotation?: number;
  receiveShadow?: boolean;
  castShadow?: boolean;
  width?: number; // tiles wide (x-axis), default 1
  depth?: number; // tiles deep (z-axis), default 1
}

const models: Record<string, ModelMeta> = {
  'under-construction': {
    type: 'zone',
    filename: 'construction-small.glb',
    scale: 3,
  },
  'residential-A1': {
    type: 'zone',
    filename: 'building-house-block-big.glb',
  },
  'residential-B1': {
    type: 'zone',
    filename: 'building-house-family-small.glb',
  },
  'residential-C1': {
    type: 'zone',
    filename: 'building-house-family-large.glb',
  },
  'residential-A2': {
    type: 'zone',
    filename: 'building-block-4floor-short.glb',
  },
  'residential-B2': {
    type: 'zone',
    filename: 'building-block-4floor-corner.glb',
  },
  'residential-C2': {
    type: 'zone',
    filename: 'building-block-5floor.glb',
  },
  'residential-A3': {
    type: 'zone',
    filename: 'building-office-balcony.glb',
  },
  'residential-B3': {
    type: 'zone',
    filename: 'building-office-pyramid.glb',
  },
  'residential-C3': {
    type: 'zone',
    filename: 'building-office-tall.glb',
  },
  'commercial-A1': {
    type: 'zone',
    filename: 'building-cafe.glb',
  },
  'commercial-B1': {
    type: 'zone',
    filename: 'building-burger-joint.glb',
  },
  'commercial-C1': {
    type: 'zone',
    filename: 'building-restaurant.glb',
  },
  'commercial-A2': {
    type: 'zone',
    filename: 'building-cinema.glb',
  },
  'commercial-B2': {
    type: 'zone',
    filename: 'building-casino.glb',
  },
  'commercial-C2': {
    type: 'zone',
    filename: 'data-center.glb',
  },
  'commercial-A3': {
    type: 'zone',
    filename: 'building-office.glb',
  },
  'commercial-B3': {
    type: 'zone',
    filename: 'building-office-big.glb',
  },
  'commercial-C3': {
    type: 'zone',
    filename: 'building-skyscraper.glb',
  },
  'industrial-A1': {
    type: 'zone',
    filename: 'industry-factory.glb',
  },
  'industrial-B1': {
    type: 'zone',
    filename: 'industry-refinery.glb',
  },
  'industrial-C1': {
    type: 'zone',
    filename: 'industry-warehouse.glb',
  },
  'industrial-A2': {
    type: 'zone',
    filename: 'industry-factory.glb',
  },
  'industrial-B2': {
    type: 'zone',
    filename: 'industry-refinery.glb',
  },
  'industrial-C2': {
    type: 'zone',
    filename: 'industry-warehouse.glb',
  },
  'industrial-A3': {
    type: 'zone',
    filename: 'industry-factory.glb',
  },
  'industrial-B3': {
    type: 'zone',
    filename: 'industry-refinery.glb',
  },
  'industrial-C3': {
    type: 'zone',
    filename: 'industry-warehouse.glb',
  },
  'power-plant': {
    type: 'power',
    filename: 'industry-factory-old.glb',
  },
  'power-line': {
    type: 'power',
    filename: 'power_line_pole_modified.glb',
  },
  'road-straight': {
    type: 'road',
    filename: 'tile-road-straight.glb',
    castShadow: false,
  },
  'road-end': {
    type: 'road',
    filename: 'tile-road-end.glb',
    castShadow: false,
  },
  'road-corner': {
    type: 'road',
    filename: 'tile-road-curve.glb',
    castShadow: false,
  },
  'road-three-way': {
    type: 'road',
    filename: 'tile-road-intersection-t.glb',
    castShadow: false,
  },
  'road-four-way': {
    type: 'road',
    filename: 'tile-road-intersection.glb',
    castShadow: false,
  },
  grass: {
    type: 'terrain',
    filename: 'tile-plain_grass.glb',
    castShadow: false,
  },
  'car-taxi': {
    type: 'vehicle',
    filename: 'car-taxi.glb',
    rotation: 90,
  },
  'car-police': {
    type: 'vehicle',
    filename: 'car-police.glb',
    rotation: 90,
  },
  'car-passenger': {
    type: 'vehicle',
    filename: 'car-passenger.glb',
    rotation: 90,
  },
  'car-veteran': {
    type: 'vehicle',
    filename: 'car-veteran.glb',
    rotation: 90,
  },
  truck: {
    type: 'vehicle',
    filename: 'truck.glb',
    rotation: 90,
  },
  'car-hippie-van': {
    type: 'vehicle',
    filename: 'car-hippie-van.glb',
    rotation: 90,
  },
  'car-tow-truck': {
    type: 'vehicle',
    filename: 'car-tow-truck.glb',
    rotation: 90,
  },
  'car-ambulance-pickup': {
    type: 'vehicle',
    filename: 'car-ambulance-pickup.glb',
    rotation: 90,
  },
  'car-passenger-race': {
    type: 'vehicle',
    filename: 'car-passenger-race.glb',
    rotation: 90,
  },
  'car-baywatch': {
    type: 'vehicle',
    filename: 'car-baywatch.glb',
    rotation: 90,
  },
  'car-truck-dump': {
    type: 'vehicle',
    filename: 'car-truck-dump.glb',
    rotation: 90,
  },
  'car-truck-armored-truck': {
    type: 'vehicle',
    filename: 'armored-truck.glb',
    rotation: 90,
  },

  // ========== Additional Vehicles ==========
  'bus-passenger': {
    type: 'vehicle',
    filename: 'bus-passenger.glb',
    rotation: 90,
  },
  'bus-school': {
    type: 'vehicle',
    filename: 'bus-school.glb',
    rotation: 90,
  },
  firetruck: {
    type: 'vehicle',
    filename: 'firetruck.glb',
    rotation: 90,
  },
  'car-firefighter-pickup': {
    type: 'vehicle',
    filename: 'car-firefighter-pickup.glb',
    rotation: 90,
  },
  'car-truck-cement': {
    type: 'vehicle',
    filename: 'car-truck-cement.glb',
    rotation: 90,
  },
  'car-truck-tanker': {
    type: 'vehicle',
    filename: 'car-truck-tanker.glb',
    rotation: 90,
  },
  'car-formula': {
    type: 'vehicle',
    filename: 'car-formula.glb',
    rotation: 90,
  },
  'jeep-open': {
    type: 'vehicle',
    filename: 'jeep-open.glb',
    rotation: 90,
  },
  excavator: {
    type: 'vehicle',
    filename: 'excavator.glb',
    rotation: 90,
  },
  forklift: {
    type: 'vehicle',
    filename: 'forklift.glb',
    rotation: 90,
  },
  'golf-cart': {
    type: 'vehicle',
    filename: 'golf-cart.glb',
    rotation: 90,
  },

  // ========== Zone Styles D, E, F ==========
  'residential-D1': {
    type: 'zone',
    filename: 'building-house-modern.glb',
  },
  'residential-E1': {
    type: 'zone',
    filename: 'building-cabin-small.glb',
  },
  'residential-F1': {
    type: 'zone',
    filename: 'building-house-block.glb',
  },
  'residential-D2': {
    type: 'zone',
    filename: 'building-house-modern-big.glb',
  },
  'residential-E2': {
    type: 'zone',
    filename: 'building-cabin-big.glb',
  },
  'residential-F2': {
    type: 'zone',
    filename: 'building-block-5floor-corner.glb',
  },
  'residential-D3': {
    type: 'zone',
    filename: 'skyscraper-small.glb',
  },
  'residential-E3': {
    type: 'zone',
    filename: 'skyscraper-medium.glb',
  },
  'residential-F3': {
    type: 'zone',
    filename: 'skyscraper-large.glb',
  },

  'commercial-D1': {
    type: 'zone',
    filename: 'building-carwash.glb',
  },
  'commercial-E1': {
    type: 'zone',
    filename: 'building-post.glb',
  },
  'commercial-F1': {
    type: 'zone',
    filename: 'building-bank.glb',
  },
  'commercial-D2': {
    type: 'zone',
    filename: 'building-hotel.glb',
  },
  'commercial-E2': {
    type: 'zone',
    filename: 'building-mall.glb',
  },
  'commercial-F2': {
    type: 'zone',
    filename: 'building-museum.glb',
  },
  'commercial-D3': {
    type: 'zone',
    filename: 'skyscraper.glb',
  },
  'commercial-E3': {
    type: 'zone',
    filename: 'skyscraper-huge.glb',
  },
  'commercial-F3': {
    type: 'zone',
    filename: 'building-office-rounded.glb',
  },

  stadium: {
    type: 'service',
    filename: 'building-stadium.glb',
    width: 3,
    depth: 3,
  },

  'industrial-D1': {
    type: 'zone',
    filename: 'industry-building.glb',
  },
  'industrial-E1': {
    type: 'zone',
    filename: 'industry-factory-hall.glb',
  },
  'industrial-F1': {
    type: 'zone',
    filename: 'industry-storage.glb',
  },
  'industrial-D2': {
    type: 'zone',
    filename: 'chimney-big.glb',
  },
  'industrial-E2': {
    type: 'zone',
    filename: 'cooling-tower.glb',
  },
  'industrial-F2': {
    type: 'zone',
    filename: 'nuclear-power-plant.glb',
  },
  'industrial-D3': {
    type: 'zone',
    filename: 'industry-building.glb',
  },
  'industrial-E3': {
    type: 'zone',
    filename: 'industry-factory-hall.glb',
  },
  'industrial-F3': {
    type: 'zone',
    filename: 'industry-storage.glb',
  },

  // ========== Terrain Types ==========
  dirt: {
    type: 'terrain',
    filename: 'tile-plain_dirt.glb',
    castShadow: false,
  },
  sand: {
    type: 'terrain',
    filename: 'tile-plain_sand.glb',
    castShadow: false,
  },
  concrete: {
    type: 'terrain',
    filename: 'tile-plain_concrete.glb',
    castShadow: false,
  },
  asphalt: {
    type: 'terrain',
    filename: 'tile-plain_asphalt.glb',
    castShadow: false,
  },
  water: {
    type: 'terrain',
    filename: 'tile-water.glb',
    castShadow: false,
  },
  park: {
    type: 'terrain',
    filename: 'tile-park.glb',
    castShadow: false,
  },

  // ========== Service Buildings ==========
  hospital: {
    type: 'service',
    filename: 'building-hospital.glb',
    scale: 1.8,
  },
  'fire-station': {
    type: 'service',
    filename: 'building-firestation.glb',
    scale: 1.8,
  },
  'police-station': {
    type: 'service',
    filename: 'building-policestation.glb',
    scale: 1.8,
  },
  school: {
    type: 'service',
    filename: 'building-school.glb',
    scale: 1.5,
  },
  'train-station': {
    type: 'service',
    filename: 'building-train-station.glb',
    width: 2,
    depth: 1,
  },

  // ========== Nature ==========
  'tree-oak': {
    type: 'nature',
    filename: 'tree-oak.glb',
  },
  'tree-birch': {
    type: 'nature',
    filename: 'tree-birch.glb',
  },
  'tree-birch-tall': {
    type: 'nature',
    filename: 'tree-birch-tall.glb',
  },
  'tree-conifer': {
    type: 'nature',
    filename: 'tree-conifer.glb',
  },
  'tree-fir': {
    type: 'nature',
    filename: 'tree-fir.glb',
  },
  'tree-spruce': {
    type: 'nature',
    filename: 'tree-spruce.glb',
  },
  'tree-poplar': {
    type: 'nature',
    filename: 'tree-poplar.glb',
  },
  'tree-lime': {
    type: 'nature',
    filename: 'tree-lime.glb',
  },
  'tree-beech': {
    type: 'nature',
    filename: 'tree-beech.glb',
  },
  'tree-old': {
    type: 'nature',
    filename: 'tree-old.glb',
  },
  'tree-dead': {
    type: 'nature',
    filename: 'tree-dead.glb',
  },
  'tree-dry': {
    type: 'nature',
    filename: 'tree-dry.glb',
  },
  'tree-tall': {
    type: 'nature',
    filename: 'tree-tall.glb',
  },
  'tree-round': {
    type: 'nature',
    filename: 'tree-round.glb',
  },
  'tree-little': {
    type: 'nature',
    filename: 'tree-little.glb',
  },
  'tree-forest': {
    type: 'nature',
    filename: 'tree-forest.glb',
  },
  'tree-bonsai': {
    type: 'nature',
    filename: 'tree-bonsai.glb',
  },
  'tree-pot': {
    type: 'nature',
    filename: 'tree-pot.glb',
  },
  'tree-square': {
    type: 'nature',
    filename: 'tree-square.glb',
  },
  'tree-elipse': {
    type: 'nature',
    filename: 'tree-elipse.glb',
  },
  tree: {
    type: 'nature',
    filename: 'tree.glb',
  },
  palm: {
    type: 'nature',
    filename: 'palm.glb',
  },
  'palm-round': {
    type: 'nature',
    filename: 'palm-round.glb',
  },
  'palm-small': {
    type: 'nature',
    filename: 'palm-small.glb',
  },
  shrub: {
    type: 'nature',
    filename: 'shrub.glb',
  },
  'shrub-round': {
    type: 'nature',
    filename: 'shrub-round.glb',
  },
  'cactus-big': {
    type: 'nature',
    filename: 'cactus-big.glb',
  },
  'cactus-medium': {
    type: 'nature',
    filename: 'cactus-medium.glb',
  },
  'grass-basic': {
    type: 'nature',
    filename: 'grass-basic.glb',
  },
  'grass-clumb': {
    type: 'nature',
    filename: 'grass-clumb.glb',
  },
  'grass-long': {
    type: 'nature',
    filename: 'grass-long.glb',
  },
  'grass-tall': {
    type: 'nature',
    filename: 'grass-tall.glb',
  },
  'grass-plant': {
    type: 'nature',
    filename: 'grass.glb',
  },
  'rock-pillar': {
    type: 'nature',
    filename: 'rock-pillar.glb',
  },
  'rock-sharp': {
    type: 'nature',
    filename: 'rock-sharp.glb',
  },
  'rock-terrasse': {
    type: 'nature',
    filename: 'rock-terrasse.glb',
  },
  'rocks-small': {
    type: 'nature',
    filename: 'rocks-small.glb',
  },
  'stone-diamond': {
    type: 'nature',
    filename: 'stone-diamond.glb',
  },
  'stone-flat': {
    type: 'nature',
    filename: 'stone-flat.glb',
  },
  'stone-oval': {
    type: 'nature',
    filename: 'stone-oval.glb',
  },
  'stone-pointy': {
    type: 'nature',
    filename: 'stone-pointy.glb',
  },
  'stone-round': {
    type: 'nature',
    filename: 'stone-round.glb',
  },
  'stone-small': {
    type: 'nature',
    filename: 'stone-small.glb',
  },
  stump: {
    type: 'nature',
    filename: 'stump.glb',
  },
  'stump-small': {
    type: 'nature',
    filename: 'stump-small.glb',
  },
  sunflower: {
    type: 'nature',
    filename: 'sunflower.glb',
  },
  mountains: {
    type: 'nature',
    filename: 'mountains.glb',
  },
  'mountain-desert': {
    type: 'nature',
    filename: 'mountain-desert.glb',
  },

  // ========== Props/Decorations ==========
  'bench-forest': {
    type: 'prop',
    filename: 'bench-forest.glb',
  },
  'bench-old': {
    type: 'prop',
    filename: 'bench-old.glb',
  },
  'bin-wheelie': {
    type: 'prop',
    filename: 'bin-wheelie.glb',
  },
  dumpster: {
    type: 'prop',
    filename: 'dumpster.glb',
  },
  'mail-box': {
    type: 'prop',
    filename: 'mail-box.glb',
  },
  'bus-stop': {
    type: 'prop',
    filename: 'bus-stop.glb',
  },
  'bus-stop-sign': {
    type: 'prop',
    filename: 'bus-stop-sign.glb',
  },
  'atm-machine': {
    type: 'prop',
    filename: 'atm-mechine.glb',
  },
  'fire-hydrant': {
    type: 'prop',
    filename: 'fire-hydrant.glb',
  },
  'lamp-city': {
    type: 'prop',
    filename: 'lamp-city.glb',
  },
  'lamp-road': {
    type: 'prop',
    filename: 'lamp-road.glb',
  },
  'lamp-road-double': {
    type: 'prop',
    filename: 'lamp-road-double.glb',
  },
  'lantern-long': {
    type: 'prop',
    filename: 'lantern-long.glb',
  },
  'lantern-sphere': {
    type: 'prop',
    filename: 'lantern-sphere.glb',
  },
  'traffic-lights': {
    type: 'prop',
    filename: 'traffic-lights.glb',
  },
  fence: {
    type: 'prop',
    filename: 'fence.glb',
  },
  'fence-big': {
    type: 'prop',
    filename: 'fence-big.glb',
  },
  'fence-classic': {
    type: 'prop',
    filename: 'fence-classic.glb',
  },
  'fence-picket': {
    type: 'prop',
    filename: 'fence-picket.glb',
  },
  'fence-shrub': {
    type: 'prop',
    filename: 'fence-shrub.glb',
  },
  'fence-start': {
    type: 'prop',
    filename: 'fence-start.glb',
  },
  'fence-stone': {
    type: 'prop',
    filename: 'fence-stone.glb',
  },
  'fence-stone-gate': {
    type: 'prop',
    filename: 'fence-stone-gate.glb',
  },
  'fence-stone-gate-small': {
    type: 'prop',
    filename: 'fence-stone-gate-small.glb',
  },
  'fence-stone-metal': {
    type: 'prop',
    filename: 'fence-stone-metal.glb',
  },
  'fence-stone-tower': {
    type: 'prop',
    filename: 'fence-stone-tower.glb',
  },
  'fence-vineyard': {
    type: 'prop',
    filename: 'fence-vineyard.glb',
  },
  fountain: {
    type: 'prop',
    filename: 'fountain.glb',
  },
  guidepost: {
    type: 'prop',
    filename: 'guidepost.glb',
  },
  'basketball-stand': {
    type: 'prop',
    filename: 'basketball-stand.glb',
  },
  'sand-box': {
    type: 'prop',
    filename: 'sand-box.glb',
  },
  'bike-stand': {
    type: 'prop',
    filename: 'bike-stand.glb',
  },
  'bike-old': {
    type: 'prop',
    filename: 'bike-old.glb',
  },
  'baby-carriage': {
    type: 'prop',
    filename: 'baby-carriage.glb',
  },
  'balloon-stripes': {
    type: 'prop',
    filename: 'balloon-stripes.glb',
  },
  'chair-folding': {
    type: 'prop',
    filename: 'chair-folding.glb',
  },
  'dryer-outside': {
    type: 'prop',
    filename: 'dryer-outside.glb',
  },
  'flowers-window': {
    type: 'prop',
    filename: 'flowers-window.glb',
  },
  'grill-round': {
    type: 'prop',
    filename: 'grill-round.glb',
  },
  palette: {
    type: 'prop',
    filename: 'palette.glb',
  },
  'marketplace-stand': {
    type: 'prop',
    filename: 'marketplace-stand-simple.glb',
  },
  'burger-joint-sign': {
    type: 'prop',
    filename: 'burger-joint-sign.glb',
  },
  'burger-statue': {
    type: 'prop',
    filename: 'burger-statue.glb',
  },
  'cargo-blue': {
    type: 'prop',
    filename: 'cargo-shipping_blue.glb',
  },
  'cargo-green': {
    type: 'prop',
    filename: 'cargo-shipping_green.glb',
  },
  'cargo-orange': {
    type: 'prop',
    filename: 'cargo-shipping_orange.glb',
  },
  'cargo-red': {
    type: 'prop',
    filename: 'cargo-shipping_red.glb',
  },
  'cargo-white': {
    type: 'prop',
    filename: 'cargo-shipping_white.glb',
  },
  'cargo-simple': {
    type: 'prop',
    filename: 'cargo-smple.glb',
  },
  'ferris-wheel': {
    type: 'prop',
    filename: 'ferris-wheel.glb',
  },
  'tent-circus': {
    type: 'prop',
    filename: 'tent-circus-big.glb',
  },
  'free-fall-ride': {
    type: 'prop',
    filename: 'free-fall-ride.glb',
  },
  tribune: {
    type: 'prop',
    filename: 'tribune-streight.glb',
  },
  mosque: {
    type: 'prop',
    filename: 'mosque.glb',
  },
  'mosque-tower': {
    type: 'prop',
    filename: 'mosque-tower.glb',
  },
  'gate-china': {
    type: 'prop',
    filename: 'gate-china.glb',
  },

  // ========== Main Roads ==========
  'mainroad-straight': {
    type: 'road',
    filename: 'tile-mainroad-straight.glb',
    castShadow: false,
  },
  'mainroad-corner': {
    type: 'road',
    filename: 'tile-mainroad-curve.glb',
    castShadow: false,
  },
  'mainroad-three-way': {
    type: 'road',
    filename: 'tile-mainroad-intersection-t.glb',
    castShadow: false,
  },
  'mainroad-four-way': {
    type: 'road',
    filename: 'tile-mainroad-intersection.glb',
    castShadow: false,
  },
  'mainroad-crosswalk': {
    type: 'road',
    filename: 'tile-mainroad-straight-crosswalk.glb',
    castShadow: false,
  },
  'road-crosswalk': {
    type: 'road',
    filename: 'tile-road-straight-crosswalk.glb',
    castShadow: false,
  },
  'road-to-mainroad': {
    type: 'road',
    filename: 'tile-road-to-mainroad.glb',
    castShadow: false,
  },
  'mainroad-road-intersection': {
    type: 'road',
    filename: 'tile-mainroad-road-intersection.glb',
    castShadow: false,
  },
  'mainroad-road-intersection-t': {
    type: 'road',
    filename: 'tile-mainroad-road-intersection-t.glb',
    castShadow: false,
  },
  'sidewalk-straight': {
    type: 'road',
    filename: 'tile-sidewalk-straight.glb',
    castShadow: false,
  },

  // ========== Water & Air Vehicles ==========
  'boat-fishing': {
    type: 'water-vehicle',
    filename: 'boat-fishing.glb',
    rotation: 90,
  },
  'boat-sail': {
    type: 'water-vehicle',
    filename: 'boat-sail.glb',
    rotation: 90,
  },
  'boat-speed': {
    type: 'water-vehicle',
    filename: 'boat-speed.glb',
    rotation: 90,
  },
  'ship-cargo': {
    type: 'water-vehicle',
    filename: 'ship-cargo.glb',
    rotation: 90,
  },
  'ship-yacht': {
    type: 'water-vehicle',
    filename: 'ship-yacht.glb',
    rotation: 90,
  },
  helicopter: {
    type: 'air-vehicle',
    filename: 'helicopter.glb',
    rotation: 90,
  },
  floatplane: {
    type: 'air-vehicle',
    filename: 'floatplane.glb',
    rotation: 90,
  },
  'plane-passenger': {
    type: 'air-vehicle',
    filename: 'plane-passenger.glb',
    rotation: 90,
  },
  'freight-train': {
    type: 'rail-vehicle',
    filename: 'freight-train.glb',
    rotation: 90,
  },

  // ========== Remaining Buildings ==========
  'building-antique-china': {
    type: 'zone',
    filename: 'building-antique-china.glb',
  },
  'building-apartment-china': {
    type: 'zone',
    filename: 'building-apartment-china.glb',
  },
  'building-market-china': {
    type: 'zone',
    filename: 'building-market-china.glb',
  },
  'building-pagoda-china': {
    type: 'zone',
    filename: 'building-pagoda-china.glb',
  },
  'building-restaurant-china': {
    type: 'zone',
    filename: 'building-restuarant-china.glb',
  },
  'building-shop-china': {
    type: 'zone',
    filename: 'building-shop-china.glb',
  },
  'building-temple-china': {
    type: 'zone',
    filename: 'building-temple-china.glb',
  },
  'skyscraper-part-bottom': {
    type: 'zone',
    filename: 'skyscraper-part-bottom.glb',
  },
  'skyscraper-part-middle': {
    type: 'zone',
    filename: 'skyscraper-part-middle.glb',
  },
  'skyscraper-part-top': {
    type: 'zone',
    filename: 'skyscraper-part-top.glb',
  },
  'skyscraper-tiny': {
    type: 'zone',
    filename: 'skyscraper-tiny.glb',
  },
  'building-port-sea': {
    type: 'zone',
    filename: 'building-port-sea.glb',
  },
  'building-office-rounded': {
    type: 'zone',
    filename: 'building-office-rounded.glb',
  },
  'building-house-block-old': {
    type: 'zone',
    filename: 'building-house-block-old.glb',
  },
  'control-tower': {
    type: 'zone',
    filename: 'control-tower.glb',
  },
  'solar-panel-house': {
    type: 'power',
    filename: 'solar-panel-house.glb',
  },
  'police-station-garage': {
    type: 'service',
    filename: 'building-policestation-garage.glb',
  },

  // ========== Remaining Road Tiles ==========
  'road-hill': {
    type: 'road',
    filename: 'tile-road-hill.glb',
    castShadow: false,
  },
  'mainroad-hill': {
    type: 'road',
    filename: 'tile-mainroad-hill.glb',
    castShadow: false,
  },
  'sidewalk-hill': {
    type: 'road',
    filename: 'tile-sidewalk-hill.glb',
    castShadow: false,
  },
  'pier-tile': {
    type: 'road',
    filename: 'pier-tile-straight.glb',
    castShadow: false,
  },
  'canal-cover': {
    type: 'road',
    filename: 'canal-cover.glb',
    castShadow: false,
  },

  // ========== Terrain/Hills ==========
  'tile-hill': {
    type: 'terrain',
    filename: 'tile-hill.glb',
    castShadow: false,
  },
  'tile-hill-corner': {
    type: 'terrain',
    filename: 'tile-hill-corner.glb',
    castShadow: false,
  },
  'tile-hill-curve': {
    type: 'terrain',
    filename: 'tile-hill-curve.glb',
    castShadow: false,
  },
  'ground-cracked': {
    type: 'terrain',
    filename: 'ground-cracked.glb',
    castShadow: false,
  },
  'ground-lines': {
    type: 'terrain',
    filename: 'ground-lines.glb',
    castShadow: false,
  },

  // ========== Miscellaneous ==========
  'mainroad-sign': {
    type: 'prop',
    filename: 'mainroad-sign-green.glb',
  },
  'flag-golf': {
    type: 'prop',
    filename: 'flag-golf.glb',
  },
  'power-line-pole': {
    type: 'power',
    filename: 'power_line_pole.glb',
  },
};

/**
 * Get model size in tiles
 */
export function getModelSize(modelName: string): { width: number; depth: number } {
  const meta = models[modelName];
  return {
    width: meta?.width ?? 1,
    depth: meta?.depth ?? 1,
  };
}

/**
 * Get model type
 */
export function getModelType(modelName: string): ModelMeta['type'] | null {
  const meta = models[modelName];
  return meta?.type ?? null;
}

/**
 * Check if model is a prop
 */
export function isPropModel(modelName: string): boolean {
  return getModelType(modelName) === 'prop';
}

/**
 * Get all models of a specific type
 */
export function getModelsByType(type: ModelMeta['type']): string[] {
  return Object.entries(models)
    .filter(([_, meta]) => meta.type === type)
    .map(([name]) => name);
}

/**
 * Get all vehicle models
 */
export function getVehicleModels(): string[] {
  return Object.entries(models)
    .filter(([_, meta]) => meta.type === 'vehicle')
    .map(([name]) => name);
}

export default models;
