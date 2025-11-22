// to import with esmodule syntax
// note our imports must use js so it will work when compiled
import { DragTarget } from '../models/drag-drop.js'
import { Project, ProjectStatus } from '../models/project.js'
import Component from './base-component.js'
import { autobind } from '../decorators/autobind.js'
import { ProjectItem } from './project-item.js'
import { projectState } from '../state/project-state.js'

// ProjectList Class
export class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[]

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`)
    this.assignedProjects = []

    this.configure()
    this.renderContent()
  }

  @autobind
  dragOverHandler(event: DragEvent) {
    // we only allow dropping of plain text in this case
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      // default for JS drag and drop is to not allow dropping
      // for this element we want to allow a drop when user lets go
      event.preventDefault()
      const listEl = this.element.querySelector('ul')!
      // add CSS style to indicate it is droppable
      listEl.classList.add('droppable')
    }
  }

  @autobind
  dropHandler(event: DragEvent) {
    const projectId = event.dataTransfer!.getData('text/plain')
    projectState.moveProject(
      projectId,
      this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
    )
  }

  @autobind
  dragLeaveHandler(_: DragEvent) {
    const listEl = this.element.querySelector('ul')!
    // remove CSS style to indicate we're not dropping
    listEl.classList.remove('droppable')
  }

  // Note: convention is to put PUBLIC methods above PRIVATE methods
  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler)
    this.element.addEventListener('dragleave', this.dragLeaveHandler)
    this.element.addEventListener('drop', this.dropHandler)

    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((prj) => {
        if (this.type === 'active') {
          return prj.status === ProjectStatus.Active
        }
        return prj.status === ProjectStatus.Finished
      })
      this.assignedProjects = relevantProjects
      this.renderProjects()
    })
  }

  renderContent() {
    const listId = `${this.type}-projects-list`
    this.element.querySelector('ul')!.id = listId
    this.element.querySelector('h2')!.textContent =
      this.type.toUpperCase() + ' PROJECTS'
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement

    // re-render all projects
    listEl.innerHTML = ''
    for (const projectItem of this.assignedProjects) {
      // id of host element
      new ProjectItem(this.element.querySelector('ul')!.id, projectItem)
    }
  }
}
