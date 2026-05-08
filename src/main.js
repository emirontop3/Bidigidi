import './style.css'

import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { EffectComposer } from 'postprocessing'
import { RenderPass } from 'postprocessing'
import { BloomEffect } from 'postprocessing'
import { EffectPass } from 'postprocessing'

import vertexShader from './shaders/vertex.glsl?raw'
import fragmentShader from './shaders/fragment.glsl?raw'

import { JigglePhysics } from './physics/jiggle'
import { setupMobile } from './utils/mobile'

const scene = new THREE.Scene()

scene.background = new THREE.Color(0x050505)

const camera = new THREE.PerspectiveCamera(
    60,
    innerWidth / innerHeight,
    0.1,
    1000
)

camera.position.set(0, 2, 7)

const renderer = new THREE.WebGLRenderer({
    antialias: true
})

renderer.setSize(innerWidth, innerHeight)

renderer.setPixelRatio(devicePixelRatio)

document.body.appendChild(renderer.domElement)

const controls =
    new OrbitControls(camera, renderer.domElement)

setupMobile(controls)

const composer =
    new EffectComposer(renderer)

composer.addPass(
    new RenderPass(scene, camera)
)

const bloom =
    new BloomEffect({
        intensity: 1.2
    })

composer.addPass(
    new EffectPass(camera, bloom)
)

const ambient =
    new THREE.AmbientLight(0xffffff, 1.5)

scene.add(ambient)

const dir =
    new THREE.DirectionalLight(0xffffff, 4)

dir.position.set(5,5,5)

scene.add(dir)

const shaderMaterial =
    new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader
    })

const body =
    new THREE.Mesh(
        new THREE.CylinderGeometry(
            1.3,
            1.6,
            3,
            128
        ),
        shaderMaterial
    )

scene.add(body)

const left =
    new THREE.Mesh(
        new THREE.SphereGeometry(
            1.2,
            128,
            128
        ),
        shaderMaterial
    )

const right =
    new THREE.Mesh(
        new THREE.SphereGeometry(
            1.2,
            128,
            128
        ),
        shaderMaterial
    )

left.position.set(-0.9,-1.1,0)
right.position.set(0.9,-1.1,0)

scene.add(left)
scene.add(right)

const leftPhysics =
    new JigglePhysics(left)

const rightPhysics =
    new JigglePhysics(right)

const floor =
    new THREE.Mesh(
        new THREE.PlaneGeometry(50,50),
        new THREE.MeshStandardMaterial({
            color: 0x111111
        })
    )

floor.rotation.x = -Math.PI / 2
floor.position.y = -2

scene.add(floor)

const clock = new THREE.Clock()

function animate() {

    requestAnimationFrame(animate)

    const delta = clock.getDelta()

    leftPhysics.update(delta, 1)
    rightPhysics.update(delta, 1)

    body.rotation.y += 0.002

    controls.update()

    composer.render()
}

animate()

addEventListener('resize', () => {

    camera.aspect =
        innerWidth / innerHeight

    camera.updateProjectionMatrix()

    renderer.setSize(
        innerWidth,
        innerHeight
    )

})
