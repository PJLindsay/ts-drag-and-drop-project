/// <reference path="components/project-input.ts" />
/// <reference path="components/project-list.ts" />

// three slashes above is special TS syntax - makes the interfaces available
// reminder: autobind makes the 'this' keyword work

namespace App {
  new ProjectInput()
  new ProjectList('active')
  new ProjectList('finished')
}
