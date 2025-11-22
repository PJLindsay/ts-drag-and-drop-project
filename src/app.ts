/// <reference path="models/drag-drop.ts" />
/// <reference path="models/project.ts" />
/// <reference path="state/project-state.ts" />
/// <reference path="util/validation.ts" />
/// <reference path="decorators/autobind.ts" />
/// <reference path="components/project-input.ts" />
/// <reference path="components/project-list.ts" />

// three slashes above is special TS syntax - makes the interfaces available
// reminder: autobind makes the 'this' keyword work

namespace App {
  new ProjectInput()
  new ProjectList('active')
  new ProjectList('finished')
}
