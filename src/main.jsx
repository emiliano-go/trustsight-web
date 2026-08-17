import { StrictMode } from 'preact/compat'
import { hydrate } from 'preact'
import './styles.css'
import { App } from './App.jsx'

hydrate(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('root'),
)
