import { createRootRoute, createRoute } from '@tanstack/solid-router'
import App from './App'
import Home from './pages/Home'
import APIDocs from './pages/APIDocs'
import CoreAlgorithm from './pages/CoreAlgorithm'
import ReactDocs from './pages/ReactDocs'
import SolidDocs from './pages/SolidDocs'
import ComposeDocs from './pages/ComposeDocs'
import SwiftDocs from './pages/SwiftDocs'
import FlutterDocs from './pages/FlutterDocs'
import BuildGuide from './pages/BuildGuide'

const rootRoute = createRootRoute({
  component: App,
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})

const apiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/api',
  component: APIDocs,
})

const algorithmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/core-algorithm',
  component: CoreAlgorithm,
})

const reactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/react',
  component: ReactDocs,
})

const solidRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/solid',
  component: SolidDocs,
})

const composeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/compose',
  component: ComposeDocs,
})

const swiftRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/swift',
  component: SwiftDocs,
})

const flutterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/flutter',
  component: FlutterDocs,
})

const buildRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/build',
  component: BuildGuide,
})

export const routeTree = rootRoute.addChildren([
  homeRoute,
  apiRoute,
  algorithmRoute,
  reactRoute,
  solidRoute,
  composeRoute,
  swiftRoute,
  flutterRoute,
  buildRoute,
])
