"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function LottoMachine({ active = false, drawn = [] }: { active?: boolean; drawn?: number[] }) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef({active, drawn});
  state.current = {active, drawn};
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    const element = host.current!;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({antialias:true, alpha:true}); }
    catch { setFallback(true); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.setClearColor(0x000000,0);
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36,1,0.1,100);
    camera.position.set(0,0.5,9.5); camera.lookAt(0,-0.25,0);
    scene.add(new THREE.HemisphereLight(0xe5f5ef,0x182329,3));
    const light = new THREE.DirectionalLight(0xffffff,5);
    light.position.set(-3,5,5); scene.add(light);
    const rim = new THREE.PointLight(0x85c9b6,25); rim.position.set(3,1,-2); scene.add(rim);
    const metal = new THREE.MeshStandardMaterial({color:0x697a7f,metalness:0.8,roughness:0.28});
    const glass = new THREE.MeshPhysicalMaterial({color:0xc2ded5,transparent:true,opacity:0.1,metalness:0.1,roughness:0.05,side:THREE.DoubleSide,depthWrite:false});
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.86,48,32),glass));
    for (const tilt of [0,Math.PI/2]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.89,0.025,12,96),metal);
      ring.rotation.y=tilt; scene.add(ring);
    }
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.65,0.65,48),metal);
    stand.position.y=-2.06; scene.add(stand);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.3,0.18,64),metal);
    base.position.y=-2.42; scene.add(base);
    const tray = new THREE.Mesh(new THREE.BoxGeometry(2.8,0.08,0.45),metal);
    tray.position.set(0,-2.15,1.3); scene.add(tray);
    const colors = ["#c7a754","#6093b2","#b97670","#859099","#77a28b"];
    const balls = Array.from({length:45},(_,i) => {
      const canvas=document.createElement("canvas"); canvas.width=256; canvas.height=128;
      const ctx=canvas.getContext("2d")!;
      ctx.fillStyle=colors[Math.min(4,Math.floor(i/10))]; ctx.fillRect(0,0,256,128);
      for (const x of [64,192]) {
        ctx.fillStyle="#f7f5ed";ctx.beginPath();ctx.arc(x,64,30,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#28353c";ctx.font="bold 34px Arial";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(String(i+1),x,65);
      }
      const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
      const ball=new THREE.Mesh(new THREE.SphereGeometry(0.18,24,16),new THREE.MeshStandardMaterial({map:texture,roughness:0.28,metalness:0.08}));
      scene.add(ball);
      return {ball,phase:i*2.39996,radius:0.65+(i%7)*0.145,texture};
    });
    const resize = () => { const w=element.clientWidth,h=element.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix(); };
    const observer=new ResizeObserver(resize);observer.observe(element);resize();
    const media=matchMedia("(prefers-reduced-motion: reduce)");
    let frame=0, last=0, time=0;
    const render=(now:number) => {
      const delta=Math.min((now-last)/1000,0.05);last=now;
      if (!media.matches) time+=delta*(state.current.active?2.8:0.2);
      balls.forEach(({ball,phase,radius},i)=>{
        const index=state.current.drawn.indexOf(i+1);
        if(index>=0) {
          ball.position.lerp(new THREE.Vector3(-1.13+index*0.45,-1.93,1.35),0.14);ball.rotation.set(0,-Math.PI/2,0);
        } else {
          const a=time+phase, b=time*0.71+phase*0.63;
          ball.position.set(Math.cos(a)*Math.sin(b)*radius,Math.cos(b)*radius,Math.sin(a)*Math.sin(b)*radius);
          ball.rotation.set(a,b,0);
        }
      });
      renderer.render(scene,camera);frame=requestAnimationFrame(render);
    };
    frame=requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);observer.disconnect();
      scene.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();const mats=Array.isArray(object.material)?object.material:[object.material];mats.forEach(m=>m.dispose());}});
      balls.forEach(b=>b.texture.dispose());renderer.dispose();renderer.domElement.remove();
    };
  },[]);
  return <div className="machine-stage">
    <div ref={host} className="machine-canvas" role="img" aria-label="45개의 번호공이 회전하는 3D 로또 추첨기" />
    {fallback && <div className="machine-fallback">3D 화면을 사용할 수 없습니다.<br/>아래에서 번호 추첨을 계속할 수 있습니다.</div>}
    <div className="machine-caption"><span className={active?"status-dot spinning":"status-dot"}/>{active?"번호공을 섞고 있습니다":"LOTTO 6 / 45"}<span>3D DRAW STUDIO</span></div>
  </div>;
}
