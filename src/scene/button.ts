import { BackSide, BoxGeometry, EdgesGeometry, LineBasicMaterial, LineSegments, type Material, MeshBasicMaterial, Object3D, Vector3 } from 'three'
import { MeshInteractive, MeshLoadable } from '../interaction'
import { Animation } from '../animation'
import { displayRedirectModal, redirectConfirmButton, redirectModalText } from '../modal'
import { Image } from './image'

class ButtonElements extends MeshLoadable {
  private readonly childrenLoadable: MeshLoadable[] = []

  public addChild (child: MeshLoadable): void {
    this.childrenLoadable.push(child)
  }

  public load (): void {
    this.childrenLoadable.forEach(child => { child.load() })
  }

  public unload (): void {
    this.childrenLoadable.forEach(child => { child.unload() })
  }
}

class Button {
  private action: () => void
  private readonly cubeScale: number
  private backgroundOpacity: number

  public readonly mesh: ButtonElements
  private readonly cube: Object3D
  private readonly cubeMesh: MeshInteractive
  private readonly edgesMesh: LineSegments<EdgesGeometry, Material>

  private readonly animation: Animation<number, undefined>

  private readonly position: Vector3
  private readonly size: number
  private readonly path: string

  private readonly logo: Image

  constructor (position: Vector3, size: number = 5, path: string = '') {
    this.action = () => {
      console.log('button clicked')
    }

    this.position = position
    this.size = size
    this.path = path

    this.cubeScale = 1.3
    this.backgroundOpacity = 0.3

    this.mesh = new ButtonElements()
    this.mesh.position.set(this.position.x, this.position.y, this.position.z)
    this.mesh.lookAt(0, 0, 0)

    this.logo = new Image(this.path, new Vector3(0, 0, 0), this.size)
    this.logo.mesh.turnOffInteraction()
    this.mesh.add(this.logo.mesh)

    // Rotating box
    const cubeSide = this.size * this.cubeScale
    const cubeGeometry = new BoxGeometry(cubeSide, cubeSide, cubeSide)

    const edges = new EdgesGeometry(cubeGeometry)

    this.edgesMesh = new LineSegments(edges, new LineBasicMaterial({
      transparent: true,
      opacity: 0.8
    }))

    this.cubeMesh = new MeshInteractive(this.action, cubeGeometry, new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: this.backgroundOpacity,
      side: BackSide
    }))

    // this.cubeMesh = new Mesh( cubeGeometry, new MeshBasicMaterial({
    //     color: 0xffffff,
    //     transparent: true,
    //     opacity: this.backgroundOpacity,
    //     side: BackSide

    // }));

    this.cube = new Object3D()
    this.cube.add(this.edgesMesh)
    this.cube.add(this.cubeMesh)

    this.mesh.add(this.cube)
    this.mesh.addChild(this.cubeMesh)

    this.cube.rotateZ(Math.PI / 4)
    this.cube.rotateY(Math.PI / 4)

    // add rotating animation
    this.animation = new Animation<number, undefined>(
      0, Math.PI * 0.001, 1000,
      (_, animation) => {
        const v3 = new Vector3(1, 1, 1)
        v3.normalize()
        this.cube.rotateOnAxis(v3, animation.end)
      }, undefined, undefined)

    this.animation.setIsLooping(true)
    this.animation.init()
  }

  setAction (action: () => void): void {
    this.action = action
    this.cubeMesh.onInteraction = this.action
  }

  removeBackground (): void {
    this.setBackgroundOpacity(0)
  }

  setBackgroundOpacity (backgroundOpacity: number): void {
    this.backgroundOpacity = backgroundOpacity
    this.cubeMesh.material.opacity = this.backgroundOpacity
    this.cubeMesh.material.needsUpdate = true
  }
}

class RedirectButton extends Button {
  private readonly url: string
  public text: string

  constructor (position: Vector3, size = 5, imagePath = '', url = '', text?: string) {
    super(position, size, imagePath)

    this.url = url
    this.text = text ?? url

    const redirection = (): void => {
      redirectModalText.innerHTML = this.text
      redirectConfirmButton.href = this.url
      displayRedirectModal()
    }

    this.setAction(redirection)
  }
}

class GithubButton extends RedirectButton {
  constructor (position: Vector3, size = 5, repoPath = '', text: string = 'Open the Github repo?') {
    super(position, size, 'images/github.png', repoPath, text)
  }
}

class WebsiteButton extends RedirectButton {
  constructor (position: Vector3, size = 5, url = '', text: string = 'Open the live demo?') {
    super(position, size, 'images/redirect.png', url, text)
  }
}

class LinkedinButton extends RedirectButton {
  constructor (position: Vector3, size = 5, url = '', text: string = 'Open the likedin profile?') {
    super(position, size, 'images/linkedin.png', url, text)
  }
}

export { Button, GithubButton, WebsiteButton, LinkedinButton }
