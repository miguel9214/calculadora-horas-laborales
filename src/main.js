// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Importar Bootstrap CSS y JS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Importar Animate.css para animaciones adicionales
import 'animate.css/animate.min.css';

// Crear la aplicación 
const app = createApp(App);

// Usar el router
app.use(router);

// Montar la aplicación en el elemento #app
app.mount('#app');