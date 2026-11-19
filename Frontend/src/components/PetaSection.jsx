import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Center,
  Environment,
  Html,
  OrbitControls,
  useGLTF,
  useProgress
} from '@react-three/drei';
import wilayahData from '../data/wilayah.json';
import './PetaSection.css';

const MODEL_PATH = '/models/peta_jabar.glb';
const ROTATION_SPEED = 0.15;
const HIGHLIGHT_COLOR = '#fbbf24';
const POPUP_TRANSITION_MS = 260;

function LoadingIndicator() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="peta-loading" role="status">
        Memuat peta 3D... {Math.round(progress)}%
      </div>
    </Html>
  );
}

function getWilayahMesh(object) {
  let current = object;
  while (current) {
    if (current.isMesh && current.name.startsWith('Wilayah_')) return current;
    current = current.parent;
  }
  return null;
}

function ModelPeta({ popupOpen, onSelectWilayah, onHoverChange }) {
  const { scene: originalScene } = useGLTF(MODEL_PATH);
  const rotationRef = useRef();
  const hoveredMeshRef = useRef(null);

  // Material wilayah di-clone agar highlight hanya mengubah satu kabupaten/kota.
  const scene = useMemo(() => {
    const clonedScene = originalScene.clone(true);
    clonedScene.traverse((object) => {
      if (!object.isMesh || !object.name.startsWith('Wilayah_')) return;

      object.material = Array.isArray(object.material)
        ? object.material.map((material) => material.clone())
        : object.material.clone();

      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        if (material.color) material.userData.petaOriginalColor = material.color.clone();
      });
    });
    return clonedScene;
  }, [originalScene]);

  useFrame((_, delta) => {
    if (rotationRef.current && !popupOpen) {
      rotationRef.current.rotation.y += ROTATION_SPEED * delta;
    }
  });

  const resetHighlight = (mesh) => {
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      if (material.color && material.userData.petaOriginalColor) {
        material.color.copy(material.userData.petaOriginalColor);
      }
    });
  };

  const handlePointerOver = (event) => {
    event.stopPropagation();
    const mesh = getWilayahMesh(event.object);
    if (!mesh) return;

    if (hoveredMeshRef.current && hoveredMeshRef.current !== mesh) {
      resetHighlight(hoveredMeshRef.current);
    }

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      if (material.color) material.color.set(HIGHLIGHT_COLOR);
    });
    hoveredMeshRef.current = mesh;
    onHoverChange(true);
  };

  const handlePointerOut = (event) => {
    event.stopPropagation();
    const mesh = getWilayahMesh(event.object);
    if (!mesh) return;

    if (hoveredMeshRef.current === mesh) {
      resetHighlight(mesh);
      hoveredMeshRef.current = null;
      onHoverChange(false);
    }
  };

  const handleClick = (event) => {
    event.stopPropagation();
    const mesh = getWilayahMesh(event.object);
    if (mesh) onSelectWilayah(mesh.name);
  };

  return (
    <group ref={rotationRef}>
      <Center>
        <primitive
          object={scene}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        />
      </Center>
    </group>
  );
}

useGLTF.preload(MODEL_PATH);

export default function PetaSection({ compact = false }) {
  const [selectedName, setSelectedName] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [isHoveringWilayah, setIsHoveringWilayah] = useState(false);

  useEffect(() => {
    if (!popupOpen && selectedName) {
      const timer = window.setTimeout(
        () => setSelectedName(null),
        POPUP_TRANSITION_MS
      );
      return () => window.clearTimeout(timer);
    }
  }, [popupOpen, selectedName]);

  useEffect(() => {
    if (!popupOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setPopupOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [popupOpen]);

  const wilayahTerpilih = selectedName
    ? wilayahData[selectedName] || {
      nama: selectedName,
      deskripsi: 'Data belum diisi'
    }
    : null;

  const pilihWilayah = (name) => {
    setSelectedName(name);
    setPopupOpen(true);
  };

  return (
    <section
      className={`peta-section${compact ? ' peta-section--compact' : ''}${isHoveringWilayah ? ' is-hovering-wilayah' : ''}`}
      aria-labelledby="peta-section-title"
    >
      <div className="peta-section__canvas" aria-label="Peta 3D interaktif Jawa Barat">
        <Canvas
          camera={{
            position: compact ? [0, 11, 14] : [0, 7, 9],
            fov: compact ? 42 : 36
          }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={1.7} />
          <directionalLight position={[5, 8, 6]} intensity={2.2} />
          <Suspense fallback={<LoadingIndicator />}>
            <ModelPeta
              popupOpen={popupOpen}
              onSelectWilayah={pilihWilayah}
              onHoverChange={setIsHoveringWilayah}
            />
            <Environment preset="city" />
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>

      <div className="peta-section__heading">
        <span className="peta-section__eyebrow">Jelajahi Jawa Barat</span>
        <h2 id="peta-section-title">Peta Sebaran UMKM</h2>
        <p>Pilih kabupaten atau kota untuk melihat informasinya.</p>
      </div>
      <div className="peta-section__hint" aria-live="polite">
        Arahkan kursor, lalu klik wilayah pada peta
      </div>

      <div
        className={`peta-popup${popupOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="peta-popup-title"
        aria-hidden={!popupOpen}
      >
        {wilayahTerpilih && (
          <>
            <div className="peta-popup__topline">
              <span className="peta-section__eyebrow">Informasi wilayah</span>
              <button
                type="button"
                className="peta-popup__close"
                onClick={() => setPopupOpen(false)}
                aria-label="Tutup informasi wilayah"
              >
                ×
              </button>
            </div>
            <h3 id="peta-popup-title">{wilayahTerpilih.nama}</h3>
            <div className="peta-popup__stat">
              <strong>
                {typeof wilayahTerpilih.umkm === 'number'
                  ? wilayahTerpilih.umkm.toLocaleString('id-ID')
                  : '—'}
              </strong>
              <span>UMKM terdata</span>
            </div>
            <p>{wilayahTerpilih.deskripsi}</p>
            <button
              type="button"
              className="peta-popup__button"
              onClick={() => setPopupOpen(false)}
            >
              Tutup
            </button>
          </>
        )}
      </div>
    </section>
  );
}
