import { Physics, usePlane, useBox } from '@react-three/cannon'
import { AbsoluteFill, useVideoConfig } from 'remotion'
import { ThreeCanvas, useVideoTexture } from "@remotion/three";

function Plane(props: any) {
  const [ref] = usePlane<any>(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }))
  return (
    <mesh receiveShadow ref={ref}>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial color="#f0f0f0" />
    </mesh>
  )
}

function Cube(props: any) {
  const [ref] = useBox<any>(() => ({ mass: 1, ...props }))
  return (
    <mesh castShadow ref={ref}>
      <boxGeometry />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

type CubesProps = { count: number }

export default function Cubes({ count }: CubesProps) {
  const { width, height } = useVideoConfig()
  return (
    <AbsoluteFill className='min-w-0'>
      <ThreeCanvas  width={width} height={height} dpr={[1, 2]} shadows camera={{ position: [-10, 10, 10], fov: 50 }}>
        <ambientLight color={0xffffff} intensity={1.5} />
        <spotLight intensity={500} angle={0.8} penumbra={0.5} position={[5, 5, 2.5]} castShadow />
        <Physics >
          <Plane />
          {Array.from({ length: count }).map((_, idx) => <Cube key={idx} position={[Math.random() * 5 - 2.5, 5, Math.random() * 5 - 2.5]} />)}
        </Physics>
      </ThreeCanvas>
    </AbsoluteFill>
  )
}
