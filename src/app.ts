class ProjectInput {
  templateElement: HTMLTemplateElement
  hostElement: HTMLDivElement
  element: HTMLFormElement
  titleInputElement: HTMLInputElement
  descriptionInputElement: HTMLInputElement
  peopleInputElement: HTMLInputElement

  constructor() {
    // hold reference to where I want template content to go
    this.templateElement = document.getElementById(
      'project-input'
    )! as HTMLTemplateElement

    this.hostElement = document.getElementById('app')! as HTMLDivElement

    //import from template element and render to DOM
    const importedNode = document.importNode(this.templateElement.content, true)
    this.element = importedNode.firstElementChild as HTMLFormElement
    this.element.id = 'user-input'

    // get access to input elements and store them as properies of this class
    this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement
    this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement

    this.configure()
    this.attach()
  }

  private submitHandler(event: Event) {
    event.preventDefault();

    // TODO: validate input
    console.log(this.titleInputElement.value)
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler.bind(this))
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element)
  }
}

const prjInput = new ProjectInput()
