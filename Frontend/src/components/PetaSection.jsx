import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Bounds,
  Environment,
  Html,
  OrbitControls,
  useGLTF,
  useProgress
} from '@react-three/drei';
import * as THREE from 'three';
import wilayahData from '../data/wilayah.json';
import './PetaSection.css';

const MODEL_PATH = '/models/peta_jabar.glb';
const ROTATION_SPEED = 0.15;
const HIGHLIGHT_COLOR = '#fbbf24';
const POPUP_TRANSITION_MS = 260;
const WILAYAH = wilayahData;

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

function normalizeWilayahName(name) {
  if (!name) return '';
  return name.replace(/\.\d+$/, '').trim();
}

function resolveWilayahKey(name) {
  const base = normalizeWilayahName(name);
  const candidates = [name, base, base.replace(/\s+/g, '_'), base.replace(/_+/g, '_')];
  for (const candidate of candidates) {
    if (candidate && WILAYAH[candidate]) return candidate;
  }
  return null;
}

function getWilayahMesh(object) {
  let current = object;
  while (current) {
    if (current.isMesh && resolveWilayahKey(current.name)) return current;
    current = current.parent;
  }
  return null;
}

function getWilayahHit(event) {
  const hits = event.intersections?.length ? event.intersections : [{ object: event.object }];
  for (const hit of hits) {
    const mesh = getWilayahMesh(hit.object);
    if (!mesh) continue;
    const key = resolveWilayahKey(mesh.name);
    if (key) return { mesh, key };
  }
  return null;
}

function ModelPeta({ popupOpen, onSelectWilayah, onHoverChange }) {
  const { scene: originalScene } = useGLTF(MODEL_PATH);
  const rotationRef = useRef();
  const hoveredMeshRef = useRef(null);

  // Clone material mesh wilayah agar hover/emissive tidak memengaruhi wilayah lain (material bisa shared dari Blender).
  const scene = useMemo(() => {
    const clonedScene = originalScene.clone(true);
    clonedScene.traverse((object) => {
      if (!object.isMesh || !resolveWilayahKey(object.name)) return;

      object.material = Array.isArray(object.material)
        ? object.material.map((material) => material.clone())
        : object.material.clone();

      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        if ('emissive' in material) {
          material.userData.petaOriginalEmissive = material.emissive.clone();
          material.userData.petaOriginalEmissiveIntensity =
            material.emissiveIntensity ?? 1;
        }
      });
    });
    return clonedScene;
  }, [originalScene]);

  // Pewarnaan wilayah + (opsional) garis permukaan atas, dijalankan sekali per scene.
  useEffect(() => {
    const palette = ['#5f9f63', '#4f8f58', '#73ad6b', '#3f7f4f'];
    const meshNames = [];
    const wilayahMeshes = [];
    const addedBorders = [];

    scene.traverse((object) => {
      if (!object.isMesh) return;
      meshNames.push(object.name);
      if (resolveWilayahKey(object.name)) wilayahMeshes.push(object);
    });

    const sortedWilayah = [...wilayahMeshes].sort((a, b) => {
      const ka = resolveWilayahKey(a.name) || a.name;
      const kb = resolveWilayahKey(b.name) || b.name;
      return ka.localeCompare(kb);
    });

    sortedWilayah.forEach((object, index) => {
      if (!object.userData.petaBaseTinted) {
        const shade = palette[index % palette.length];
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          if (material.color) material.color.set(shade);
        });
        object.userData.petaBaseTinted = true;
      }

      // Opsional (B.4): garis tipis dari segitiga permukaan yang normalnya menghadap atas (+Y).
      if (!object.userData.petaBorderTried) {
        object.userData.petaBorderTried = true;
        const source = object.geometry;
        const position = source.attributes.position;
        if (!position) return;
        const indexAttr = source.index;
        const triCount = indexAttr ? indexAttr.count / 3 : position.count / 3;
        const topPositions = [];
        const a = new THREE.Vector3();
        const b = new THREE.Vector3();
        const c = new THREE.Vector3();
        const ab = new THREE.Vector3();
        const ac = new THREE.Vector3();
        const normal = new THREE.Vector3();

        const getIndex = (i) => (indexAttr ? indexAttr.getX(i) : i);
        for (let t = 0; t < triCount; t++) {
          const i0 = getIndex(t * 3);
          const i1 = getIndex(t * 3 + 1);
          const i2 = getIndex(t * 3 + 2);
          a.fromBufferAttribute(position, i0);
          b.fromBufferAttribute(position, i1);
          c.fromBufferAttribute(position, i2);
          ab.subVectors(b, a);
          ac.subVectors(c, a);
          normal.crossVectors(ab, ac).normalize();
          if (normal.y > 0.7) {
            topPositions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
          }
        }

        if (topPositions.length > 0) {
          const topGeom = new THREE.BufferGeometry();
          topGeom.setAttribute('position', new THREE.Float32BufferAttribute(topPositions, 3));
          const edges = new THREE.EdgesGeometry(topGeom, 1);
          const segCount = (edges.attributes.position?.count || 0) / 2;
          console.log('[PETA DEBUG] segmen garis atas', resolveWilayahKey(object.name), segCount);
          if (segCount > 0) {
            const lineMaterial = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.75 });
            const border = new THREE.LineSegments(edges, lineMaterial);
            if (!object.geometry.boundingBox) object.geometry.computeBoundingBox();
            const h = object.geometry.boundingBox.max.y - object.geometry.boundingBox.min.y;
            border.position.y += (h || 1) * 0.003;
            border.raycast = () => null;
            object.add(border);
            addedBorders.push({ border, edges, topGeom, lineMaterial });
          } else {
            edges.dispose();
          }
          topGeom.dispose();
        } else {
          console.log('[PETA DEBUG] segmen garis atas', resolveWilayahKey(object.name), 0);
        }
      }
    });

    console.log('[PETA DEBUG] semua mesh:', meshNames);

    return () => {
      addedBorders.forEach(({ border, edges, lineMaterial }) => {
        border.parent?.remove(border);
        edges.dispose();
        lineMaterial.dispose();
      });
    };
  }, [scene]);

  useFrame((_, delta) => {
    if (rotationRef.current && !popupOpen) {
      rotationRef.current.rotation.y += ROTATION_SPEED * delta;
    }
  });

  const resetHighlight = (mesh) => {
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      if ('emissive' in material && material.userData.petaOriginalEmissive) {
        material.emissive.copy(material.userData.petaOriginalEmissive);
        material.emissiveIntensity =
          material.userData.petaOriginalEmissiveIntensity ?? 1;
      }
    });
  };

  const handlePointerOver = (event) => {
    event.stopPropagation();
    const hit = getWilayahHit(event);
    if (!hit) {
      if (hoveredMeshRef.current) {
        resetHighlight(hoveredMeshRef.current);
        hoveredMeshRef.current = null;
      }
      onHoverChange(false);
      document.body.style.cursor = 'auto';
      return;
    }

    if (hoveredMeshRef.current && hoveredMeshRef.current !== hit.mesh) {
      resetHighlight(hoveredMeshRef.current);
    }

    const materials = Array.isArray(hit.mesh.material)
      ? hit.mesh.material
      : [hit.mesh.material];
    materials.forEach((material) => {
      if ('emissive' in material) {
        material.emissive.set(HIGHLIGHT_COLOR);
        material.emissiveIntensity = 0.35;
      }
    });
    hoveredMeshRef.current = hit.mesh;
    onHoverChange(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    if (hoveredMeshRef.current) {
      resetHighlight(hoveredMeshRef.current);
      hoveredMeshRef.current = null;
    }
    onHoverChange(false);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (event) => {
    event.stopPropagation();
    console.log('[PETA DEBUG] klik object:', event.object?.name);
    const hit = getWilayahHit(event);
    if (!hit) return;
    console.log('[PETA DEBUG] wilayah cocok:', hit.key, 'mesh:', hit.mesh.name);
    onSelectWilayah(hit.key);
  };

  return (
    <group ref={rotationRef}>
      <primitive
        object={scene}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);

export default function PetaSection({ compact = false }) {
  const [selectedName, setSelectedName] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [isHoveringWilayah, setIsHoveringWilayah] = useState(false);
  const [fotoError, setFotoError] = useState(false);
  const popupRef = useRef(null);

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
    const handlePointerDown = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setPopupOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [popupOpen]);

  useEffect(() => {
    setFotoError(false);
  }, [selectedName]);

  const wilayahTerpilih = selectedName
    ? WILAYAH[selectedName] || {
      nama: selectedName,
      produk: 'Data belum diisi',
      unggulan: 0,
      foto: ''
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
          camera={{ position: [0, 8, 12], fov: 40 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={1.7} />
          <directionalLight position={[5, 8, 6]} intensity={2.2} />
          <Suspense fallback={<LoadingIndicator />}>
            <Bounds fit clip observe margin={1.05}>
              <ModelPeta
                popupOpen={popupOpen}
                onSelectWilayah={pilihWilayah}
                onHoverChange={setIsHoveringWilayah}
              />
            </Bounds>
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
            {wilayahTerpilih.foto && !fotoError ? (
              <img
                key={selectedName}
                src={wilayahTerpilih.foto}
                alt={`${wilayahTerpilih.produk || 'Produk'} - ${wilayahTerpilih.nama}`}
                loading="lazy"
                className="peta-popup__foto"
                onError={() => setFotoError(true)}
              />
            ) : (
              <div className="peta-popup__foto peta-popup__foto--placeholder" aria-label="Foto belum tersedia">
                Foto belum tersedia
              </div>
            )}
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
              <strong>{wilayahTerpilih.produk || '—'}</strong>
              <span>Produk unggulan</span>
            </div>
            <p>
              {wilayahTerpilih.unggulan > 0
                ? `Wilayah unggulan (Top ${wilayahTerpilih.unggulan})`
                : 'Bukan wilayah unggulan'}
            </p>
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
