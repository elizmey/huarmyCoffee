import React from 'react';
import './App.css';

import Home from './components/Home';
import Menu from './components/Menu';
import About from './components/About';
import Contact from './components/Contact';
import Testimonials from "./components/Testimonials";
import Gallery from './components/Gallery';
import Nosotros from './components/Nosotros';


function App() {
  return (
    <div className="App">

      <header className="App-header">
        <nav>
          <ul>
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#menu">Menú</a></li>
            <li><a href="#nosotros">Nuestra Historia</a></li>
            <li><a href="#contact">Contacto</a></li>
          </ul>
        </nav>
      </header>

      <Home />
      <Menu />
      <Nosotros />

      <Testimonials />
      <Gallery />
      <Contact />

      <footer>
        <p>Todos los derechos reservados © 2026 Huarmy Coffee</p>
      </footer>
    </div>
  );
}

export default App;