# Base on
https://github.com/angular-redux/platform

## Angular 12

`@angular-redux2/store` is what you need. This consumes breaking changes from RxJS and Angular 12, as well as updated typedefs from Redux 6.

# @angular-redux2/store

Angular bindings for [Redux](https://github.com/reactjs/redux).

[![Join the chat at https://gitter.im/angular-redux/ng2-redux](https://badges.gitter.im/angular-redux/ng2-redux.svg)](https://gitter.im/angular-redux/ng2-redux?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![CircleCI](https://img.shields.io/circleci/project/github/angular-redux/store.svg)](https://github.com/angular-redux2/store)
[![npm version](https://img.shields.io/npm/v/@angular-redux/store.svg)](https://www.npmjs.com/package/@angular-redux2/store)
[![downloads per month](https://img.shields.io/npm/dm/@angular-redux/store.svg)](https://www.npmjs.com/package/@angular-redux2/store)

## What is Redux?

Redux is a popular approach to managing state in applications. It emphasises:

- A single, immutable data store.
- One-way data flow.
- An approach to change based on pure functions and a stream of actions.

You can find lots of excellent documentation here: [Redux](http://redux.js.org/).

## What is @angular-redux2?

We provide a set of npm packages that help you integrate your redux store
into your Angular 2+ applications. Our approach helps you by bridging the gap
with some of Angular's advanced features, including:

- Change processing with RxJS observables.
- Compile time optimizations with `NgModule` and Ahead-of-Time compilation.
- Integration with the Angular change detector.

## Getting Started

- I already know what Redux and RxJS are. [Give me the TL;DR](articles/quickstart.md).
- I'm just learning about Redux. [Break it down for me](articles/intro-tutorial.md)!
- Talk is cheap. [Show me a complete code example](https://github.com/angular-redux/example-app).
- Take me to the [API docs](https://angular-redux.github.io/store).

## Installation

`@angular-redux2/store` has a peer dependency on redux, so we need to install it as well.

```sh
npm install --save redux @angular-redux2/store
```

## Quick Start

```typescript
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './containers/app.module';

platformBrowserDynamic().bootstrapModule(AppModule);
```

Import the `NgReduxModule` class and add it to your application module as an
`import`. Once you've done this, you'll be able to inject `NgRedux` into your
Angular components. In your top-level app module, you
can configure your Redux store with reducers, initial state,
and optionally middlewares and enhancers as you would in Redux directly.

```typescript
import { NgReduxModule, NgRedux } from '@angular-redux2/store';
import { createLogger } from 'redux-logger';
import { rootReducer } from './reducers';

interface IAppState {
  /* ... */
}

@NgModule({
  /* ... */
  imports: [, /* ... */ NgReduxModule],
})
export class AppModule {
  constructor(ngRedux: NgRedux<IAppState>) {
    ngRedux.configureStore(rootReducer, {}, [createLogger()]);
  }
}
```

Or if you prefer to create the Redux store yourself you can do that and use the
`provideStore()` function instead:

```typescript
import {
  applyMiddleware,
  Store,
  combineReducers,
  compose,
  createStore,
} from 'redux';
import { NgReduxModule, NgRedux } from '@angular-redux2/store';
import { createLogger } from 'redux-logger';
import { rootReducer } from './reducers';

interface IAppState {
  /* ... */
}

export const store: Store<IAppState> = createStore(
  rootReducer,
  applyMiddleware(createLogger()),
);

@NgModule({
  /* ... */
  imports: [, /* ... */ NgReduxModule],
})
class AppModule {
  constructor(ngRedux: NgRedux<IAppState>) {
    ngRedux.provideStore(store);
  }
}
```

> Note that we're also using a Redux middleware from the community here:
> [redux-logger](https://www.npmjs.com/package/redux-logger). This is just to show
> off that `@angular-redux/store` is indeed compatible with Redux middlewares as you
> might expect.
>
> Note that to use it, you'll need to install it with `npm install --save redux-logger`
> and type definitions for it with `npm install --save-dev @types/redux-logger`.

Now your Angular app has been reduxified! Use the `@select` decorator to
access your store state, and `.dispatch()` to dispatch actions:

```typescript
import { select } from '@angular-redux2/store';

@Component({
  template:
    '<button (click)="onClick()">Clicked {{ count | async }} times</button>',
})
class App {
  @select() count$: Observable<number>;

  constructor(private ngRedux: NgRedux<IAppState>) {}

  onClick() {
    this.ngRedux.dispatch({ type: INCREMENT });
  }
}
```

## Hacking on angular-redux2/store

Want to hack on angular-redux2/store or any of the related packages? Feel free to do so, but please test your changes before making any PRs.

Here's how to do that:

1.  Write unit tests. You can check that they work by running
    `npm test`.
2.  Run the linter. If your editor doesn't do it automatically, do it
    manually with `npm run lint`.
3.  Test your changes in a 'real world scenario'. We use the [example-app](https://github.com/angular-redux/example-app) for this, using some npm
    fakery to 'publish the package locally':

- clone the example app (`git clone https://github.com/angular-redux/example-app.git`)
- generate a 'local package' (`cd` to your `angular-redux2/store` clone and run `npm pack`). This will create a `.tgz` file.
- hook your 'local package' up to your example-app (`cd` to your example-app clone and run `npm install --save /path/to/the/tgz/file/from/above`)
- run `ng serve --aot`

Please make sure your changes pass Angular's AoT compiler, because it's a bit finicky with TS syntax.
