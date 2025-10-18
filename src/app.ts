class ProjectInput {
  templateElement: HTMLTemplateElement
  hostElement: HTMLDivElement
  element: HTMLFormElement

  constructor() {
    // hold reference to where I want template content to go
    this.templateElement = document.getElementById(
      'project-input'
    )! as HTMLTemplateElement

    this.hostElement = document.getElementById('app')! as HTMLDivElement

    //import from template element and render to DOM
    const importedNode = document.importNode(this.templateElement.content, true)
    this.element = importedNode.firstElementChild as HTMLFormElement
    this.attach()
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element)
  }
}

const prjInput = new ProjectInput();