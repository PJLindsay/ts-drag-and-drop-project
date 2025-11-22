/// <reference path="drag-drop-interfaces.ts" />
/// <reference path="project-model.ts" />

// three slashes above is special TS syntax - makes the interfaces available
// reminder: autobind makes the 'this' keyword work

namespace App {
  // Project State Management
  type Listener<T> = (items: T[]) => void

  class State<T> {
    // reminder: protected can be accessed from any class that inherits
    protected listeners: Listener<T>[] = []

    addListener(listenerFn: Listener<T>) {
      this.listeners.push(listenerFn)
    }
  }

  class ProjectState extends State<Project> {
    private projects: Project[] = []
    private static instance: ProjectState

    private constructor() {
      super()
    }

    // singleton
    static getInstance() {
      if (this.instance) {
        return this.instance
      }
      this.instance = new ProjectState()
      return this.instance
    }

    addProject(title: string, description: string, numberOfPeople: number) {
      const newProject = new Project(
        Math.random().toString(),
        title,
        description,
        numberOfPeople,
        ProjectStatus.Active
      )

      this.projects.push(newProject)
      this.updateListeners()
    }

    // for drag & drop -- allow project to move from one list to another
    // we need to avoid moving project if they drop it into it's current list (Active projects)
    moveProject(projectId: string, newStatus: ProjectStatus) {
      const project = this.projects.find((prj) => prj.id === projectId)

      // avoid unnecessary re-render cycle
      if (project && project.status !== newStatus) {
        project.status = newStatus
        this.updateListeners()
      }
    }

    // refresh/notify all listeners
    private updateListeners() {
      for (const listenerFn of this.listeners) {
        listenerFn(this.projects.slice())
      }
    }
  }

  // global instance of project state
  const projectState = ProjectState.getInstance()

  // Validation
  interface Validatable {
    value: string | number
    required?: boolean
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
  }

  function validate(validatableInput: Validatable) {
    let isValid = true

    if (validatableInput.required) {
      isValid = isValid && validatableInput.value.toString().trim().length !== 0
    }

    if (
      validatableInput.minLength != null &&
      typeof validatableInput.value === 'string'
    ) {
      isValid =
        isValid && validatableInput.value.length >= validatableInput.minLength
    }

    if (
      validatableInput.maxLength != null &&
      typeof validatableInput.value === 'string'
    ) {
      isValid =
        isValid && validatableInput.value.length <= validatableInput.maxLength
    }

    if (
      validatableInput.min != null &&
      typeof validatableInput.value === 'number'
    ) {
      isValid = isValid && validatableInput.value >= validatableInput.min
    }

    if (
      validatableInput.max != null &&
      typeof validatableInput.value === 'number'
    ) {
      isValid = isValid && validatableInput.value <= validatableInput.max
    }

    return isValid
  }

  // autobind decorator
  function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const adjustedDescriptor: PropertyDescriptor = {
      configurable: true,
      get() {
        const boundFn = originalMethod.bind(this)
        return boundFn
      },
    }
    return adjustedDescriptor
  }

  // Component Base Class
  abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement
    hostElement: T
    element: U

    constructor(
      templateId: string,
      hostElementId: string,
      insertAtStart: boolean,
      newElementId?: string
    ) {
      this.templateElement = document.getElementById(
        templateId
      )! as HTMLTemplateElement
      this.hostElement = document.getElementById(hostElementId)! as T

      const importedNode = document.importNode(
        this.templateElement.content,
        true
      )
      this.element = importedNode.firstElementChild as U

      if (newElementId) {
        this.element.id = newElementId
      }

      this.attach(insertAtStart)
    }

    private attach(insertAtBeginning: boolean) {
      this.hostElement.insertAdjacentElement(
        insertAtBeginning ? 'afterbegin' : 'beforeend',
        this.element
      )
    }

    abstract configure?(): void
    abstract renderContent(): void
  }

  // ProjectItem Class
  class ProjectItem
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

  // ProjectList Class
  class ProjectList
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

  // Project Input class
  class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement
    descriptionInputElement: HTMLInputElement
    peopleInputElement: HTMLInputElement

    constructor() {
      super('project-input', 'app', true, 'user-input')

      // get access to input elements and store them as properies of this class
      this.titleInputElement = this.element.querySelector(
        '#title'
      ) as HTMLInputElement
      this.descriptionInputElement = this.element.querySelector(
        '#description'
      ) as HTMLInputElement
      this.peopleInputElement = this.element.querySelector(
        '#people'
      ) as HTMLInputElement

      this.configure()
    }

    configure() {
      this.element.addEventListener('submit', this.submitHandler.bind(this))
    }

    renderContent() {}

    // get all user input, validate it and return it
    // if input invalid, will return void
    private gatherUserInput(): [string, string, number] | void {
      const enteredTitle = this.titleInputElement.value
      const enteredDescripton = this.descriptionInputElement.value
      const enteredPeople = this.peopleInputElement.value

      const titleValidatable: Validatable = {
        value: enteredTitle,
        required: true,
      }
      const descriptionValidatable: Validatable = {
        value: enteredDescripton,
        required: true,
        minLength: 5,
      }
      const peopleValidatable: Validatable = {
        value: +enteredPeople,
        required: true,
        min: 1,
        max: 5,
      }

      if (
        !validate(titleValidatable) ||
        !validate(descriptionValidatable) ||
        !validate(peopleValidatable)
      ) {
        alert('Invalid input, please try again!')
        return
      } else {
        return [enteredTitle, enteredDescripton, +enteredPeople]
      }
    }

    private clearInputs() {
      this.titleInputElement.value = ''
      this.descriptionInputElement.value = ''
      this.peopleInputElement.value = ''
    }

    @autobind
    private submitHandler(event: Event) {
      event.preventDefault()

      const userInput = this.gatherUserInput()
      if (Array.isArray(userInput)) {
        const [title, desc, people] = userInput
        projectState.addProject(title, desc, people)
        this.clearInputs()
      }
    }
  }

  new ProjectInput()
  new ProjectList('active')
  new ProjectList('finished')
}
