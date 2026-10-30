import * as THREE from 'three';
import { AssemblyStationId } from '../types/scada';

export interface AssemblyLineRefs {
  assemblyGroup: THREE.Group;
  needleMesh: THREE.Mesh;
  glueNozzleMesh: THREE.Mesh;
  pressRamMesh: THREE.Group;
  qcLaserMesh: THREE.Mesh;
  qcLightMesh: THREE.Mesh;
  robotBaseMesh: THREE.Group;
  robotArmMesh: THREE.Mesh;
  warehouseLiftMesh: THREE.Group;
  workpieces: THREE.Group[];
  stationHighlights: Record<AssemblyStationId, THREE.Mesh>;
}

export function createAssemblyLine3D(scene: THREE.Scene): AssemblyLineRefs {
  const assemblyGroup = new THREE.Group();
  assemblyGroup.position.set(0, 0, 0);

  // -------------------------------------------------------------
  // 1. MAIN CONVEYOR BED (From X = -21 to X = 21 at Z = 0)
  // -------------------------------------------------------------
  const conveyorLength = 42;
  const conveyorBed = new THREE.Mesh(
    new THREE.BoxGeometry(conveyorLength, 0.35, 1.3),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 })
  );
  conveyorBed.position.set(0, 0.65, 0);
  conveyorBed.receiveShadow = true;
  assemblyGroup.add(conveyorBed);

  // Black textured rubber conveyor belt top
  const beltMesh = new THREE.Mesh(
    new THREE.BoxGeometry(conveyorLength - 0.2, 0.08, 0.95),
    new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.9 })
  );
  beltMesh.position.set(0, 0.85, 0);
  assemblyGroup.add(beltMesh);

  // Safety Yellow side guide rails
  [-0.55, 0.55].forEach((zPos) => {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(conveyorLength, 0.15, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.6, roughness: 0.3 })
    );
    rail.position.set(0, 0.92, zPos);
    assemblyGroup.add(rail);
  });

  // Support Legs along the conveyor
  for (let x = -20; x <= 20; x += 4) {
    [-0.55, 0.55].forEach((zPos) => {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.65, 8),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 })
      );
      leg.position.set(x, 0.325, zPos);
      assemblyGroup.add(leg);
    });
  }

  // Station ground highlight rings
  const stationHighlights: Partial<Record<AssemblyStationId, THREE.Mesh>> = {};
  const stationCoords: Record<AssemblyStationId, number> = {
    Conveyor_RawMaterial: -18,
    SewingMachine_01: -12,
    GlueStation_01: -6,
    SolePress_01: 0,
    QualityCheck_01: 6,
    PackingRobot_01: 12,
    FinishedWarehouse: 18,
  };

  (Object.keys(stationCoords) as AssemblyStationId[]).forEach((sId) => {
    const x = stationCoords[sId];
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.6, 1.8, 32),
      new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.02, 0);
    assemblyGroup.add(ring);
    stationHighlights[sId] = ring;
  });

  // Helper to create overhead station sign billboards
  function createStationSign(x: number, title: string, stepNum: string) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.fillRect(0, 0, 256, 80);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, 252, 76);
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(`STATION ${stepNum}`, 16, 32);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(title, 16, 60);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const signMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 0.75),
      new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true })
    );
    signMesh.position.set(x, 3.2, 0);
    assemblyGroup.add(signMesh);

    // Gantry post
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 2.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x475569 })
    );
    post.position.set(x - 1.1, 2.0, -0.6);
    assemblyGroup.add(post);
  }

  createStationSign(-18, 'RawMaterial Infeed', '01');
  createStationSign(-12, 'CNC Sewing Machine', '02');
  createStationSign(-6, 'Adhesive Dispenser', '03');
  createStationSign(0, 'Hydraulic SolePress', '04');
  createStationSign(6, 'QualityCheck Vision', '05');
  createStationSign(12, 'Packing Robot Arm', '06');
  createStationSign(18, 'Finished Warehouse', '07');

  // -------------------------------------------------------------
  // STATION 01: Conveyor_RawMaterial (X = -18)
  // -------------------------------------------------------------
  const rawGroup = new THREE.Group();
  rawGroup.position.set(-18, 0, 0);

  // Infeed roll dispenser frame
  const rollStand = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 1.8, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 })
  );
  rollStand.position.set(-1.2, 1.2, -0.7);
  rawGroup.add(rollStand);

  // Fabric / Leather material roll cylinder
  const rollCylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 1.2, 24),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 })
  );
  rollCylinder.rotation.x = Math.PI / 2;
  rollCylinder.position.set(-1.2, 1.6, -0.7);
  rawGroup.add(rollCylinder);

  // Second dark leather roll
  const rollCylinder2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 1.2, 24),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
  );
  rollCylinder2.rotation.x = Math.PI / 2;
  rollCylinder2.position.set(-1.2, 1.0, -0.7);
  rawGroup.add(rollCylinder2);

  // Optical Photoelectric Infeed Sensor Eye
  const photoEye = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.2, 0.12),
    new THREE.MeshStandardMaterial({ color: 0xfacc15 })
  );
  photoEye.position.set(0.6, 1.05, 0.6);
  rawGroup.add(photoEye);

  // Red sensing beam line
  const sensorBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 1.1, 8),
    new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.7 })
  );
  sensorBeam.rotation.x = Math.PI / 2;
  sensorBeam.position.set(0.6, 1.05, 0);
  rawGroup.add(sensorBeam);

  assemblyGroup.add(rawGroup);

  // -------------------------------------------------------------
  // STATION 02: SewingMachine_01 (X = -12)
  // -------------------------------------------------------------
  const sewGroup = new THREE.Group();
  sewGroup.position.set(-12, 0, 0);

  // Industrial C-Frame sewing machine head
  const sewArmBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 1.4, 0.6),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 })
  );
  sewArmBase.position.set(0, 1.6, -0.6);
  sewGroup.add(sewArmBase);

  // Overhanging cantilever arm
  const sewArmTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.4, 0.9),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 })
  );
  sewArmTop.position.set(0, 2.1, -0.15);
  sewGroup.add(sewArmTop);

  // Sewing Needle bar (reciprocates vertically)
  const needleMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.3, 12),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.1 })
  );
  needleMesh.position.set(0, 1.35, 0.1);
  sewGroup.add(needleMesh);

  // Dual thread spools on top
  [-0.15, 0.15].forEach((xOff) => {
    const spool = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.25, 16),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.8 })
    );
    spool.position.set(xOff, 2.45, -0.6);
    sewGroup.add(spool);
  });

  // Task light spotlight
  const sewLight = new THREE.PointLight(0xfef08a, 1.2, 4);
  sewLight.position.set(0, 1.8, 0.1);
  sewGroup.add(sewLight);

  assemblyGroup.add(sewGroup);

  // -------------------------------------------------------------
  // STATION 03: GlueStation_01 (X = -6)
  // -------------------------------------------------------------
  const glueGroup = new THREE.Group();
  glueGroup.position.set(-6, 0, 0);

  // Adhesive melt chamber enclosure
  const glueChamber = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 1.6, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x0f766e, metalness: 0.6 })
  );
  glueChamber.position.set(0, 1.65, -0.65);
  glueGroup.add(glueChamber);

  // Translucent amber glue tank level window
  const glueWindow = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.8, 0.05),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.8 })
  );
  glueWindow.position.set(0, 1.65, -0.28);
  glueGroup.add(glueWindow);

  // Gantry beam
  const glueBeam = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.2, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x334155 })
  );
  glueBeam.position.set(0, 2.1, 0);
  glueGroup.add(glueBeam);

  // Dispenser Nozzle head (moves in toolpath)
  const glueNozzleMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.02, 0.35, 16),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 })
  );
  glueNozzleMesh.position.set(0, 1.35, 0);
  glueGroup.add(glueNozzleMesh);

  assemblyGroup.add(glueGroup);

  // -------------------------------------------------------------
  // STATION 04: SolePress_01 (X = 0)
  // -------------------------------------------------------------
  const pressGroup = new THREE.Group();
  pressGroup.position.set(0, 0, 0);

  // Heavy dual-pillar press frame
  const pressPost1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 2.4, 16),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 })
  );
  pressPost1.position.set(-0.7, 1.5, 0.6);
  pressGroup.add(pressPost1);

  const pressPost2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 2.4, 16),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 })
  );
  pressPost2.position.set(-0.7, 1.5, -0.6);
  pressGroup.add(pressPost2);

  const pressPost3 = pressPost1.clone();
  pressPost3.position.x = 0.7;
  pressGroup.add(pressPost3);

  const pressPost4 = pressPost2.clone();
  pressPost4.position.x = 0.7;
  pressGroup.add(pressPost4);

  // Crown block on top
  const pressCrown = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.45, 1.5),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 })
  );
  pressCrown.position.set(0, 2.7, 0);
  pressGroup.add(pressCrown);

  // Moving hydraulic ram plate group
  const pressRamMesh = new THREE.Group();
  pressRamMesh.position.set(0, 1.9, 0);

  const ramPiston = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.8, 20),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.95, roughness: 0.1 })
  );
  ramPiston.position.y = 0.4;
  pressRamMesh.add(ramPiston);

  const ramPlate = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.2, 0.8),
    new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.7 })
  );
  ramPlate.position.y = 0;
  pressRamMesh.add(ramPlate);

  pressGroup.add(pressRamMesh);
  assemblyGroup.add(pressGroup);

  // -------------------------------------------------------------
  // STATION 05: QualityCheck_01 (X = 6)
  // -------------------------------------------------------------
  const qcGroup = new THREE.Group();
  qcGroup.position.set(6, 0, 0);

  // Vision inspection arch tunnel
  const qcArch = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 1.8, 1.5),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 })
  );
  qcArch.position.set(0, 1.7, 0);
  qcGroup.add(qcArch);

  // Top high-res vision camera housing
  const topCamera = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.25, 0.35),
    new THREE.MeshStandardMaterial({ color: 0x0284c7 })
  );
  topCamera.position.set(0, 2.45, 0);
  qcGroup.add(topCamera);

  // Green sweeping laser scanner sheet
  const qcLaserMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 1.0),
    new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    })
  );
  qcLaserMesh.rotation.x = Math.PI / 2;
  qcLaserMesh.position.set(0, 1.15, 0);
  qcGroup.add(qcLaserMesh);

  // Status Stack Light beacon
  const qcLightMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.25, 16),
    new THREE.MeshBasicMaterial({ color: 0x22c55e })
  );
  qcLightMesh.position.set(0, 2.8, 0.6);
  qcGroup.add(qcLightMesh);

  assemblyGroup.add(qcGroup);

  // -------------------------------------------------------------
  // STATION 06: PackingRobot_01 (X = 12)
  // -------------------------------------------------------------
  const robotGroup = new THREE.Group();
  robotGroup.position.set(12, 0, 0);

  // Robot pedestal
  const robotPedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.5, 0.8, 20),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
  );
  robotPedestal.position.set(0, 0.4, -0.9);
  robotGroup.add(robotPedestal);

  // Rotating Robot base
  const robotBaseMesh = new THREE.Group();
  robotBaseMesh.position.set(0, 0.8, -0.9);

  const baseJoint = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 0.3, 16),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6 })
  );
  robotBaseMesh.add(baseJoint);

  // Lower arm link
  const lowerArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 1.1, 0.2),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6 })
  );
  lowerArm.position.set(0, 0.65, 0);
  lowerArm.rotation.x = 0.3;
  robotBaseMesh.add(lowerArm);

  // Upper arm link
  const robotArmMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.9, 0.18),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.7 })
  );
  robotArmMesh.position.set(0, 1.25, 0.35);
  robotArmMesh.rotation.x = -0.6;
  robotBaseMesh.add(robotArmMesh);

  // Vacuum suction gripper head
  const gripper = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.08, 0.15, 12),
    new THREE.MeshStandardMaterial({ color: 0x090d16 })
  );
  gripper.position.set(0, 0.9, 0.75);
  robotBaseMesh.add(gripper);

  robotGroup.add(robotBaseMesh);

  // Side packing table with open shoe boxes
  const packingTable = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.75, 1.0),
    new THREE.MeshStandardMaterial({ color: 0x1e293b })
  );
  packingTable.position.set(0, 0.38, 0.9);
  robotGroup.add(packingTable);

  const openBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.25, 0.75),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 })
  );
  openBox.position.set(0, 0.88, 0.9);
  robotGroup.add(openBox);

  assemblyGroup.add(robotGroup);

  // -------------------------------------------------------------
  // STATION 07: FinishedWarehouse (X = 18)
  // -------------------------------------------------------------
  const whGroup = new THREE.Group();
  whGroup.position.set(18, 0, 0);

  // High-bay AS/RS warehouse shelving rack
  const rackFrame = new THREE.Group();
  const rackHeight = 3.6;
  const rackWidth = 2.4;
  const rackDepth = 1.6;

  // 4 vertical corner posts
  [-rackWidth / 2, rackWidth / 2].forEach((rx) => {
    [-rackDepth / 2, rackDepth / 2].forEach((rz) => {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, rackHeight, 8),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 })
      );
      col.position.set(rx, rackHeight / 2, rz - 0.5);
      rackFrame.add(col);
    });
  });

  // 3 horizontal shelf levels
  [0.8, 1.8, 2.8].forEach((shelfY) => {
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(rackWidth, 0.08, rackDepth),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 })
    );
    shelf.position.set(0, shelfY, -0.5);
    rackFrame.add(shelf);

    // Shoe box cartons stored on the shelf
    [-0.8, -0.25, 0.25, 0.8].forEach((bx) => {
      const boxItem = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.22, 0.65),
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 })
      );
      boxItem.position.set(bx, shelfY + 0.15, -0.5);
      rackFrame.add(boxItem);
    });
  });

  // Stacker Crane Elevator Carriage
  const warehouseLiftMesh = new THREE.Group();
  warehouseLiftMesh.position.set(0, 1.0, 0.4);

  const liftFork = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.08, 0.8),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.7 })
  );
  warehouseLiftMesh.add(liftFork);

  const liftBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.22, 0.65),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 })
  );
  liftBox.position.y = 0.15;
  warehouseLiftMesh.add(liftBox);

  whGroup.add(rackFrame);
  whGroup.add(warehouseLiftMesh);
  assemblyGroup.add(whGroup);

  // -------------------------------------------------------------
  // MOVING WORKPIECES ON CONVEYOR (Shoe Assemblies in progress)
  // -------------------------------------------------------------
  const workpieces: THREE.Group[] = [];
  const workpieceCount = 7;

  for (let i = 0; i < workpieceCount; i++) {
    const wp = new THREE.Group();
    // Carrier pallet tray
    const tray = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.06, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 })
    );
    wp.add(tray);

    // Shoe Upper / Sole Mesh
    const shoeSole = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.08, 0.25),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
    );
    shoeSole.position.set(0, 0.06, 0);
    wp.add(shoeSole);

    const shoeUpper = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.14, 0.22),
      new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0x0284c7 : 0xef4444, roughness: 0.6 })
    );
    shoeUpper.position.set(-0.06, 0.15, 0);
    wp.add(shoeUpper);

    // Initial spacing along conveyor
    wp.position.set(-18 + i * 6, 0.92, 0);
    assemblyGroup.add(wp);
    workpieces.push(wp);
  }

  scene.add(assemblyGroup);

  return {
    assemblyGroup,
    needleMesh,
    glueNozzleMesh,
    pressRamMesh,
    qcLaserMesh,
    qcLightMesh,
    robotBaseMesh,
    robotArmMesh,
    warehouseLiftMesh,
    workpieces,
    stationHighlights: stationHighlights as Record<AssemblyStationId, THREE.Mesh>,
  };
}
