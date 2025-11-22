// to import with esmodule syntax
// note our imports must use js so it will work when compiled
import { Draggable } from '../models/drag-drop.js'
import { Project } from '../models/project.js'
import { Component } from './base-component.js'
import { autobind } from '../decorators/autobind.js'

// ProjectItem Class
export class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project

  get persons() {
    if (this.project.people === 1) {
      return '1 person'
    } else {
      return `${this.project.people} people`
    }
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id)
    this.project = project

    this.configure()
    this.renderContent()
  }

  // dataTransfer property is special for drag events
  // this allows us to attach data to the drag event
  // data will be stored during the drag and can be accessed on drop
  @autobind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData('text/plain', this.project.id)
    // controls what the cursor will look like during drag
    event.dataTransfer!.effectAllowed = 'move'
  }

  // Note: _ declares we won't use the parameter
  dragEndHandler(_: DragEvent) {
    console.log('DragEnd')
  }

  configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler)
    this.element.addEventListener('dragend', this.dragEndHandler)
  }

  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title
    this.element.querySelector('h3')!.textContent = this.persons + ' assigned'
    this.element.querySelector('p')!.textContent = this.project.description
  }
}
