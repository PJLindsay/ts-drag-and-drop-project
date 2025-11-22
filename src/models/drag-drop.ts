// Drag & Drop Interfaces
export interface Draggable {
  dragStartHandler(event: DragEvent): void
  dragEndHandler(event: DragEvent): void
}

export interface DragTarget {
  dragOverHandler(event: DragEvent): void
  dropHandler(event: DragEvent): void
  // useful if giving user feedback when user drags over the box:
  // if no drop happens: update visual indication
  dragLeaveHandler(event: DragEvent): void
}
