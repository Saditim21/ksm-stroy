import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Box, Sphere, Cylinder, Plane } from '@react-three/drei'
import * as THREE from 'three'

// Realistic 3D building representation
const Building3D = ({ project }) => {
  const groupRef = useRef()
  const [hovered, setHovered] = useState(false)

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05 // Slower rotation
    }
  })

  // Create realistic building materials
  const createMaterials = () => {
    return {
      concrete: new THREE.MeshLambertMaterial({ 
        color: '#e5e5e5',
        roughness: 0.8
      }),
      brick: new THREE.MeshLambertMaterial({ 
        color: '#b45a3c',
        roughness: 0.9
      }),
      glass: new THREE.MeshPhysicalMaterial({ 
        color: '#4a90e2',
        transparent: true,
        opacity: 0.3,
        roughness: 0.1,
        metalness: 0.1,
        reflectivity: 0.9
      }),
      metal: new THREE.MeshStandardMaterial({ 
        color: '#8a9ba8',
        metalness: 0.8,
        roughness: 0.2
      }),
      roof: new THREE.MeshLambertMaterial({ 
        color: '#8B4513',
        roughness: 0.7
      }),
      darkMetal: new THREE.MeshStandardMaterial({ 
        color: '#2c3e50',
        metalness: 0.9,
        roughness: 0.1
      })
    }
  }

  const materials = createMaterials()

  // Window component
  const Window = ({ position, size = [0.8, 1.2, 0.1] }) => (
    <group position={position}>
      {/* Window frame */}
      <Box args={[size[0], size[1], size[2]]}>
        <primitive object={materials.darkMetal} />
      </Box>
      {/* Glass */}
      <Box args={[size[0] - 0.1, size[1] - 0.1, size[2] + 0.01]} position={[0, 0, 0.01]}>
        <primitive object={materials.glass} />
      </Box>
      {/* Window divider */}
      <Box args={[0.05, size[1] - 0.1, size[2] + 0.02]} position={[0, 0, 0.02]}>
        <primitive object={materials.darkMetal} />
      </Box>
      <Box args={[size[0] - 0.1, 0.05, size[2] + 0.02]} position={[0, 0, 0.02]}>
        <primitive object={materials.darkMetal} />
      </Box>
    </group>
  )

  // Balcony component
  const Balcony = ({ position }) => (
    <group position={position}>
      <Box args={[1.2, 0.1, 0.6]} position={[0, -0.6, 0.3]}>
        <primitive object={materials.concrete} />
      </Box>
      {/* Balcony railing */}
      <Box args={[1.2, 0.8, 0.05]} position={[0, -0.2, 0.57]}>
        <primitive object={materials.metal} />
      </Box>
    </group>
  )

  // Realistic building structure based on project type
  const getBuildingStructure = () => {
    switch (project.category) {
      case 'residential':
        return (
          <group ref={groupRef}>
            {/* Main building structure */}
            <Box args={[4, 6, 3]} position={[0, 0, 0]}>
              <primitive object={materials.brick} />
            </Box>
            
            {/* Concrete base */}
            <Box args={[4.2, 0.5, 3.2]} position={[0, -2.75, 0]}>
              <primitive object={materials.concrete} />
            </Box>
            
            {/* Roof structure */}
            <Box args={[4.4, 0.3, 3.4]} position={[0, 3.15, 0]}>
              <primitive object={materials.concrete} />
            </Box>
            
            {/* Sloped roof */}
            <Box args={[4.6, 0.8, 3.6]} position={[0, 3.6, 0]} rotation={[0, 0, 0]}>
              <primitive object={materials.roof} />
            </Box>
            
            {/* Windows - Front facade */}
            {[...Array(12)].map((_, i) => {
              const floor = Math.floor(i / 3)
              const windowPos = i % 3
              return (
                <Window 
                  key={i} 
                  position={[
                    (windowPos - 1) * 1.2,
                    -0.5 + floor * 1.8,
                    1.6
                  ]} 
                />
              )
            })}
            
            {/* Balconies */}
            {[0, 1, 2].map((floor) => (
              <Balcony key={floor} position={[0, -0.5 + floor * 1.8, 1.5]} />
            ))}
            
            {/* Entrance */}
            <Box args={[1.2, 2.5, 0.2]} position={[0, -1.25, 1.6]}>
              <primitive object={materials.darkMetal} />
            </Box>
          </group>
        )
      case 'commercial':
        return (
          <group ref={groupRef}>
            {/* Main tower */}
            <Box args={[3, 8, 3]} position={[0, 0, 0]}>
              <primitive object={materials.concrete} />
            </Box>
            
            {/* Glass curtain wall */}
            {[...Array(20)].map((_, i) => {
              const floor = Math.floor(i / 4)
              const windowPos = i % 4
              return (
                <Window 
                  key={i} 
                  position={[
                    (windowPos - 1.5) * 0.7,
                    -3 + floor * 1.6,
                    1.55
                  ]} 
                  size={[0.6, 1.4, 0.1]}
                />
              )
            })}
            
            {/* Building crown */}
            <Box args={[3.2, 0.5, 3.2]} position={[0, 4.25, 0]}>
              <primitive object={materials.darkMetal} />
            </Box>
            
            {/* Antenna/mechanical equipment */}
            <Cylinder args={[0.1, 0.1, 1]} position={[0, 5, 0]}>
              <primitive object={materials.metal} />
            </Cylinder>
            
            {/* Ground floor lobby */}
            <Box args={[3.2, 2.5, 0.3]} position={[0, -2.75, 1.65]}>
              <primitive object={materials.glass} />
            </Box>
          </group>
        )
      case 'industrial':
        return (
          <group ref={groupRef}>
            {/* Main warehouse structure */}
            <Box args={[6, 4, 4]} position={[0, 0, 0]}>
              <primitive object={materials.metal} />
            </Box>
            
            {/* Corrugated roof */}
            <Box args={[6.2, 0.3, 4.2]} position={[0, 2.15, 0]}>
              <primitive object={materials.darkMetal} />
            </Box>
            
            {/* Roof supports */}
            {[-2, 0, 2].map((x, i) => (
              <Cylinder key={i} args={[0.1, 0.1, 4]} position={[x, 0, 0]}>
                <primitive object={materials.darkMetal} />
              </Cylinder>
            ))}
            
            {/* Loading docks */}
            {[-1.5, 1.5].map((x, i) => (
              <Box key={i} args={[1.5, 2.5, 0.3]} position={[x, -0.75, 2.15]}>
                <primitive object={materials.darkMetal} />
              </Box>
            ))}
            
            {/* Office section */}
            <Box args={[2, 3, 2]} position={[-2, -0.5, 1]}>
              <primitive object={materials.concrete} />
            </Box>
            
            {/* Office windows */}
            {[...Array(4)].map((_, i) => (
              <Window 
                key={i} 
                position={[
                  -2,
                  -1 + (i % 2) * 1.5,
                  2.1
                ]} 
                size={[0.8, 1, 0.1]}
              />
            ))}
          </group>
        )
      default:
        return (
          <group ref={groupRef}>
            <Box args={[3, 4, 3]} position={[0, 0, 0]}>
              <primitive object={materials.concrete} />
            </Box>
          </group>
        )
    }
  }

  return (
    <group
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {getBuildingStructure()}
      
      {/* Landscaping */}
      <Plane args={[15, 15]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <meshLambertMaterial color="#4ade80" />
      </Plane>
      
      {/* Concrete walkways */}
      <Box args={[12, 0.05, 2]} position={[0, -2.95, 4]}>
        <primitive object={materials.concrete} />
      </Box>
      
      {/* Trees */}
      {[-5, -3, 3, 5].map((x, i) => (
        <group key={i} position={[x, -2.5, -3]}>
          <Cylinder args={[0.2, 0.2, 2]} position={[0, 0, 0]}>
            <meshLambertMaterial color="#8b4513" />
          </Cylinder>
          <Sphere args={[1]} position={[0, 1.5, 0]}>
            <meshLambertMaterial color="#228b22" />
          </Sphere>
        </group>
      ))}
      
      {/* Street lights */}
      {[-4, 4].map((x, i) => (
        <group key={i} position={[x, -2.5, 6]}>
          <Cylinder args={[0.05, 0.05, 3]} position={[0, 0, 0]}>
            <primitive object={materials.darkMetal} />
          </Cylinder>
          <Sphere args={[0.2]} position={[0, 1.7, 0]}>
            <meshLambertMaterial color="#ffff88" />
          </Sphere>
        </group>
      ))}
    </group>
  )
}

// Loading component
const Loader = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-gray-600">Зареждане на 3D модел...</p>
    </div>
  </div>
)

const ThreeDModelViewer = ({ project, className = "" }) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleCanvasCreated = ({ gl }) => {
    // Handle WebGL context loss
    gl.domElement.addEventListener('webglcontextlost', (event) => {
      event.preventDefault()
      console.log('WebGL context lost, attempting to restore...')
    })
    
    gl.domElement.addEventListener('webglcontextrestored', () => {
      console.log('WebGL context restored')
    })
    
    setIsLoading(false)
  }

  if (error) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">3D модел недостъпен</h3>
          <p className="text-gray-600">Моделът не може да бъде зареден в момента</p>
        </div>
      </div>
    )
  }

  const ViewerContent = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-gold-50 to-primary-100">
      <Suspense fallback={<Loader />}>
        <Canvas 
          camera={{ position: [5, 5, 5], fov: 50 }}
          onCreated={handleCanvasCreated}
          onError={() => setError(true)}
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance",
            preserveDrawingBuffer: false
          }}
        >
          {/* Improved lighting setup */}
          <ambientLight intensity={0.4} color="#ffffff" />
          <directionalLight 
            position={[10, 20, 10]} 
            intensity={1.2}
            color="#ffffff"
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          <directionalLight 
            position={[-5, 10, 5]} 
            intensity={0.3}
            color="#87ceeb"
          />
          <pointLight position={[0, 5, 8]} intensity={0.5} color="#fff8dc" />
          
          <Building3D project={project} />
          
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={15}
            enableDamping={true}
            dampingFactor={0.05}
          />
          
          {/* Sky background */}
          <color attach="background" args={['#87CEEB']} />
        </Canvas>
      </Suspense>
      
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <Loader />
        </div>
      )}
      
      {/* Controls overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={toggleFullscreen}
          className="bg-white/80 backdrop-blur-sm hover:bg-white p-2 rounded-lg shadow-md transition-colors"
          title={isFullscreen ? "Изход от пълен екран" : "Пълен екран"}
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
              isFullscreen 
                ? "M9 9V4.5M9 9H4.5M9 9L4.5 4.5M15 9h4.5M15 9V4.5M15 9l4.5-4.5M9 15v4.5M9 15H4.5M9 15l-4.5 4.5M15 15h4.5M15 15v4.5m0-4.5l4.5 4.5"
                : "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
            } />
          </svg>
        </button>
      </div>
      
      {/* Info overlay */}
      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-md">
        <p className="text-sm text-gray-700 font-medium">3D визуализация</p>
        <p className="text-xs text-gray-500">Използвайте мишката за навигация</p>
      </div>
    </div>
  )

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <ViewerContent />
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-lg shadow-lg ${className}`}>
      <ViewerContent />
    </div>
  )
}

export default ThreeDModelViewer