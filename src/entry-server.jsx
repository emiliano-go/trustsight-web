import { renderToString } from 'preact-render-to-string'
import { App } from './App.jsx'

export function render() {
  return renderToString(<App />)
}
