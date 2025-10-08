"use client";
import { useEffect, useRef , useState} from "react";
import * as THREE from "three";
import { SiNextdotjs, SiReact, SiBootstrap, SiTailwindcss } from "react-icons/si";
    function PopUp({ text, position }) {
  return (
    <div
      style={{
        position: "fixed",       // floats on screen
        left: position.x,        // X position of mouse
        top: position.y,         // Y position of mouse
        transform: "translate(-50%, -100%)",
        background: "rgba(20, 20, 40, 0.8)",  // dark, semi-transparent
        border: "1px solid rgba(255,255,255,0.3)",
        borderRadius: "12px",
        padding: "12px 16px",
        color: "#fff",
        fontSize: "14px",
        textAlign: "center",
        pointerEvents: "none",  // so it doesn’t block mouse
        boxShadow: "0 0 20px rgba(160, 230, 255, 0.5)",
        backdropFilter: "blur(4px)", // blurry background
        animation: "fadeInPop 0.3s ease forwards",
        zIndex: 20,
      }}
    >
      {text}
    </div>
  );
}



export default function Home() {
  const mountRef = useRef(null);
  const [hovered, setHovered] = useState(null);    // which tech is hovered
const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });  // mouse position

const [page, setPage] = useState(0); // 0 = GAJ JOSHI, 1 = Next Page
const touchStartX = useRef(0);
const touchEndX = useRef(0);

const handleTouchStart = (e) => {
  touchStartX.current = e.touches[0].clientX;
};

const handleTouchEnd = (e) => {
  touchEndX.current = e.changedTouches[0].clientX;
  const deltaX = touchEndX.current - touchStartX.current;

if (deltaX > 50) {
  setPage((prev) => Math.max(0, prev - 1)); // swipe right → go back
} else if (deltaX < -50) {
  setPage((prev) => Math.min(4, prev + 1)); // swipe left → go forward (max 2 pages now)
}

};



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
<main
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
  style={{ overflow: "hidden" }}
>
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
{/* PAGE 0 - Intro */}
{page === 0 && (
  <h1
    style={{
      fontSize: "64px",
      fontWeight: "900",
      background: "linear-gradient(90deg, #fff, #a0e7ff, #7f7fff)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      textShadow: "0 0 40px rgba(160,230,255,0.6)",
      margin: "0",
      opacity: 0.1,
      animation: "fadeInGlow 3s ease forwards",
    }}
  >
    🚀GAJ JOSHI
  </h1>
)}

{/* PAGE 1 - Frontend */}
{page === 1 && (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "20px",
      color: "white",
      textAlign: "center",
      animation: "fadeIn 1s ease forwards",
    }}
  >
    <h1
      style={{
        fontSize: "48px",
        fontWeight: "800",
        textShadow: "0 0 30px rgba(255,255,255,0.6)",
        margin: 0,
      }}
    >
      FrontEnd
    </h1>

    {/* Tech Buttons */}
    <div
      style={{
        display: "flex",
        gap: "25px",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {[
        { name: "Next JS", icon: <SiNextdotjs size={28} /> },
        { name: "React JS", icon: <SiReact size={28} style={{ color: "#61DBFB", animation: "spin 8s linear infinite" }} /> },
        { name: "Bootstrap", icon: <SiBootstrap size={28} style={{ color: "#7952B3" }} /> },
        { name: "Tailwind CSS", icon: <SiTailwindcss size={28} style={{ color: "#38BDF8" }} /> },
        { name: "ShadCN", icon: <img src="https://ui.shadcn.com/favicon.ico" alt="ShadCN" style={{ width: "28px", height: "28px" }} /> },
      ].map((tech, index) => (
        <div
          key={tech.name}
          onMouseEnter={(e) => {
            setHovered(tech.name);                       // which tech is hovered
            setPopupPos({ x: e.clientX, y: e.clientY }); // track mouse
          }}
          onMouseLeave={() => setHovered(null)}         // hide popup
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 20px",
            border: "2px solid rgba(255,255,255,0.3)",
            borderRadius: "12px",
            fontWeight: "600",
            fontSize: "18px",
            textShadow: "0 0 10px rgba(255,255,255,0.3)",
            opacity: 0,
            transform: "translateY(20px)",
            animation: `slideUp 0.6s ease forwards ${index * 0.3}s`,
            background: "rgba(255,255,255,0.05)",
            boxShadow: "0 0 20px rgba(255,255,255,0.2)",
            cursor: "pointer",
          }}
        >
          {tech.icon} {tech.name}
        </div>
      ))}
    </div>

    {/* Hover Pop-up */}
    {hovered && (
      <PopUp
        text={
          hovered === "Next JS" ? "Built SSR pages and optimized routes" :
          hovered === "React JS" ? "Created dynamic components and hooks-based architecture" :
          hovered === "Bootstrap" ? "Designed responsive layouts and UI grids" :
          hovered === "Tailwind CSS" ? "Styled components with utility-first approach" :
          hovered === "ShadCN" ? "Integrated ready UI components with React" :
          ""
        }
        position={popupPos}
      />
    )}
  </div>
)}

{/* PAGE 2 - Backend */}
{page === 2 && (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "20px",
      color: "white",
      textAlign: "center",
      animation: "fadeIn 1s ease forwards",
    }}
  >
    <h1
      style={{
        fontSize: "48px",
        fontWeight: "800",
        textShadow: "0 0 30px rgba(255,255,255,0.6)",
        margin: 0,
      }}
    >
      BackEnd
    </h1>
    <div
      style={{
        display: "flex",
        gap: "25px",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {[
        { name: "Django", icon: <img src="https://static.djangoproject.com/img/logos/django-logo-negative.png" alt="Django" style={{ width: "28px", height: "28px" }} /> },
        { name: "Node.js", icon: <img src="https://nodejs.org/static/images/logo.svg" alt="Node.js" style={{ width: "28px", height: "28px" }} /> },
        { name: "ASP.NET", icon: <img src="https://upload.wikimedia.org/wikipedia/commons/e/ee/.NET_Core_Logo.svg" alt="ASP.NET" style={{ width: "28px", height: "28px" }} /> },
        { name: "Python", icon: <img src="https://www.python.org/static/community_logos/python-logo.png" alt="Python" style={{ width: "28px", height: "28px" }} /> },
        { name: "SQL", icon: <img src="https://upload.wikimedia.org/wikipedia/commons/8/87/Sql_data_base_with_logo.png" alt="SQL" style={{ width: "28px", height: "28px" }} /> },
      ].map((tech, index) => (
        <div
          key={tech.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 20px",
            border: "2px solid rgba(255,255,255,0.3)",
            borderRadius: "12px",
            fontWeight: "600",
            fontSize: "18px",
            textShadow: "0 0 10px rgba(255,255,255,0.3)",
            opacity: 0,
            transform: "translateY(20px)",
            animation: `slideUp 0.6s ease forwards ${index * 0.3}s`,
            background: "rgba(255,255,255,0.05)",
            boxShadow: "0 0 20px rgba(255,255,255,0.2)",
          }}
        >
          {tech.icon} {tech.name}
        </div>
      ))}
    </div>
  </div>
)}
{/* PAGE 4 - Databases */}
{page === 3 && (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "20px",
      color: "white",
      textAlign: "center",
      animation: "fadeIn 1s ease forwards",
    }}
  >
    <h1
      style={{
        fontSize: "48px",
        fontWeight: "800",
        textShadow: "0 0 30px rgba(255,255,255,0.6)",
        margin: 0,
      }}
    >
      Databases
    </h1>
    <div
      style={{
        display: "flex",
        gap: "25px",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {[
        { name: "MySQL", icon: <img src="https://www.mysql.com/common/logos/logo-mysql-170x115.png" alt="MySQL" style={{ width: "28px", height: "28px" }} /> },
        { name: "PostgreSQL", icon: <img src="https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg" alt="PostgreSQL" style={{ width: "28px", height: "28px" }} /> },
        { name: "MongoDB", icon: <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/MongoDB_Logo.svg" alt="MongoDB" style={{ width: "28px", height: "28px" }} /> },
        { name: "SQLite", icon: <img src="https://www.sqlite.org/images/sqlite370_banner.gif" alt="SQLite" style={{ width: "28px", height: "28px" }} /> },
        { name: "OracleDB", icon: <img src="https://upload.wikimedia.org/wikipedia/en/6/68/Oracle_SQL_Developer_logo.svg" alt="OracleDB" style={{ width: "28px", height: "28px" }} /> },
      ].map((db, index) => (
        <div
          key={db.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 20px",
            border: "2px solid rgba(255,255,255,0.3)",
            borderRadius: "12px",
            fontWeight: "600",
            fontSize: "18px",
            textShadow: "0 0 10px rgba(255,255,255,0.3)",
            opacity: 0,
            transform: "translateY(20px)",
            animation: `slideUp 0.6s ease forwards ${index * 0.3}s`,
            background: "rgba(255,255,255,0.05)",
            boxShadow: "0 0 20px rgba(255,255,255,0.2)",
          }}
        >
          {db.icon} {db.name}
        </div>
      ))}
    </div>
  </div>
)}
{page === 4 && (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "20px",
      color: "white",
      textAlign: "center",
      animation: "fadeIn 1s ease forwards",
    }}
  >
    <h1
      style={{
        fontSize: "48px",
        fontWeight: "800",
        textShadow: "0 0 30px rgba(255,255,255,0.6)",
        margin: 0,
      }}
    >
      Game Engines
    </h1>

    <div
      style={{
        display: "flex",
        gap: "25px",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {[
        { name: "Unreal Engine", icon: <img src="./unreal.png" style={{ width: "28px", height: "28px", animation: "float 4s ease-in-out infinite" }} /> },
        { name: "Unity", icon: <img src="./unity.png" style={{ width: "28px", height: "28px", animation: "float 5s ease-in-out infinite" }} /> },
      ].map((tech, index) => (
        <div
          key={tech.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 20px",
            border: "2px solid rgba(255,255,255,0.3)",
            borderRadius: "12px",
            fontWeight: "600",
            fontSize: "18px",
            textShadow: "0 0 10px rgba(255,255,255,0.3)",
            opacity: 0,
            transform: "translateY(20px)",
            animation: `slideUp 0.6s ease forwards ${index * 0.3}s`,
            background: "rgba(255,255,255,0.05)",
            boxShadow: "0 0 20px rgba(255,255,255,0.2)",
          }}
        >
          {tech.icon} {tech.name}
        </div>
      ))}
    </div>
  </div>
)}



       
      </div>
     
<style jsx>{`
@keyframes fadeInPop {
  0% { opacity: 0; transform: translate(-50%, -110%) scale(0.9); }
  100% { opacity: 1; transform: translate(-50%, -100%) scale(1); }
}


@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

  @keyframes fadeInGlow {
    0% {
      opacity: 0.1;
      text-shadow: 0 0 5px rgba(160, 230, 255, 0.2);
    }
    50% {
      opacity: 0.8;
      text-shadow: 0 0 60px rgba(160, 230, 255, 0.8);
    }
    100% {
      opacity: 1;
      text-shadow: 0 0 80px rgba(160, 230, 255, 1),
                   0 0 120px rgba(160, 230, 255, 0.6),
                   0 0 200px rgba(160, 230, 255, 0.3);
    }
  }
`}</style>


    </main>
    
  );
}
