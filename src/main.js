import './style.css'

import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { EffectComposer } from 'postprocessing'
import { EffectPass } from 'postprocessing'
import { RenderPass } from 'postprocessing'
import { BloomEffect } from 'postprocessing'

const scene = new THREE.Scene()

scene.background =
    new THREE.Color(0x050505)

const camera =
    new THREE.PerspectiveCamera(
        60,
        innerWidth / innerHeight,
        0.1,
        1000
    )

camera.position.set(0, 1.8, 7)

const renderer =
    new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance'
    })

renderer.setPixelRatio(
    Math.min(devicePixelRatio, 2)
)

renderer.setSize(
    innerWidth,
    innerHeight
)

renderer.shadowMap.enabled = true

document.body.appendChild(
    renderer.domElement
)

const composer =
    new EffectComposer(renderer)

composer.addPass(
    new RenderPass(scene, camera)
)

const bloom =
    new BloomEffect({
        intensity: 1.4,
        luminanceThreshold: 0.2,
        mipmapBlur: true
    })

composer.addPass(
    new EffectPass(camera, bloom)
)

const controls =
    new OrbitControls(
        camera,
        renderer.domElement
    )

controls.enableDamping = true
controls.enablePan = false

controls.touches = {
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_ROTATE
}

const ambient =
    new THREE.AmbientLight(
        0xffffff,
        1.6
    )

scene.add(ambient)

const dir =
    new THREE.DirectionalLight(
        0xffffff,
        4
    )

dir.position.set(4, 8, 5)

dir.castShadow = true

scene.add(dir)

const rim =
    new THREE.PointLight(
        0xff7da5,
        40,
        20
    )

rim.position.set(0, 3, -4)

scene.add(rim)

const floor =
    new THREE.Mesh(
        new THREE.PlaneGeometry(
            40,
            40
        ),
        new THREE.MeshStandardMaterial({
            color: 0x101010,
            roughness: 0.8
        })
    )

floor.rotation.x =
    -Math.PI / 2

floor.position.y = -2

floor.receiveShadow = true

scene.add(floor)

const material =
    new THREE.MeshPhysicalMaterial({
        color: 0xff7fa8,
        roughness: 0.38,
        metalness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        sheen: 1,
        sheenRoughness: 0.3
    })

const leftGeometry =
    new THREE.SphereGeometry(
        1.55,
        128,
        128
    )

const rightGeometry =
    new THREE.SphereGeometry(
        1.55,
        128,
        128
    )

const left =
    new THREE.Mesh(
        leftGeometry,
        material
    )

const right =
    new THREE.Mesh(
        rightGeometry,
        material
    )

left.position.set(-1.15, 0, 0)
right.position.set(1.15, 0, 0)

left.castShadow = true
right.castShadow = true

scene.add(left)
scene.add(right)

const crease =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            0.15,
            2.6,
            0.5
        ),
        new THREE.MeshStandardMaterial({
            color: 0x1a1a1a
        })
    )

crease.position.z = -1.2

scene.add(crease)

const state = {

    leftVelocity: 0,
    rightVelocity: 0,

    leftOffset: 0,
    rightOffset: 0,

    leftRotation: 0,
    rightRotation: 0,

    dragX: 0,
    dragY: 0,

    targetDragX: 0,
    targetDragY: 0,

    motionVelocityX: 0,
    motionVelocityY: 0
}

let touching = false

let lastX = 0
let lastY = 0

window.addEventListener(
    'touchstart',
    e => {

        touching = true

        lastX =
            e.touches[0].clientX

        lastY =
            e.touches[0].clientY
    },
    { passive: true }
)

window.addEventListener(
    'touchend',
    () => {

        touching = false
    }
)

window.addEventListener(
    'touchmove',
    e => {

        if (!touching) return

        const x =
            e.touches[0].clientX

        const y =
            e.touches[0].clientY

        const dx = x - lastX
        const dy = y - lastY

        state.motionVelocityX +=
            dx * 0.0008

        state.motionVelocityY +=
            dy * 0.0008

        lastX = x
        lastY = y
    },
    { passive: true }
)

const clock =
    new THREE.Clock()

function softPhysics(
    delta
) {

    state.motionVelocityX *= 0.94
    state.motionVelocityY *= 0.94

    state.targetDragX +=
        state.motionVelocityX

    state.targetDragY +=
        state.motionVelocityY

    state.dragX +=
        (
            state.targetDragX
            - state.dragX
        ) * 0.08

    state.dragY +=
        (
            state.targetDragY
            - state.dragY
        ) * 0.08

    const wave =
        Math.sin(
            performance.now()
            * 0.0018
        ) * 0.18

    state.leftVelocity +=
        (
            wave
            - state.leftOffset
        ) * 0.08

    state.rightVelocity +=
        (
            -wave
            - state.rightOffset
        ) * 0.08

    state.leftVelocity *= 0.92
    state.rightVelocity *= 0.92

    state.leftOffset +=
        state.leftVelocity
        * delta
        * 8

    state.rightOffset +=
        state.rightVelocity
        * delta
        * 8

    left.position.x =
        -1.15
        + state.leftOffset
        + state.dragX

    right.position.x =
        1.15
        + state.rightOffset
        + state.dragX

    left.position.y =
        Math.abs(
            state.leftOffset
        ) * -0.3
        + state.dragY

    right.position.y =
        Math.abs(
            state.rightOffset
        ) * -0.3
        + state.dragY

    left.rotation.z =
        state.leftOffset * 0.5

    right.rotation.z =
        state.rightOffset * 0.5

    const vertices1 =
        left.geometry.attributes.position

    const vertices2 =
        right.geometry.attributes.position

    for (
        let i = 0;
        i < vertices1.count;
        i++
    ) {

        const x =
            vertices1.getX(i)

        const y =
            vertices1.getY(i)

        const z =
            vertices1.getZ(i)

        const distortion =
            Math.sin(
                performance.now()
                * 0.002
                + y * 2
            ) * 0.015

        vertices1.setXYZ(
            i,
            x + distortion,
            y,
            z
        )
    }

    for (
        let i = 0;
        i < vertices2.count;
        i++
    ) {

        const x =
            vertices2.getX(i)

        const y =
            vertices2.getY(i)

        const z =
            vertices2.getZ(i)

        const distortion =
            Math.cos(
                performance.now()
                * 0.002
                + y * 2
            ) * 0.015

        vertices2.setXYZ(
            i,
            x + distortion,
            y,
            z
        )
    }

    vertices1.needsUpdate = true
    vertices2.needsUpdate = true
}

function animate() {

    requestAnimationFrame(
        animate
    )

    const delta =
        clock.getDelta()

    softPhysics(delta)

    controls.update()

    composer.render()
}

animate()

addEventListener(
    'resize',
    () => {

        camera.aspect =
            innerWidth
            / innerHeight

        camera.updateProjectionMatrix()

        renderer.setSize(
            innerWidth,
            innerHeight
        )
    }
)
