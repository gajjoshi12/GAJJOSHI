"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Home() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return; // ✅ avoid null errors

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      5000
    );
    camera.position.z = 800;

    // --------- Star Texture ----------
    function makeStarTexture(size = 64) {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2
      );
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(0.3, "rgba(200,200,255,0.8)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(canvas);
    }
    const starTexture = makeStarTexture();

    // --------- Create Starfield ----------
    function createStarfield(count, radius, size) {
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const phi = Math.acos(2 * Math.random() - 1);
        const theta = 2 * Math.PI * Math.random();
        const r = radius * Math.random();
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        size,
        map: starTexture,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      });
      return new THREE.Points(geo, mat);
    }

const starsNear = createStarfield(2000, 1500, 10); // fewer near stars
const starsFar = createStarfield(4000, 3000, 4);   // fewer far stars

    scene.add(starsNear);
    scene.add(starsFar);

    // --------- Nebula Clouds ----------
    function makeNebula(color1, color2, scale, position) {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1024;
      const ctx = canvas.getContext("2d");
      const grd = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
      grd.addColorStop(0, color1);
      grd.addColorStop(0.4, color2);
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 1024, 1024);
      const texture = new THREE.CanvasTexture(canvas);

      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: texture,
          blending: THREE.AdditiveBlending,
          transparent: true,
        })
      );
      sprite.scale.set(scale, scale * 0.6, 1);
      sprite.position.set(...position);
      return sprite;
    }

    const nebula1 = makeNebula(
      "rgba(180,120,255,0.6)",
      "rgba(60,20,120,0.2)",
      2500,
      [-800, 300, -1000]
    );
    const nebula2 = makeNebula(
      "rgba(255,180,140,0.6)",
      "rgba(80,20,60,0.2)",
      2000,
      [1000, -200, -800]
    );

    scene.add(nebula1);
    scene.add(nebula2);

    // --------- Resize ----------
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // --------- Mouse Parallax ----------
    let mouseX = 0,
      mouseY = 0;
    document.addEventListener("mousemove", (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // --------- Animate ----------
    const animate = () => {
      requestAnimationFrame(animate);

      starsNear.rotation.y += 0.0005;
      starsFar.rotation.y += 0.0002;
      nebula1.rotation.z += 0.0001;
      nebula2.rotation.z -= 0.0001;

      camera.position.x += (mouseX * 300 - camera.position.x) * 0.01;
      camera.position.y += (mouseY * 200 - camera.position.y) * 0.01;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <main>
      {/* Background Canvas */}
      <div ref={mountRef} style={{ position: "fixed", inset: 0, zIndex: -1 }} />

      {/* Portfolio Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10, // ✅ stays above background
          height: "50vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
       <h1
  style={{
    fontSize: "64px",
    fontWeight: "900",
    background: "linear-gradient(90deg, #fff, #a0e7ff, #7f7fff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: "0 0 40px rgba(160,230,255,0.6)",
    margin: "0",
    opacity: 0.1, // super dim initially
    filter: "brightness(20%)", // extra dim
    animation: "fadeInBright 3s ease forwards", // fade-in animation
  }}
>

          🚀GAJ JOSHI
        </h1>

        {/* <p
          style={{
            fontSize: "28px",
            marginTop: "20px",
            color: "rgba(255,255,255,0.9)",
            textShadow: "0 0 20px rgba(255,255,255,0.3)",
          }}
        >
          Exploring the universe of code ✨
        </p> */}
      </div>
      <style jsx>{`
  @keyframes fadeInBright {
    0% {
      opacity: 0.1;
      filter: brightness(20%);
    }
    100% {
      opacity: 1;
      filter: brightness(100%);
    }
  }
`}</style>

    </main>
    
  );
}
