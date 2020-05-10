---
title: "Learning Angular 4"
slug: "/https-image-ibb-co-dwx0y6-angular_4_release-jpglearning-angular-4"
date: "2017-10-22T08:43:33.000Z"
description: ""
image: "./images/angular_4_release.jpg"
featured: false
tags: ["Tutorials"]
---

Develop modern, complex, responsive and scalable web applications with Angular 4. Fully understand the architecture behind an Angular 4 applications.

# Table of contents

- [Getting Started](#gettingstarted)
- [The Basics](#thebasics)
- [Components & Databinding](#componentsanddatabinding)
  - [databinding](#)
- [Directives](#directives)
- [Services & Dependency Injection](#servicesanddependencyinjection)
- [Routing](#routing)
- [Observables](#observables)
- [Forms](#forms)
- [Pipes](#pipes)
- [Http](#http)
- [Authentication](#authentication)
- [Optimizations & NgModules](#optimizationsandngmodules)
- [Deployment](#deployment)

# Getting Started

The Angular CLI [docs](https://github.com/angular/angular-cli/wiki)

To install the Angular CLI:

```shell
sudo npm install -g @angular/cli
```

Creating New Application

```shell
ng new my-project
cd my-project
ng serve
or
ng serve --port {Port Number}
```

#### To set yarn as default package manager

```
ng set --global packageManager=yarn
```

Importing Bootstrap css to porject

```shell
npm install --save bootstrap
```

```javascript
.angular-cli.json

"styles": [
  "../node_modules/bootstrap/dist/css/bootstrap.min.css",
  "styles.css"
]
```

# The Basics

Angular app bootstrap process

We pass AppModule to main.ts

```
platformBrowserDynamic().bootstrapModule(AppModule)
```

amd app.module passes all the components needed to run the app

# Components and Databinding

Creating new Components

Add to the declaration array in app.module.ts

```
declarations: [
  AppComponent,
  YourNewComponent
]
```

Creating Components with cli

```
ng generate component servers
ng g c servers
```

Databinding is communication between ts code (Business Login) and html files

Types of binding

1.String Binding = Value from ts to html
2.Event Binding = Event (eg: Click event) from html to ts

3. Two-way-binding = Combination of both

String Interpolation = `{{stringName}}`
Property Binding = `[disabled]="stringName"`

Event Bindng = `(click)="methodName()"`

Two-way-binding = `[(ngModel)]="varibleName"`

# Directives

Instructions in the DOM

```
ng generate directive directive-name
ng g d directive-name
```

Attribute Directives only change attributes in element.

Structural Directive manipulate the dom
structural directive has \*

```
*ngIf="variableName"
*ngFor="let server of servers"
*ngFor="let server of servers; let i = index"
```

`@Input() variable` To access variable from other child component.

@Output() serverCreated = new EventEmitter<{variable: string}>(); To pass to parent component.

`#referencename` for local html element reference.

# Services and Dependency Injection

- **Services**

Instead of copying and pasting the same code over and over, you'll create a single reusable data service and inject it into the components that need it. Using a separate service keeps components lean and focused on supporting the view, and makes it easy to unit-test components with a mock service.

Services are JavaScript functions that are responsible for doing a specific task only.

Create a class with an @Injectable decorator

```
import { Injectable } from '@angular/core';

@Injectable()
export class MyService {
 method() {}
}
```

Making use of this service in your component.

```
import { Component, OnInit } from '@angular/core'; import { MyService } from './my-service';

@Component({
 selector: 'my-app',
template: '<div>{{greeting}}</div>'
})
export class MyApp implements OnInit {
 value: number;
 constructor(private myService:MyService) { }
 ngOnInit() {
  this.greeting = this._myService.method();
 }
}
```

# Routing

Routing is a mechanism which enables user to navigate between views/components.

The angular application has single instance of the Router service and whenever URL changes, corresponding Route is matched from the routing configuration array. On successfull match, it applies redirects and the router builds a tree of ActivatedRoute objects and contains the current state of the router. Before redirection, the router will check whether new state is permitted by running guards (CanActivate). Route Guards is simply an interface method that router runs to check the route authorization. After guard runs, it will resolve the route data and activate the router state by instantiation the required components into <router-outlet > < /router-outlet > tag.

Angular2 provides 3 different components for routing configuration:

Routes is the configuration to describe application’s different routes.
RouterOutlet is a “placeholder” component that holds the view for each route.
RouterLink is a directive to link to routes

**Routes**

Routes is an object to describe the routes of the application. For instance, here is an example for our previously specified goal.

**Router Directives**

Angular RouterModule has 3 different directives. Such as:

- router-outlet
- router-link
- routerLinkActive

router-outlet

router-outlet is a component from angular/router library. The router is the placeholder to display views inside router-outlet tags. As the routes changes, the view inside the router-outlet tags also change accordingly.

router-link

router-link directive is an alternative of HTML href property.

routerLinkActive

The RouterLinkActive directive toggles css classes for active RouterLinks based on the current RouterState. This cascades down through each level in our route tree, so parent and child router links can be active at the same time. To override this behavior, we can bind to the [routerLinkActiveOptions] input binding with the { exact: true } expression. By using { exact: true }, a given RouterLink will only be active if its URL is an exact match to the current URL.

Example :

Set Routes

```
const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent }
];
```

Notice here that we:
use path to specify the URL, we specify the component we want to route to, we can redirect using the redirectTo option

Providing our Router

To install our router into our app we use the RouterModule.forRoot() function in the imports key of our NgModule:

```
import { Routes, } from '@angular/router';

@NgModule({
  declarations: [ ],
  imports: [
  BrowserModule,
  RouterModule.forRoot(routes) // <-- installs Router routes
]
```

RouterOutlet

The RouterOutlet directive tells our router where to render the content in the view.

For instance, if we have a view:

```
//in html file
<router-outlet></router-outlet>
```

Then whenever we switch routes, our content will be rendered in place of the router-outlet tag. That is, if we were switching to the /login page, the content rendered by the LoginComponent would be placed there.

RouterLink

If we want to navigate between routes, we use the RouterLink directive. So if we wanted to link to our login and dashboard page from a navigation, we could change our view above to something like this:

```
  <ul>
    <li routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}"><a [router-link]="['home']">Home</a></li>
    <li routerLinkActive="active"><a [router-link]="['login']">Login</a></li>
    <li routerLinkActive="active"><a [router-link]="['dashboard']">Dashboard</a></li>
  </ul>
```

Navigating Programatically

```
constructor(private router: Router) {}

someMethod() {
  this.router.navigate(['/login']);
}
```

Parameter to the route

```
const routes: Routes = [
  { path: '/user/:id', component: UsersComponent }
];
```

Getting This parameter

```
ngOnOnit() {
 id =  this.route.snapshot.params['id']; <-- Only load on first component init
 this.route.params.subscribe( <-- Observable
   (params: Params) => {
    this.id = params.id;
   }
 );
}
```

**Guards**

Protecting routes is a very common task when building applications, as we want to prevent our users from accessing areas that they’re not allowed to access, or, we might want to ask them for confirmation when leaving a certain area. Angular’s router provides a feature called Navigation Guards that try to solve exactly that problem.

Guard Types

There are four different guard types we can use to protect our routes:

1. CanActivate - Decides if a route can be activated

2. CanActivateChild - Decides if children routes of a route can be activated

3. CanDeactivate - Decides if a route can be deactivated

4. CanLoad - Decides if a module can be loaded lazily

Depending on what we want to do, we might need to implement one or the other guard. In some cases, we even need to implement all of them.

Guards can be implemented in different ways, but after all it really boils down to a function that returns either Observable <boolean>, Promise <boolean> or boolean. In addition, guards are registered using providers, so they can be injected by Angular when needed.

# Observables

What is Observables ?

Observables are similar to promises but with major differences that make them better.

<table>
<thead>
<tr>
<th>Observables</th>
<th align="center">Promise</th>
</tr>
</thead>
<tbody>
<tr>
<td>Observables handle multiple values over time</td>
<td align="center">Promises are only called once and will return a single value</td>

</tr>
<tr>
<td> Observables are cancellable</td>
<td align="center">Promises are not cancellable</td>

</tr>
<tr>
<td>Supports map, filter, reduce and similar operators</td>
</tr>
<tr>
<td>an array whose items arrive asynchronously over time</td>
</tr>
</tbody>
</table>

Being able to cancel observables gives better control when working with in-flow of values from a stream. The common example is the auto-complete widget which sends a request for every key-stroke.

# Pipes

Pipes transform displayed values within a template.A pipe takes in data as input and transforms it to a desired output.

Usage of pipes

1. You can display only some filtered elements from an array.
2. You can modify or format the value.
3. You can use them as a function.
4. You can do all of the above combined.

Syntax : myValue | myPipe:param1:param2 | mySecondPipe:param1

Example :

```
import {Component, View} from 'angular2/core';

@Component({
  selector: 'date-pipe'
})
//html
<h2>Pipe Example</h2> <h4>
1. Today is {{today}}</h4> <h4>
2. Today is {{today | date}}</h4> <h4>
3. Today is {{today | date:"dd/MM/yyyy"}}</h4>' })
export class DatePipe { today = new Date(); }
```

Creating custom pipes

designing pipe

file name: remove-spaces.ts

```
import {Pipe} from "angular2/core";
@Pipe({ name : "removeSpaces" })
export class RemoveSpaces{
 transform(value){ return value.replace(/ /g, "");
}
```

Using the pipe

```
import {Component, View} from 'angular2/core';
import {RemoveSpaces} from './remove-spaces.ts';
@Component({ selector: 'remove-spaces-impl', })
@View({ pipes: [RemoveSpaces], template: '<h2>Custom pipe : removeSpaces</h2> <h4> {{sampleString}} => {{sampleString | removeSpaces}}</h4>' }) export class RemoveSpacesImpl { sampleString = "I love angular 2"; }
```
