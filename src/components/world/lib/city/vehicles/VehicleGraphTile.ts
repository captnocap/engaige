/**
 * VehicleGraphTile
 *
 * Represents a road tile in the vehicle graph with entry/exit nodes.
 * Different road types (straight, corner, T, intersection) have different node layouts.
 */

import * as THREE from 'three';
import { VehicleGraphNode } from './VehicleGraphNode.js';
import { RAD2DEG } from 'three/src/math/MathUtils.js';

const roadOffset = 0.05;
const tileOffset = 0.25;

interface NodePair {
  in: VehicleGraphNode | null;
  out: VehicleGraphNode | null;
}

export class VehicleGraphTile extends THREE.Group {
  roadRotation: number;
  left: NodePair = { in: null, out: null };
  right: NodePair = { in: null, out: null };
  top: NodePair = { in: null, out: null };
  bottom: NodePair = { in: null, out: null };

  constructor(x: number, y: number, rotation: number) {
    super();
    this.position.set(x, 0, y);
    this.rotation.set(0, rotation, 0);
    this.roadRotation = Math.round(rotation * RAD2DEG);
  }

  /**
   * Create a vehicle graph tile based on road style
   */
  static create(
    x: number,
    y: number,
    rotation: number,
    style: string
  ): VehicleGraphTile | null {
    switch (style) {
      case 'end':
        return new EndRoadTile(x, y, rotation);
      case 'straight':
        return new StraightRoadTile(x, y, rotation);
      case 'corner':
        return new CornerRoadTile(x, y, rotation);
      case 'three-way':
        return new ThreeWayRoadTile(x, y, rotation);
      case 'four-way':
        return new FourWayRoadTile(x, y, rotation);
      default:
        console.warn(`[VehicleGraphTile] Unknown road style: ${style}`);
        return null;
    }
  }

  /**
   * Disconnect all nodes in this tile
   */
  disconnectAll(): void {
    for (const node of this.children as VehicleGraphNode[]) {
      node.disconnectAll();
      node.removeFromParent();
    }
  }

  /**
   * Get a random entry node
   */
  getRandomNode(): VehicleGraphNode | null {
    const nodes: VehicleGraphNode[] = [];
    if (this.left.in) nodes.push(this.left.in);
    if (this.right.in) nodes.push(this.right.in);
    if (this.top.in) nodes.push(this.top.in);
    if (this.bottom.in) nodes.push(this.bottom.in);

    if (nodes.length > 0) {
      const i = Math.floor(nodes.length * Math.random());
      return nodes[i];
    } else {
      return null;
    }
  }

  // World-space side accessors (handle rotation)
  getWorldLeftSide(): NodePair {
    switch (this.roadRotation) {
      case 0:
        return this.left;
      case 90:
        return this.top;
      case 180:
        return this.right;
      case 270:
        return this.bottom;
      default:
        return this.left;
    }
  }

  getWorldRightSide(): NodePair {
    switch (this.roadRotation) {
      case 0:
        return this.right;
      case 90:
        return this.bottom;
      case 180:
        return this.left;
      case 270:
        return this.top;
      default:
        return this.right;
    }
  }

  getWorldTopSide(): NodePair {
    switch (this.roadRotation) {
      case 0:
        return this.top;
      case 90:
        return this.right;
      case 180:
        return this.bottom;
      case 270:
        return this.left;
      default:
        return this.top;
    }
  }

  getWorldBottomSide(): NodePair {
    switch (this.roadRotation) {
      case 0:
        return this.bottom;
      case 90:
        return this.left;
      case 180:
        return this.top;
      case 270:
        return this.right;
      default:
        return this.bottom;
    }
  }
}

/**
 * Dead-end road tile
 */
export class EndRoadTile extends VehicleGraphTile {
  constructor(x: number, y: number, rotation: number) {
    super(x, y, rotation);
    this.name = `EndRoadTile (${this.position})`;

    this.bottom = {
      in: new VehicleGraphNode(roadOffset, tileOffset),
      out: new VehicleGraphNode(-roadOffset, tileOffset),
    };

    const midpoint = {
      in: new VehicleGraphNode(roadOffset, 0),
      out: new VehicleGraphNode(-roadOffset, 0),
    };

    this.add(this.bottom.in!);
    this.add(this.bottom.out!);
    this.add(midpoint.in);
    this.add(midpoint.out);

    this.bottom.in!.connect(midpoint.in);
    midpoint.in.connect(midpoint.out);
    midpoint.out.connect(this.bottom.out);
  }
}

/**
 * Straight road tile
 */
export class StraightRoadTile extends VehicleGraphTile {
  constructor(x: number, y: number, rotation: number) {
    super(x, y, rotation);
    this.name = `StraightRoadTile (${this.position})`;

    this.top = {
      in: new VehicleGraphNode(-roadOffset, -tileOffset),
      out: new VehicleGraphNode(roadOffset, -tileOffset),
    };

    this.bottom = {
      in: new VehicleGraphNode(roadOffset, tileOffset),
      out: new VehicleGraphNode(-roadOffset, tileOffset),
    };

    this.add(this.top.in!);
    this.add(this.top.out!);
    this.add(this.bottom.in!);
    this.add(this.bottom.out!);

    this.bottom.in!.connect(this.top.out);
    this.top.in!.connect(this.bottom.out);
  }
}

/**
 * Corner/curve road tile
 */
export class CornerRoadTile extends VehicleGraphTile {
  constructor(x: number, y: number, rotation: number) {
    super(x, y, rotation);
    this.name = `CornerRoadTile (${this.position})`;

    this.bottom = {
      in: new VehicleGraphNode(roadOffset, tileOffset + 0.1),
      out: new VehicleGraphNode(-roadOffset, tileOffset + 0.1),
    };

    this.right = {
      in: new VehicleGraphNode(tileOffset + 0.1, -roadOffset),
      out: new VehicleGraphNode(tileOffset + 0.1, roadOffset),
    };

    const midpointBottomRight = new VehicleGraphNode(
      tileOffset - 1.5 * roadOffset,
      tileOffset - 1.5 * roadOffset
    );

    const midpointTopLeft = new VehicleGraphNode(
      tileOffset - 3 * roadOffset,
      tileOffset - 3 * roadOffset
    );

    this.add(midpointBottomRight);
    this.add(midpointTopLeft);
    this.add(this.right.in!);
    this.add(this.right.out!);
    this.add(this.bottom.in!);
    this.add(this.bottom.out!);

    this.bottom.in!.connect(midpointBottomRight);
    midpointBottomRight.connect(this.right.out);
    this.right.in!.connect(midpointTopLeft);
    midpointTopLeft.connect(this.bottom.out);
  }
}

/**
 * T-intersection road tile
 */
export class ThreeWayRoadTile extends VehicleGraphTile {
  constructor(x: number, y: number, rotation: number) {
    super(x, y, rotation);
    this.name = `ThreeWayRoadTile (${this.position})`;

    this.left = {
      in: new VehicleGraphNode(-tileOffset, roadOffset),
      out: new VehicleGraphNode(-tileOffset, -roadOffset),
    };

    this.right = {
      in: new VehicleGraphNode(tileOffset, -roadOffset),
      out: new VehicleGraphNode(tileOffset, roadOffset),
    };

    this.bottom = {
      in: new VehicleGraphNode(roadOffset, tileOffset),
      out: new VehicleGraphNode(-roadOffset, tileOffset),
    };

    const midpointBottomLeft = new VehicleGraphNode(-roadOffset, roadOffset);
    const midpointBottomRight = new VehicleGraphNode(roadOffset, roadOffset);
    const midpointTopLeft = new VehicleGraphNode(-roadOffset, -roadOffset);
    const midpointTopRight = new VehicleGraphNode(roadOffset, -roadOffset);

    this.add(this.left.in!);
    this.add(this.left.out!);
    this.add(this.right.in!);
    this.add(this.right.out!);
    this.add(this.bottom.in!);
    this.add(this.bottom.out!);
    this.add(midpointBottomLeft);
    this.add(midpointBottomRight);
    this.add(midpointTopLeft);
    this.add(midpointTopRight);

    midpointBottomLeft.connect(midpointBottomRight);
    midpointBottomRight.connect(midpointTopRight);
    midpointTopRight.connect(midpointTopLeft);
    midpointTopLeft.connect(midpointBottomLeft);

    this.left.in!.connect(midpointBottomLeft);
    this.right.in!.connect(midpointTopRight);
    this.bottom.in!.connect(midpointBottomRight);

    midpointBottomLeft.connect(this.bottom.out);
    midpointBottomRight.connect(this.right.out);
    midpointTopLeft.connect(this.left.out);
  }
}

/**
 * 4-way intersection road tile
 */
export class FourWayRoadTile extends VehicleGraphTile {
  constructor(x: number, y: number, rotation: number) {
    super(x, y, rotation);
    this.name = `FourWayRoadTile (${this.position})`;

    this.left = {
      in: new VehicleGraphNode(-tileOffset, roadOffset),
      out: new VehicleGraphNode(-tileOffset, -roadOffset),
    };

    this.right = {
      in: new VehicleGraphNode(tileOffset, -roadOffset),
      out: new VehicleGraphNode(tileOffset, roadOffset),
    };

    this.bottom = {
      in: new VehicleGraphNode(roadOffset, tileOffset),
      out: new VehicleGraphNode(-roadOffset, tileOffset),
    };

    this.top = {
      in: new VehicleGraphNode(-roadOffset, -tileOffset),
      out: new VehicleGraphNode(roadOffset, -tileOffset),
    };

    const midpointBottomLeft = new VehicleGraphNode(-roadOffset, roadOffset);
    const midpointBottomRight = new VehicleGraphNode(roadOffset, roadOffset);
    const midpointTopLeft = new VehicleGraphNode(-roadOffset, -roadOffset);
    const midpointTopRight = new VehicleGraphNode(roadOffset, -roadOffset);

    this.add(this.left.in!);
    this.add(this.left.out!);
    this.add(this.right.in!);
    this.add(this.right.out!);
    this.add(this.bottom.in!);
    this.add(this.bottom.out!);
    this.add(this.top.in!);
    this.add(this.top.out!);
    this.add(midpointBottomLeft);
    this.add(midpointBottomRight);
    this.add(midpointTopLeft);
    this.add(midpointTopRight);

    midpointBottomLeft.connect(midpointBottomRight);
    midpointBottomRight.connect(midpointTopRight);
    midpointTopRight.connect(midpointTopLeft);
    midpointTopLeft.connect(midpointBottomLeft);

    this.left.in!.connect(midpointBottomLeft);
    this.right.in!.connect(midpointTopRight);
    this.bottom.in!.connect(midpointBottomRight);
    this.top.in!.connect(midpointTopLeft);

    midpointBottomLeft.connect(this.bottom.out);
    midpointBottomRight.connect(this.right.out);
    midpointTopRight.connect(this.top.out);
    midpointTopLeft.connect(this.left.out);
  }
}
