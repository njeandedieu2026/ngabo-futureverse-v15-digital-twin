import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  SystemMode,
  TelemetryState,
  WaterLabMetrics,
  PlcIoState,
  AssemblyLineMetrics,
} from '../types/scada';
import { createAssemblyLine3D, AssemblyLineRefs } from './AssemblyLine3D';

interface ThreeSceneProps {
  mode: SystemMode;
  telemetry: TelemetryState;
  waterLab: WaterLabMetrics;
  plcIo: PlcIoState;
  activeCameraPreset: string;
  assemblyLine?: AssemblyLineMetrics;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({
  mode,
  telemetry,
  waterLab,
  plcIo,
  activeCameraPreset,
  assemblyLine,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameId = useRef<number | null>(null);
  const assemblyRefs = useRef<AssemblyLineRefs | null>(null);

  // Dynamic mesh refs
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const pumpImpellerRef = useRef<THREE.Mesh | null>(null);
  const trainRef = useRef<THREE.Group | null>(null);
  const truckRef = useRef<THREE.Group | null>(null);
  const roverRef = useRef<THREE.Mesh | null>(null);
  const circGroupRef = useRef<THREE.Group | null>(null);
  const doorLRef = useRef<THREE.Mesh | null>(null);
  const doorRRef = useRef<THREE.Mesh | null>(null);
  const radarConeRef = useRef<THREE.Mesh | null>(null);
  const vehicleRef = useRef<THREE.Group | null>(null);
  const wingLRef = useRef<THREE.Mesh | null>(null);
  const wingRRef = useRef<THREE.Mesh | null>(null);
  const acousticRingRef = useRef<THREE.Mesh | null>(null);
  const signalLightRef = useRef<THREE.Mesh | null>(null);
  const pneumaticPistonRef = useRef<THREE.Mesh | null>(null);
  const vfdBillboardCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const vfdBillboardTextureRef = useRef<THREE.CanvasTexture | null>(null);

  // Motion tracking variables
  const trainProgress = useRef<number>(0);
  const truckProgress = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // Railway curve (oval loop)
  const railCurve = useRef(
    new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(12, 0.1, 0),
        new THREE.Vector3(9, 0.1, 10),
        new THREE.Vector3(-9, 0.1, 10),
        new THREE.Vector3(-12, 0.1, 0),
        new THREE.Vector3(-9, 0.1, -10),
        new THREE.Vector3(9, 0.1, -10),
      ],
      true
    )
  );

  // Pipeline curve
  const pipeCurve = useRef(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-18, 1.2, 3),
      new THREE.Vector3(-8, 1.5, 5),
      new THREE.Vector3(2, 1.4, 2),
      new THREE.Vector3(12, 1.6, -1),
      new THREE.Vector3(20, 1.3, -3),
    ])
  );

  // Camera presets
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    switch (activeCameraPreset) {
      case 'tank':
        cam.position.set(-16, 8, -6);
        ctrl.target.set(-14, 2.5, -10);
        break;
      case 'rail':
        cam.position.set(0, 15, 16);
        ctrl.target.set(0, 1, 0);
        break;
      case 'road':
        cam.position.set(-8, 6, 14);
        ctrl.target.set(-2, 1, 6);
        break;
      case 'pipe':
        cam.position.set(4, 7, 7);
        ctrl.target.set(2, 1.5, 2);
        break;
      case 'door':
        cam.position.set(13, 4, -5);
        ctrl.target.set(9, 2, -7.5);
        break;
      case 'drone':
        cam.position.set(0, 28, 22);
        ctrl.target.set(0, 0, 0);
        break;
      case 'underwater':
        cam.position.set(vehicleRef.current ? vehicleRef.current.position.x - 3 : -12, 2, 8);
        ctrl.target.set(vehicleRef.current ? vehicleRef.current.position.x : -12, 1, 6);
        break;
      case 'assembly_line':
        cam.position.set(0, 8, 14);
        ctrl.target.set(0, 1.2, 0);
        break;
      case 'station_raw':
      case 'Conveyor_RawMaterial':
        cam.position.set(-18, 3.6, 4.2);
        ctrl.target.set(-18, 1.2, 0);
        break;
      case 'station_sewing':
      case 'SewingMachine_01':
        cam.position.set(-12, 3.6, 4.2);
        ctrl.target.set(-12, 1.2, 0);
        break;
      case 'station_glue':
      case 'GlueStation_01':
        cam.position.set(-6, 3.6, 4.2);
        ctrl.target.set(-6, 1.2, 0);
        break;
      case 'station_press':
      case 'SolePress_01':
        cam.position.set(0, 3.6, 4.2);
        ctrl.target.set(0, 1.2, 0);
        break;
      case 'station_qc':
      case 'QualityCheck_01':
        cam.position.set(6, 3.6, 4.2);
        ctrl.target.set(6, 1.2, 0);
        break;
      case 'station_packing':
      case 'PackingRobot_01':
        cam.position.set(12, 3.6, 4.2);
        ctrl.target.set(12, 1.2, 0);
        break;
      case 'station_warehouse':
      case 'FinishedWarehouse':
        cam.position.set(18, 4.5, 5.2);
        ctrl.target.set(18, 1.8, 0);
        break;
      default:
        cam.position.set(4, 16, 20);
        ctrl.target.set(0, 1.5, 0);
        break;
    }
    ctrl.update();
  }, [activeCameraPreset]);

  // Initial Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x030712); // Deep slate obsidian
    scene.fog = new THREE.FogExp2(0x030712, 0.015);

    // Camera
    const camera = new THREE.PerspectiveCamera(52, width / height, 0.2, 800);
    camera.position.set(6, 17, 22);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 3;
    controls.maxDistance = 80;
    controls.target.set(0, 1.5, 0);
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfef08a, 1.4);
    sunLight.position.set(24, 35, 18);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    const d = 26;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Secondary cyan industrial rim light
    const cyanLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    cyanLight.position.set(-20, 15, -15);
    scene.add(cyanLight);

    // Ground Grid & Floor
    const groundGeo = new THREE.PlaneGeometry(90, 90);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.85,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(80, 40, 0x1e293b, 0x0f172a);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // -------------------------------------------------------------
    // 1. WASAC K56 WATER RESERVOIR T-101 & PUMP STATION
    // -------------------------------------------------------------
    const tankGroup = new THREE.Group();
    tankGroup.position.set(-14, 0, -10);

    // Tank foundation
    const tankPlinth = new THREE.Mesh(
      new THREE.CylinderGeometry(3.6, 3.8, 0.4, 32),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 })
    );
    tankPlinth.position.y = 0.2;
    tankPlinth.receiveShadow = true;
    tankGroup.add(tankPlinth);

    // Transparent tank body
    const tankGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.2, 6.2, 32, 1, true),
      new THREE.MeshPhysicalMaterial({
        color: 0x67e8f9,
        transparent: true,
        opacity: 0.28,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.7,
        side: THREE.DoubleSide,
      })
    );
    tankGlass.position.y = 3.5;
    tankGroup.add(tankGlass);

    // Steel bands around tank
    for (let b = 1; b <= 4; b++) {
      const band = new THREE.Mesh(
        new THREE.TorusGeometry(3.22, 0.06, 8, 32),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.3 })
      );
      band.position.y = 0.4 + b * 1.3;
      band.rotation.x = Math.PI / 2;
      tankGroup.add(band);
    }

    // Dynamic water body inside tank
    const waterGeo = new THREE.CylinderGeometry(3.1, 3.1, 1, 32);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.75,
      roughness: 0.15,
      metalness: 0.1,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = 2.2;
    waterMeshRef.current = waterMesh;
    tankGroup.add(waterMesh);

    // Tank cap/roof with ventilation hatch
    const tankRoof = new THREE.Mesh(
      new THREE.ConeGeometry(3.4, 0.8, 32),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 })
    );
    tankRoof.position.y = 7.0;
    tankGroup.add(tankRoof);

    // Pump Station P-101 adjacent to tank
    const pumpGroup = new THREE.Group();
    pumpGroup.position.set(4.5, 0, 1.5);

    const pumpBase = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.4, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    pumpBase.position.y = 0.2;
    pumpGroup.add(pumpBase);

    // Centrifugal casing
    const pumpVolute = new THREE.Mesh(
      new THREE.TorusGeometry(0.7, 0.25, 16, 32),
      new THREE.MeshStandardMaterial({ color: 0x16a34a, metalness: 0.6, roughness: 0.3 })
    );
    pumpVolute.rotation.y = Math.PI / 2;
    pumpVolute.position.set(0, 0.9, 0);
    pumpGroup.add(pumpVolute);

    // Impeller
    const impeller = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 0.2, 6),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.2 })
    );
    impeller.rotation.x = Math.PI / 2;
    impeller.position.set(0, 0.9, 0);
    pumpImpellerRef.current = impeller;
    pumpGroup.add(impeller);

    // Electric motor housing (Siemens Blue / Green)
    const motorMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 1.6, 20),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.3 })
    );
    motorMesh.rotation.z = Math.PI / 2;
    motorMesh.position.set(1.4, 0.9, 0);
    pumpGroup.add(motorMesh);

    // Connecting pipe from tank to pump
    const pipeConnCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.6, 0),
      new THREE.Vector3(2.5, 0.6, 1),
      new THREE.Vector3(4.5, 0.9, 1.5),
    ]);
    const pipeConn = new THREE.Mesh(
      new THREE.TubeGeometry(pipeConnCurve, 20, 0.22, 12, false),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 })
    );
    tankGroup.add(pipeConn);
    tankGroup.add(pumpGroup);
    scene.add(tankGroup);

    // -------------------------------------------------------------
    // 2. RAILWAY LOOP & TRAIN LOCOMOTIVE
    // -------------------------------------------------------------
    const railPoints = railCurve.current.getPoints(200);
    const railTrackGeo = new THREE.BufferGeometry().setFromPoints(railPoints);
    const railLineInner = new THREE.Line(
      railTrackGeo,
      new THREE.LineBasicMaterial({ color: 0xfacc15, linewidth: 2 })
    );
    scene.add(railLineInner);

    // Wooden / Concrete ties around rail loop
    const tiesGroup = new THREE.Group();
    for (let i = 0; i < 90; i++) {
      const u = i / 90;
      const pt = railCurve.current.getPointAt(u);
      const tangent = railCurve.current.getTangentAt(u);
      const tie = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.08, 1.6),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 })
      );
      tie.position.copy(pt);
      tie.position.y = 0.04;
      tie.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
      tiesGroup.add(tie);
    }
    scene.add(tiesGroup);

    // Train locomotive group
    const trainGroup = new THREE.Group();
    // Engine body
    const trainBody = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 1.1, 1.1),
      new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.6, roughness: 0.3 })
    );
    trainBody.position.y = 0.8;
    trainBody.castShadow = true;
    trainGroup.add(trainBody);

    // Cabin
    const trainCab = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.8, 1.05),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    trainCab.position.set(-0.7, 1.7, 0);
    trainGroup.add(trainCab);

    // Hazard stripes
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(2.85, 0.18, 1.12),
      new THREE.MeshStandardMaterial({ color: 0x000000 })
    );
    stripe.position.set(0, 0.6, 0);
    trainGroup.add(stripe);

    // Train Headlight
    const headlight = new THREE.PointLight(0xfef08a, 1.8, 8);
    headlight.position.set(1.5, 0.8, 0);
    trainGroup.add(headlight);

    trainRef.current = trainGroup;
    scene.add(trainGroup);

    // Signal Light at Rail Station
    const signalPost = new THREE.Group();
    signalPost.position.set(11, 0, -3);
    const postPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 3.2, 12),
      new THREE.MeshStandardMaterial({ color: 0x475569 })
    );
    postPole.position.y = 1.6;
    signalPost.add(postPole);

    const postHousing = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.9, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x0f172a })
    );
    postHousing.position.set(0, 2.8, 0);
    signalPost.add(postHousing);

    const signalLightMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    signalLightMesh.position.set(0, 2.8, 0.2);
    signalLightRef.current = signalLightMesh;
    signalPost.add(signalLightMesh);
    scene.add(signalPost);

    // -------------------------------------------------------------
    // 3. ROAD & LOGISTICS TRUCK TRANSPORT
    // -------------------------------------------------------------
    const roadMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(64, 4.4),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.95 })
    );
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, 0.03, 7.5);
    roadMesh.receiveShadow = true;
    scene.add(roadMesh);

    // Road dashes
    const dashGroup = new THREE.Group();
    for (let x = -28; x <= 28; x += 3.5) {
      const dash = new THREE.Mesh(
        new THREE.PlaneGeometry(1.8, 0.15),
        new THREE.MeshBasicMaterial({ color: 0xfacc15 })
      );
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(x, 0.04, 7.5);
      dashGroup.add(dash);
    }
    scene.add(dashGroup);

    // Logistics Truck Group
    const truckGroup = new THREE.Group();
    truckGroup.position.set(-14, 0, 7.5);

    // Cabin
    const truckCab = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.2, 1.3),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.3 })
    );
    truckCab.position.set(1.4, 0.9, 0);
    truckCab.castShadow = true;
    truckGroup.add(truckCab);

    // Windshield
    const truckGlass = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.5, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1 })
    );
    truckGlass.position.set(1.95, 1.15, 0);
    truckGroup.add(truckGlass);

    // Cargo Container (K56 Container)
    const truckTrailer = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 1.4, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.3, roughness: 0.5 })
    );
    truckTrailer.position.set(-1.2, 1.1, 0);
    truckTrailer.castShadow = true;
    truckGroup.add(truckTrailer);

    // Wheels
    [-1.8, -0.6, 1.3].forEach((wx) => {
      [-0.75, 0.75].forEach((wz) => {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16),
          new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.9 })
        );
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(wx, 0.35, wz);
        truckGroup.add(wheel);
      });
    });

    truckRef.current = truckGroup;
    scene.add(truckGroup);

    // -------------------------------------------------------------
    // 4. K56 METHANE PIPELINE & INSPECTION ROVER
    // -------------------------------------------------------------
    const pipePoints = pipeCurve.current.getPoints(80);
    const pipeGeo = new THREE.TubeGeometry(pipeCurve.current, 60, 0.28, 16, false);
    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.85,
      roughness: 0.25,
    });
    const pipeMesh = new THREE.Mesh(pipeGeo, pipeMat);
    pipeMesh.castShadow = true;
    scene.add(pipeMesh);

    // Flange joints along the pipeline
    [0.1, 0.3, 0.5, 0.7, 0.9].forEach((u) => {
      const pt = pipeCurve.current.getPointAt(u);
      const flange = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.42, 0.1, 16),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.2 })
      );
      flange.position.copy(pt);
      scene.add(flange);
    });

    // Pipeline Inspection Rover Robot
    const roverMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 20, 20),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, metalness: 0.7 })
    );
    roverRef.current = roverMesh;
    scene.add(roverMesh);

    // -------------------------------------------------------------
    // 5. ACTUATORS (PNEUMATIC RMARE & ELECTRIC ICX)
    // -------------------------------------------------------------
    const actuatorGroup = new THREE.Group();
    actuatorGroup.position.set(-6, 0, -4);

    // Pneumatic Actuator
    const pneuBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 1.4, 24),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.7, roughness: 0.3 })
    );
    pneuBody.position.set(0, 1.4, 0);
    actuatorGroup.add(pneuBody);

    const pneuPiston = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 1.0, 16),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.9, roughness: 0.1 })
    );
    pneuPiston.position.set(0, 2.2, 0);
    pneumaticPistonRef.current = pneuPiston;
    actuatorGroup.add(pneuPiston);

    // Electric Actuator
    const elecBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1.2, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x0f766e, metalness: 0.6, roughness: 0.3 })
    );
    elecBody.position.set(2.2, 1.2, 0);
    actuatorGroup.add(elecBody);

    const elecDial = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.15, 20),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8 })
    );
    elecDial.rotation.x = Math.PI / 2;
    elecDial.position.set(2.2, 1.4, 0.45);
    actuatorGroup.add(elecDial);

    scene.add(actuatorGroup);

    // -------------------------------------------------------------
    // 6. CIRCULAR CONVEYOR (16 PALLETS)
    // -------------------------------------------------------------
    const circGroup = new THREE.Group();
    circGroup.position.set(0, 0, -1);

    // Circular base track
    const circTrack = new THREE.Mesh(
      new THREE.RingGeometry(4.6, 5.4, 48),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, side: THREE.DoubleSide })
    );
    circTrack.rotation.x = -Math.PI / 2;
    circTrack.position.y = 0.78;
    circGroup.add(circTrack);

    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const pallet = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.14, 0.55),
        new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0xfacc15 : 0x0ea5e9,
          metalness: 0.4,
          roughness: 0.4,
        })
      );
      pallet.position.set(Math.cos(angle) * 5.0, 0.88, Math.sin(angle) * 5.0);
      pallet.rotation.y = -angle;
      circGroup.add(pallet);
    }
    circGroupRef.current = circGroup;
    scene.add(circGroup);

    // -------------------------------------------------------------
    // 7. AUTOMATIC SLIDING DOOR & MICROWAVE RADAR SENSOR
    // -------------------------------------------------------------
    const doorStation = new THREE.Group();
    doorStation.position.set(10, 0, -8);

    // Door frame
    const doorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 2.8, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 })
    );
    doorFrame.position.set(0, 1.4, 0);
    doorStation.add(doorFrame);

    // Left door leaf
    const doorL = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 2.4, 1.3),
      new THREE.MeshPhysicalMaterial({
        color: 0x94a3b8,
        transparent: true,
        opacity: 0.55,
        roughness: 0.1,
        transmission: 0.8,
      })
    );
    doorL.position.set(0.05, 1.25, -0.65);
    doorLRef.current = doorL;
    doorStation.add(doorL);

    // Right door leaf
    const doorR = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 2.4, 1.3),
      new THREE.MeshPhysicalMaterial({
        color: 0x94a3b8,
        transparent: true,
        opacity: 0.55,
        roughness: 0.1,
        transmission: 0.8,
      })
    );
    doorR.position.set(0.05, 1.25, 0.65);
    doorRRef.current = doorR;
    doorStation.add(doorR);

    // Microwave Radar Sensor box
    const radarBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.25, 0.8),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.6 })
    );
    radarBox.position.set(-0.2, 2.65, 0);
    doorStation.add(radarBox);

    // Semi-transparent radar wave detection cone
    const radarCone = new THREE.Mesh(
      new THREE.ConeGeometry(1.8, 2.8, 24, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
      })
    );
    radarCone.rotation.x = Math.PI;
    radarCone.rotation.z = Math.PI / 4;
    radarCone.position.set(-1.2, 1.4, 0);
    radarConeRef.current = radarCone;
    doorStation.add(radarCone);

    scene.add(doorStation);

    // -------------------------------------------------------------
    // 8. HYBRID VEHICLE (FLYING WINGS + UNDERWATER CAR)
    // -------------------------------------------------------------
    const vehicleGroup = new THREE.Group();
    vehicleGroup.position.set(-12, 0.7, 5.5);

    // Aerodynamic car fuselage
    const bodyGeo = new THREE.BoxGeometry(1.8, 0.55, 0.95);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.85,
      roughness: 0.2,
    });
    const vehicleBody = new THREE.Mesh(bodyGeo, bodyMat);
    vehicleGroup.add(vehicleBody);

    // 360° Glass Dome
    const domeGeo = new THREE.SphereGeometry(0.45, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      transmission: 0.85,
      roughness: 0.1,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.set(0.1, 0.28, 0);
    vehicleGroup.add(dome);

    // Articulated Wings (Left & Right)
    const wingGeo = new THREE.BoxGeometry(0.9, 0.05, 1.1);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.3 });

    const wingL = new THREE.Mesh(wingGeo, wingMat);
    wingL.position.set(-0.2, 0.1, 1.0);
    wingLRef.current = wingL;
    vehicleGroup.add(wingL);

    const wingR = new THREE.Mesh(wingGeo, wingMat);
    wingR.position.set(-0.2, 0.1, -1.0);
    wingRRef.current = wingR;
    vehicleGroup.add(wingR);

    // Glowing thrusters
    [-0.3, 0.3].forEach((tz) => {
      const thruster = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.16, 0.4, 16),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      thruster.rotation.z = Math.PI / 2;
      thruster.position.set(-0.95, 0.0, tz);
      vehicleGroup.add(thruster);
    });

    vehicleRef.current = vehicleGroup;
    scene.add(vehicleGroup);

    // -------------------------------------------------------------
    // 9. 360° ACOUSTIC SURVEILLANCE RADAR RINGS
    // -------------------------------------------------------------
    const ringGeo = new THREE.RingGeometry(2.5, 2.7, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const acousticRing = new THREE.Mesh(ringGeo, ringMat);
    acousticRing.rotation.x = -Math.PI / 2;
    acousticRing.position.set(0, 0.15, 0);
    acousticRingRef.current = acousticRing;
    scene.add(acousticRing);

    // -------------------------------------------------------------
    // 10. VFD BILLBOARD HUD IN 3D SPACE
    // -------------------------------------------------------------
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    vfdBillboardCanvasRef.current = canvas;
    const vfdTexture = new THREE.CanvasTexture(canvas);
    vfdBillboardTextureRef.current = vfdTexture;

    const boardMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 1.8),
      new THREE.MeshBasicMaterial({ map: vfdTexture, transparent: true, side: THREE.DoubleSide })
    );
    boardMesh.position.set(-14, 8.8, -10);
    scene.add(boardMesh);

    // 11. FOOTWEAR 7-STATION AUTOMATION ASSEMBLY LINE
    assemblyRefs.current = createAssemblyLine3D(scene);

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, []);

  // Update dynamic VFD billboard canvas
  useEffect(() => {
    const canvas = vfdBillboardCanvasRef.current;
    const texture = vfdBillboardTextureRef.current;
    if (!canvas || !texture) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'rgba(10, 15, 30, 0.9)';
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, 504, 248);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 28px monospace';
    ctx.fillText('WINCC T-101 VFD DIGITAL TWIN', 30, 45);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 54px monospace';
    ctx.fillText(`${telemetry.vfdHz.toFixed(1)} Hz`, 30, 115);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 26px monospace';
    ctx.fillText(`RPM: ${telemetry.motorRpm} | PWR: ${telemetry.powerMw.toFixed(1)} MW`, 30, 165);

    ctx.fillStyle = plcIo.q00_contactor ? '#22c55e' : '#ef4444';
    ctx.font = 'bold 24px monospace';
    const statusText = plcIo.q00_contactor
      ? (plcIo.q02_fwd_drive ? 'STATUS: RUNNING [FWD ROAD]' : (plcIo.q03_rev_drive ? 'STATUS: RUNNING [REV PORT]' : 'STATUS: CONTACTOR ON - IDLE'))
      : 'STATUS: STOPPED (HOLD / BRAKE)';
    ctx.fillText(statusText, 30, 215);

    texture.needsUpdate = true;
  }, [telemetry.vfdHz, telemetry.motorRpm, telemetry.powerMw, plcIo.q00_contactor, plcIo.q02_fwd_drive, plcIo.q03_rev_drive]);

  // Main Render Animation Loop
  useEffect(() => {
    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      timeRef.current += 0.02;
      const t = timeRef.current;

      if (controlsRef.current) controlsRef.current.update();

      const isRunning = plcIo.q00_contactor;
      const isFwd = plcIo.q02_fwd_drive;
      const isRev = plcIo.q03_rev_drive;
      const speedScale = (telemetry.vfdHz / 50.0);

      // 1. Water Level in Tank T-101
      if (waterMeshRef.current) {
        const targetHeight = Math.max(0.4, (waterLab.tankLevelPercent / 100) * 5.6);
        waterMeshRef.current.scale.y = targetHeight;
        waterMeshRef.current.position.y = targetHeight / 2 + 0.4;

        // Subtle water color change if turbidity or chlorine changes
        const waterMat = waterMeshRef.current.material as THREE.MeshStandardMaterial;
        if (mode === 'underwater') {
          waterMat.color.setHex(0x0284c7);
        } else if (waterLab.turbidity > 3.0) {
          waterMat.color.setHex(0x0e7490);
        } else {
          waterMat.color.setHex(0x06b6d4);
        }
      }

      // 2. Pump Impeller Rotation
      if (pumpImpellerRef.current && isRunning) {
        pumpImpellerRef.current.rotation.z += 0.12 * Math.max(0.4, speedScale);
      }

      // 3. Train on Railway Loop
      if (trainRef.current && isRunning) {
        const trainSpeed = isFwd ? 0.003 * speedScale : (isRev ? -0.003 * speedScale : 0);
        trainProgress.current = (trainProgress.current + trainSpeed + 1) % 1;
        const pt = railCurve.current.getPointAt(trainProgress.current);
        const tangent = railCurve.current.getTangentAt(trainProgress.current);
        trainRef.current.position.copy(pt);
        trainRef.current.position.y = 0.55;
        trainRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), tangent);
      }

      // 4. Logistics Truck on Road
      if (truckRef.current && isRunning) {
        const roadSpeed = isFwd ? 0.08 * speedScale : (isRev ? -0.08 * speedScale : 0);
        truckProgress.current += roadSpeed;
        if (truckProgress.current > 26) truckProgress.current = -26;
        if (truckProgress.current < -26) truckProgress.current = 26;
        truckRef.current.position.x = truckProgress.current;
      }

      // 5. Rover on Pipeline K56
      if (roverRef.current) {
        const roverU = (t * 0.04) % 1;
        const roverPt = pipeCurve.current.getPointAt(roverU);
        roverRef.current.position.copy(roverPt);
        roverRef.current.position.y += 0.45;
      }

      // 6. Circular Conveyor
      if (circGroupRef.current && (isRunning || telemetry.conveyorRunning)) {
        circGroupRef.current.rotation.y += 0.012 * Math.max(0.3, speedScale);
      }

      // 7. Automatic Radar Door Sliding
      if (doorLRef.current && doorRRef.current) {
        const targetDoorOffset = telemetry.autoDoorOpen ? 0.85 : 0;
        doorLRef.current.position.z = THREE.MathUtils.lerp(doorLRef.current.position.z, -0.65 - targetDoorOffset, 0.08);
        doorRRef.current.position.z = THREE.MathUtils.lerp(doorRRef.current.position.z, 0.65 + targetDoorOffset, 0.08);
      }

      // Radar cone pulse
      if (radarConeRef.current) {
        const coneMat = radarConeRef.current.material as THREE.MeshBasicMaterial;
        coneMat.opacity = telemetry.radarMotionDetected ? 0.45 + Math.sin(t * 8) * 0.2 : 0.12;
      }

      // 8. Hybrid Vehicle (Drive / VTOL / Underwater)
      if (vehicleRef.current) {
        const veh = vehicleRef.current;
        // Position X tracks with truck or user controls
        if (mode === 'flight') {
          const targetY = THREE.MathUtils.clamp(telemetry.flightAltitudeM, 2, 14);
          veh.position.y = THREE.MathUtils.lerp(veh.position.y, targetY, 0.04);
          veh.position.x += (isFwd ? 0.06 : (isRev ? -0.06 : 0.02));
          if (veh.position.x > 24) veh.position.x = -24;

          // Flap articulation
          if (wingLRef.current && wingRRef.current) {
            const wingFlap = Math.sin(t * 6) * 0.15;
            wingLRef.current.rotation.z = wingFlap;
            wingRRef.current.rotation.z = -wingFlap;
          }
        } else if (mode === 'underwater') {
          veh.position.y = THREE.MathUtils.lerp(veh.position.y, 0.4, 0.05);
          const bodyMat = (veh.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
          bodyMat.color.setHex(0x22d3ee);
        } else {
          // Ground drive
          veh.position.y = THREE.MathUtils.lerp(veh.position.y, 0.7, 0.08);
          if (truckRef.current) {
            veh.position.x = truckRef.current.position.x - 3.5;
          }
          if (wingLRef.current && wingRRef.current) {
            wingLRef.current.rotation.z = 0;
            wingRRef.current.rotation.z = 0;
          }
        }
      }

      // 9. Pneumatic Piston stroke
      if (pneumaticPistonRef.current) {
        pneumaticPistonRef.current.position.y = 2.2 + Math.sin(t * 2) * 0.25;
      }

      // 10. Acoustic Surveillance radar rings
      if (acousticRingRef.current) {
        acousticRingRef.current.scale.setScalar(1 + (Math.sin(t * 3) + 1) * 0.4);
        const ringMat = acousticRingRef.current.material as THREE.MeshBasicMaterial;
        ringMat.opacity = 0.15 + (Math.sin(t * 3) + 1) * 0.2;
      }

      // 11. Signal Light
      if (signalLightRef.current) {
        const lightMat = signalLightRef.current.material as THREE.MeshBasicMaterial;
        lightMat.color.setHex(isRunning ? 0x22c55e : 0xef4444);
      }

      // 12. Footwear 7-Station Automation Line Animation
      const al = assemblyRefs.current;
      if (al) {
        const isLineActive = assemblyLine ? assemblyLine.lineRunning : isRunning;
        if (isLineActive) {
          // Station 02: Sewing needle reciprocation
          al.needleMesh.position.y = 1.35 + Math.sin(t * 22) * 0.12;

          // Station 03: Glue dispenser XYZ nozzle path
          al.glueNozzleMesh.position.z = Math.sin(t * 5) * 0.25;

          // Station 04: Hydraulic sole press compression cycle
          const pressStroke = Math.max(0, Math.sin(t * 2.4)) * 0.35;
          al.pressRamMesh.position.y = 1.9 - pressStroke;

          // Station 05: QC optical laser sweeping
          al.qcLaserMesh.position.x = Math.sin(t * 4) * 0.35;

          // Station 06: Packing robot arm articulation
          al.robotBaseMesh.rotation.y = Math.sin(t * 1.6) * 0.65;
          al.robotArmMesh.rotation.x = -0.6 + Math.sin(t * 1.6) * 0.25;

          // Station 07: AS/RS stacker crane lift carriage
          al.warehouseLiftMesh.position.y = 0.8 + (Math.sin(t * 0.8) + 1) * 1.1;

          // Moving workpieces along conveyor
          al.workpieces.forEach((wp) => {
            wp.position.x += 0.04;
            if (wp.position.x > 20) {
              wp.position.x = -20;
            }
          });
        }

        // Active station ring pulse
        if (assemblyLine?.activeStationId && al.stationHighlights[assemblyLine.activeStationId]) {
          const ring = al.stationHighlights[assemblyLine.activeStationId];
          ring.scale.setScalar(1 + (Math.sin(t * 4) + 1) * 0.08);
          (ring.material as THREE.MeshBasicMaterial).opacity = 0.4 + (Math.sin(t * 4) + 1) * 0.25;
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animFrameId.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [plcIo, telemetry, waterLab, mode, assemblyLine]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none"
      style={{ touchAction: 'none' }}
    />
  );
};
