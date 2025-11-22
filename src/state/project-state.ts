import { Project, ProjectStatus } from '../models/project.js'

// Project State Management
type Listener<T> = (items: T[]) => void

class State<T> {
  // reminder: protected can be accessed from any class that inherits
  protected listeners: Listener<T>[] = []

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn)
  }
}

export class ProjectState extends State<Project> {
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
export const projectState = ProjectState.getInstance()
