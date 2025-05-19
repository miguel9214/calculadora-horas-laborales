<!-- src/views/HomePage.vue -->
<template>
  <div :class="['home-page', {'dark-mode': darkMode}]">
    <!-- Toggle flotante para modo oscuro -->
    <div class="theme-toggle-wrapper wow fadeInRight">
      <button 
        class="btn btn-floating theme-toggle" 
        @click="toggleDarkMode"
        :title="darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
      >
        <i :class="['bi', darkMode ? 'bi-sun' : 'bi-moon']"></i>
      </button>
    </div>

    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div class="card shadow-lg border-0 rounded-lg wow fadeIn" data-wow-duration="1s">
            <div class="card-header" :class="darkMode ? 'bg-dark' : 'bg-primary'">
              <h3 class="text-center font-weight-bold my-2 wow fadeIn" data-wow-delay="0.2s">
                <i class="bi bi-clock me-2"></i>Calculadora de Horas Laborales
              </h3>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <!-- Formulario de entrada -->
                  <div class="card mb-4 h-100 wow fadeInLeft" data-wow-delay="0.3s">
                    <div class="card-header" :class="darkMode ? 'bg-dark text-white' : 'bg-light'">
                      <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                          <i class="bi bi-input-cursor me-2"></i>Datos de Entrada
                        </h5>
                        <button 
                          type="button" 
                          class="btn btn-sm" 
                          :class="darkMode ? 'btn-outline-light' : 'btn-outline-secondary'"
                          @click="resetForm"
                          title="Resetear formulario"
                        >
                          <i class="bi bi-arrow-counterclockwise"></i>
                        </button>
                      </div>
                    </div>
                    <div class="card-body">
                      <form @submit.prevent="calculateHours">
                        <!-- Horario de entrada y salida -->
                        <div class="row mb-3">
                          <div class="col-md-6">
                            <label class="form-label">Hora de entrada:</label>
                            <input 
                              type="time" 
                              class="form-control" 
                              v-model="attendanceIn" 
                              required
                              @change="saveToLocalStorage"
                            >
                          </div>
                          <div class="col-md-6">
                            <label class="form-label">Hora de salida:</label>
                            <input 
                              type="time" 
                              class="form-control" 
                              v-model="attendanceOut" 
                              required
                              @change="saveToLocalStorage"
                            >
                          </div>
                        </div>
                        
                        <!-- Configuración de conceptos -->
                        <div class="mb-3">
                          <label class="form-label d-flex justify-content-between align-items-center">
                            <span>Configuración de conceptos:</span>
                            <button 
                              type="button" 
                              class="btn btn-sm" 
                              :class="darkMode ? 'btn-outline-light' : 'btn-outline-primary'" 
                              @click="addConcept"
                            >
                              <i class="bi bi-plus-circle me-1"></i>Añadir
                            </button>
                          </label>
                          
                          <!-- Lista de conceptos -->
                          <transition-group name="list" tag="div" class="concepts-container">
                            <div 
                              v-for="(concept, index) in concepts" 
                              :key="index" 
                              class="card mb-2 concept-card wow fadeInUp" 
                              :class="{'border-danger': hasValidationError(concept)}"
                              :data-wow-delay="`${0.1 * index}s`"
                            >
                              <div class="card-body p-3">
                                <div class="row g-2">
                                  <div class="col-md-3">
                                    <label class="form-label small">ID:</label>
                                    <input 
                                      type="text" 
                                      class="form-control form-control-sm" 
                                      v-model="concept.id" 
                                      required
                                      @input="validateInputs(); saveToLocalStorage()"
                                      :class="{'is-invalid': isDuplicateId(concept.id, index)}"
                                    >
                                    <div v-if="isDuplicateId(concept.id, index)" class="invalid-feedback">
                                      ID duplicado
                                    </div>
                                  </div>
                                  <div class="col-md-3">
                                    <label class="form-label small">Nombre:</label>
                                    <input 
                                      type="text" 
                                      class="form-control form-control-sm" 
                                      v-model="concept.name" 
                                      required
                                      @input="validateInputs(); saveToLocalStorage()"
                                      :class="{'is-invalid': !concept.name}"
                                    >
                                  </div>
                                  <div class="col-md-2">
                                    <label class="form-label small">Inicio:</label>
                                    <input 
                                      type="time" 
                                      class="form-control form-control-sm" 
                                      v-model="concept.start" 
                                      required
                                      @change="saveToLocalStorage()"
                                    >
                                  </div>
                                  <div class="col-md-2">
                                    <label class="form-label small">Fin:</label>
                                    <input 
                                      type="time" 
                                      class="form-control form-control-sm" 
                                      v-model="concept.end" 
                                      required
                                      @change="saveToLocalStorage()"
                                    >
                                  </div>
                                  <div class="col-md-2 d-flex align-items-end justify-content-center">
                                    <button 
                                      type="button" 
                                      class="btn btn-sm btn-outline-danger mt-2 wow pulse" 
                                      data-wow-delay="0.5s"
                                      @click="removeConcept(index)"
                                      :disabled="concepts.length <= 1"
                                    >
                                      <i class="bi bi-trash"></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </transition-group>
                        </div>
                        
                        <!-- Botón de cálculo -->
                        <div class="d-grid gap-2">
                          <button 
                            type="submit" 
                            class="btn" 
                            :class="darkMode ? 'btn-light' : 'btn-primary'" 
                            :disabled="loading || hasErrors"
                          >
                            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            <i v-else class="bi bi-calculator me-2"></i>
                            Calcular Horas
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <!-- Resultados -->
                  <div class="card mb-4 h-100 wow fadeInRight" data-wow-delay="0.3s">
                    <div class="card-header" :class="darkMode ? 'bg-dark text-white' : 'bg-light'">
                      <h5 class="mb-0">
                        <i class="bi bi-bar-chart me-2"></i>Resultados
                      </h5>
                    </div>
                    <div class="card-body">
                      <div v-if="results && Object.keys(results).length > 0" class="wow fadeIn">
                        <!-- Gráfico de pastel -->
                        <div class="mb-4">
                          <canvas ref="pieChartRef" width="400" height="300"></canvas>
                        </div>
                        
                        <!-- Tabla de resultados -->
                        <div class="table-responsive wow fadeInUp" data-wow-delay="0.2s">
                          <table class="table table-bordered table-hover" :class="{'table-dark': darkMode}">
                            <thead :class="darkMode ? 'table-secondary' : 'table-light'">
                              <tr>
                                <th>Concepto</th>
                                <th>Horas</th>
                                <th>Porcentaje</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(hours, concept) in results" :key="concept" class="results-row" 
                                  :class="{'animate__animated animate__fadeIn': hasNewResults}">
                                <td>
                                  <span class="badge rounded-pill" :class="getBadgeClass(concept)">
                                    {{ getConceptName(concept) }}
                                  </span>
                                </td>
                                <td>{{ hours }} horas</td>
                                <td>{{ calculatePercentage(hours) }}%</td>
                              </tr>
                              <tr :class="[darkMode ? 'table-secondary' : 'table-active', 'fw-bold']">
                                <td>Total</td>
                                <td>{{ totalHours }} horas</td>
                                <td>100%</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      <div v-else class="text-center p-5">
                        <img src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png" alt="Esperando datos" 
                             class="img-fluid mb-3 wow bounceIn" style="width: 120px;">
                        <h5 :class="darkMode ? 'text-light' : 'text-muted'" class="wow fadeIn" data-wow-delay="0.5s">
                          Ingrese datos y calcule para ver resultados
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-footer text-center" :class="darkMode ? 'text-light bg-dark' : 'text-muted'">
              Calculadora de Horas Laborales | {{ new Date().getFullYear() }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import Swal from 'sweetalert2';
import Chart from 'chart.js/auto';
import 'animate.css/animate.min.css';
import WOW from 'wow.js';

// Referencias para los gráficos
const pieChartRef = ref(null);
let pieChart = null;

// Estado de la aplicación
const loading = ref(false);
const attendanceIn = ref('08:00');
const attendanceOut = ref('21:30');
const results = ref({});
const hasNewResults = ref(false);
const darkMode = ref(false);
const hasErrors = ref(false);

// Conceptos de horas
const concepts = ref([
  {
    id: "HO",
    name: "Horas Ordinarias",
    start: "08:00",
    end: "17:59"
  },
  {
    id: "HED",
    name: "Horas Extras Diurnas",
    start: "18:00",
    end: "20:59"
  },
  {
    id: "HEN",
    name: "Horas Extras Nocturnas",
    start: "21:00",
    end: "05:59"
  }
]);

// Cálculos derivados
const totalHours = computed(() => {
  if (!results.value || Object.keys(results.value).length === 0) return 0;
  return Object.values(results.value).reduce((sum, hours) => sum + hours, 0);
});

// Métodos
const calculatePercentage = (hours) => {
  if (totalHours.value === 0) return 0;
  return Math.round((hours / totalHours.value) * 100);
};

const getBadgeClass = (concept) => {
  const baseClass = darkMode.value ? 'text-dark ' : '';
  
  switch (concept) {
    case 'HO': return baseClass + 'bg-primary';
    case 'HED': return baseClass + 'bg-success';
    case 'HEN': return baseClass + 'bg-danger';
    default: return baseClass + 'bg-secondary';
  }
};

const getConceptName = (conceptId) => {
  const concept = concepts.value.find(c => c.id === conceptId);
  return concept ? concept.name : conceptId;
};

const addConcept = () => {
  concepts.value.push({
    id: "",
    name: "",
    start: "00:00",
    end: "23:59"
  });
  
  saveToLocalStorage();
  
  // Re-iniciar WOW para animar el nuevo elemento
  setTimeout(() => {
    new WOW().init();
  }, 100);
};

const removeConcept = (index) => {
  if (concepts.value.length > 1) {
    concepts.value.splice(index, 1);
    saveToLocalStorage();
    validateInputs();
  }
};

const calculateHours = async () => {
  if (hasErrors.value) {
    Swal.fire({
      title: 'Error de validación',
      text: 'Por favor, corrija los errores en el formulario antes de continuar.',
      icon: 'warning',
      confirmButtonColor: darkMode.value ? '#f8f9fa' : '#0d6efd',
      background: darkMode.value ? '#343a40' : '#fff',
      color: darkMode.value ? '#fff' : '#000'
    });
    return;
  }

  loading.value = true;

  try {
    // Validar formato de datos
    if (!validInputs()) {
      loading.value = false;
      return;
    }

    // Datos para la API
    const payload = {
      attendanceIn: attendanceIn.value,
      attendanceOut: attendanceOut.value,
      concepts: concepts.value.map(concept => ({
        id: concept.id,
        name: concept.id,
        start: concept.start,
        end: concept.end
      }))
    };

    // Llamar a la API
    const response = await fetch('https://falconcloud.co/site_srv10_ph/site/api/qserv.php/13465-770721', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    // Procesar resultados
    const data = await response.json();
    results.value = data;
    hasNewResults.value = true;

    // Restablecer el estado después de un tiempo
    setTimeout(() => {
      hasNewResults.value = false;
    }, 2000);

    // Actualizar gráficos
    updateCharts();

    // Mostrar mensaje de éxito
    Swal.fire({
      title: '¡Cálculo Exitoso!',
      text: `Se calcularon ${totalHours.value} horas en total.`,
      icon: 'success',
      confirmButtonColor: darkMode.value ? '#f8f9fa' : '#0d6efd',
      background: darkMode.value ? '#343a40' : '#fff',
      color: darkMode.value ? '#fff' : '#000'
    });

  } catch (error) {
    console.error('Error al calcular horas:', error);
    
    Swal.fire({
      title: 'Error',
      text: 'Ocurrió un problema al procesar su solicitud. Por favor, intente nuevamente.',
      icon: 'error',
      confirmButtonColor: darkMode.value ? '#f8f9fa' : '#0d6efd',
      background: darkMode.value ? '#343a40' : '#fff',
      color: darkMode.value ? '#fff' : '#000'
    });
  } finally {
    loading.value = false;
  }
};

// Validación de inputs en tiempo real
const isDuplicateId = (id, currentIndex) => {
  if (!id) return false;
  
  return concepts.value.some((concept, index) => 
    concept.id === id && index !== currentIndex && concept.id !== ""
  );
};

const hasValidationError = (concept) => {
  if (!concept.id || !concept.name) return true;
  
  const index = concepts.value.findIndex(c => c === concept);
  return isDuplicateId(concept.id, index);
};

const validateInputs = () => {
  // Comprobar si hay errores
  const hasEmptyFields = concepts.value.some(c => !c.id || !c.name || !c.start || !c.end);
  
  // Comprobar IDs duplicados
  const ids = concepts.value.map(c => c.id).filter(id => id !== "");
  const hasDuplicateIds = new Set(ids).size !== ids.length;
  
  hasErrors.value = hasEmptyFields || hasDuplicateIds;
  
  return !hasErrors.value;
};

const validInputs = () => {
  if (!validateInputs()) {
    Swal.fire({
      title: 'Error de validación',
      text: hasErrors.value ? 'Hay campos vacíos o IDs duplicados. Por favor, revise el formulario.' : 'Todos los campos son obligatorios.',
      icon: 'warning',
      confirmButtonColor: darkMode.value ? '#f8f9fa' : '#0d6efd',
      background: darkMode.value ? '#343a40' : '#fff',
      color: darkMode.value ? '#fff' : '#000'
    });
    return false;
  }

  return true;
};

const updateCharts = () => {
  // Actualizar gráfico de pastel
  if (pieChart) {
    pieChart.destroy();
  }

  if (pieChartRef.value && Object.keys(results.value).length > 0) {
    const ctx = pieChartRef.value.getContext('2d');
    
    // Preparar datos para el gráfico
    const labels = Object.keys(results.value).map(key => {
      const concept = concepts.value.find(c => c.id === key);
      return concept ? concept.name : key;
    });
    
    const data = Object.values(results.value);
    
    // Colores para cada tipo de hora
    const backgroundColors = Object.keys(results.value).map(key => {
      switch (key) {
        case 'HO': return '#0d6efd';  // Azul para horas ordinarias
        case 'HED': return '#198754'; // Verde para horas extras diurnas
        case 'HEN': return '#dc3545'; // Rojo para horas extras nocturnas
        default: return '#6c757d';    // Gris para otros
      }
    });

    // Crear el gráfico con configuración para modo oscuro
    pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: darkMode.value ? '#fff' : '#666'
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const percentage = calculatePercentage(value);
                return `${label}: ${value} horas (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }
};

// Guardar en localStorage
const saveToLocalStorage = () => {
  try {
    localStorage.setItem('attendanceIn', attendanceIn.value);
    localStorage.setItem('attendanceOut', attendanceOut.value);
    localStorage.setItem('concepts', JSON.stringify(concepts.value));
    localStorage.setItem('darkMode', darkMode.value.toString());
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
  }
};

// Cargar desde localStorage
const loadFromLocalStorage = () => {
  try {
    const storedAttendanceIn = localStorage.getItem('attendanceIn');
    const storedAttendanceOut = localStorage.getItem('attendanceOut');
    const storedConcepts = localStorage.getItem('concepts');
    const storedDarkMode = localStorage.getItem('darkMode');
    
    if (storedAttendanceIn) attendanceIn.value = storedAttendanceIn;
    if (storedAttendanceOut) attendanceOut.value = storedAttendanceOut;
    if (storedConcepts) concepts.value = JSON.parse(storedConcepts);
    if (storedDarkMode !== null) darkMode.value = storedDarkMode === 'true';
    
    validateInputs();
  } catch (error) {
    console.error('Error al cargar desde localStorage:', error);
  }
};

// Toggle modo oscuro
const toggleDarkMode = () => {
  darkMode.value = !darkMode.value;
  saveToLocalStorage();
  
  // Actualizar gráfico si existe
  if (Object.keys(results.value).length > 0) {
    updateCharts();
  }
};

// Resetear formulario
const resetForm = () => {
  Swal.fire({
    title: '¿Resetear formulario?',
    text: 'Se borrarán todos los datos ingresados',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: darkMode.value ? '#f8f9fa' : '#0d6efd',
    cancelButtonColor: darkMode.value ? '#343a40' : '#6c757d',
    confirmButtonText: 'Sí, resetear',
    cancelButtonText: 'Cancelar',
    background: darkMode.value ? '#343a40' : '#fff',
    color: darkMode.value ? '#fff' : '#000'
  }).then((result) => {
    if (result.isConfirmed) {
      // Restablecer valores por defecto
      attendanceIn.value = '08:00';
      attendanceOut.value = '21:30';
      concepts.value = [
        {
          id: "HO",
          name: "Horas Ordinarias",
          start: "08:00",
          end: "17:59"
        },
        {
          id: "HED",
          name: "Horas Extras Diurnas",
          start: "18:00",
          end: "20:59"
        },
        {
          id: "HEN",
          name: "Horas Extras Nocturnas",
          start: "21:00",
          end: "05:59"
        }
      ];
      results.value = {};
      
      // Guardar valores por defecto
      saveToLocalStorage();
      
      // Validar formulario
      validateInputs();
      
      Swal.fire({
        title: 'Formulario reseteado',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: darkMode.value ? '#343a40' : '#fff',
        color: darkMode.value ? '#fff' : '#000'
      });
    }
  });
};

// Observar cambios en los resultados para actualizar gráficos
watch(results, () => {
  if (Object.keys(results.value).length > 0) {
    updateCharts();
  }
});

// Observar cambios en el modo oscuro para actualizar gráficos
watch(darkMode, () => {
  if (Object.keys(results.value).length > 0) {
    updateCharts();
  }
});

// Inicializar componentes cuando se monta
onMounted(() => {
  // Cargar datos guardados
  loadFromLocalStorage();
  
  // Inicializar WOW.js para animaciones
  new WOW().init();
  
  // Inicializar tooltips de Bootstrap si se requieren
  if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }
  
  // Validar formulario al inicio
  validateInputs();
});
</script>

<style>
/* Estilos base */
.home-page {
  transition: background-color 0.3s ease, color 0.3s ease;
  min-height: 100vh;
}

.concept-card {
  transition: all 0.3s ease;
  border-left: 3px solid #0d6efd;
}

.concept-card:hover {
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.15);
}

.results-row {
  transition: all 0.3s ease;
}

.results-row:hover {
  background-color: rgba(13, 110, 253, 0.05);
}

/* Animaciones para listas */
.list-enter-active, .list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* Modo oscuro */
.dark-mode {
  background-color: #212529;
  color: #f8f9fa;
}

.dark-mode .card {
  background-color: #343a40;
  color: #f8f9fa;
  border-color: #495057;
}

.dark-mode .form-control,
.dark-mode .form-select {
  background-color: #495057;
  border-color: #6c757d;
  color: #f8f9fa;
}

.dark-mode .form-label {
  color: #f8f9fa;
}

.dark-mode .table {
  color: #f8f9fa;
}

.dark-mode .concept-card {
  border-left-color: #f8f9fa;
}

.dark-mode .results-row:hover {
  background-color: rgba(248, 249, 250, 0.05);
}

/* Toggle flotante para modo oscuro */
.theme-toggle-wrapper {
  position: fixed;
  right: 20px;
  top: 20px;
  z-index: 1000;
}

.theme-toggle {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  animation: pulse 2s infinite;
  background-color: #fff;
  border: none;
}

.dark-mode .theme-toggle {
  background-color: #343a40;
  color: #f8f9fa;
}

/* Animaciones adicionales */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(13, 110, 253, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(13, 110, 253, 0);
  }
}

/* .dark-mode @keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(248, 249, 250, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(248, 249, 250, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(248, 249, 250, 0);
  }
} */

/* Para validación en tiempo real */
.is-invalid {
  border-color: #dc3545;
  padding-right: calc(1.5em + 0.75rem);
}
</style>