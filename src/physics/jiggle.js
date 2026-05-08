export class JigglePhysics {

    constructor(mesh) {
        this.mesh = mesh

        this.velocity = 0
        this.offset = 0
    }

    update(delta, power = 1) {

        const target =
            Math.sin(performance.now() * 0.002) * 0.15 * power

        this.velocity += (target - this.offset) * 0.12

        this.velocity *= 0.90

        this.offset += this.velocity * delta * 12

        this.mesh.position.x += this.offset * 0.02

        this.mesh.rotation.z =
            this.offset * 0.4
    }
}
