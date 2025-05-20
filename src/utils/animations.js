// src/utils/animations.js

// Importar librerías necesarias para animaciones
import 'animate.css/animate.min.css';
import WOW from 'wow.js';

/**
 * Inicializa las animaciones WOW para la aplicación
 */
export const initWOW = () => {
  const wow = new WOW({
    boxClass: 'wow',
    animateClass: 'animate__animated',
    offset: 0,
    mobile: true,
    live: true
  });
  
  wow.init();
};

/**
 * Reinicia las animaciones (útil después de añadir elementos al DOM)
 */
export const refreshAnimations = () => {
  setTimeout(() => {
    const wow = new WOW({
      boxClass: 'wow',
      animateClass: 'animate__animated',
      offset: 0,
      mobile: true,
      live: true
    });
    wow.init();
  }, 100);
};

/**
 * Clases WOW para elementos específicos
 */
export const animationClasses = {
  fadeIn: 'wow animate__fadeIn',
  fadeUp: 'wow animate__fadeInUp',
  fadeDown: 'wow animate__fadeInDown',
  fadeLeft: 'wow animate__fadeInLeft',
  fadeRight: 'wow animate__fadeInRight',
  bounce: 'wow animate__bounce',
  pulse: 'wow animate__pulse',
  headShake: 'wow animate__headShake'
};