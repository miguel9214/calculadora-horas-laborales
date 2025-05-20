<!-- src/components/DataEntryForm.vue (Con ID como desplegable) -->
<template>
  <div class="card-body">
    <!-- Formulario de entrada (ocupa todo el ancho) -->
    <div class="card mb-4 wow fadeInDown" data-wow-delay="0.3s">
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
                class="form-control time-input" 
                v-model="attendanceIn" 
                required
                @change="saveData"
              >
            </div>
            <div class="col-md-6">
              <label class="form-label">Hora de salida:</label>
              <input 
                type="time" 
                class="form-control time-input" 
                v-model="attendanceOut" 
                required
                @change="saveData"
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
                      <!-- Selector de ID en lugar de input text -->
                      <select 
                        class="form-select form-select-sm" 
                        v-model="concept.id" 
                        required
                        @change="onConceptIdChange(index); validateInputs(); saveData()"
                        :class="{'is-invalid': isDuplicateId(concept.id, index)}"
                      >
                        <option value="">Seleccione...</option>
                        <option value="HO">HO</option>
                        <option value="HED">HED</option>
                        <option value="HEN">HEN</option>
                      </select>
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
                        @input="validateInputs(); saveData()"
                        :class="{'is-invalid': !concept.name}"
                      >
                    </div>
                    <div class="col-md-2">
                      <label class="form-label small">Inicio:</label>
                      <input 
                        type="time" 
                        class="form-control form-control-sm time-input" 
                        v-model="concept.start" 
                        required
                        @change="saveData()"
                      >
                    </div>
                    <div class="col-md-2">
                      <label class="form-label small">Fin:</label>
                      <input 
                        type="time" 
                        class="form-control form-control-sm time-input" 
                        v-model="concept.end" 
                        required
                        @change="saveData()"
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
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { apiService } from '../services/apiService';
import WOW from 'wow.js';

export default {
  name: 'DataEntryForm',
  props: {
    darkMode: {
      type: Boolean,
      default: false
    },
    initialData: {
      type: Object,
      default: () => ({
        attendanceIn: '08:00',
        attendanceOut: '21:30',
        concepts: [
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
        ]
      })
    }
  },
  emits: ['calculate', 'update:data'],
  data() {
    return {
      attendanceIn: this.initialData.attendanceIn,
      attendanceOut: this.initialData.attendanceOut,
      concepts: [...this.initialData.concepts], // Clonar el array para evitar mutaciones
      loading: false,
      hasErrors: false,
      // Mapeo de IDs a nombres completos
      conceptNamesMap: {
        "HO": "Horas Ordinarias",
        "HED": "Horas Extras Diurnas",
        "HEN": "Horas Extras Nocturnas"
      },
      // Configuración predeterminada de horarios por concepto
      conceptDefaultTimes: {
        "HO": { start: "08:00", end: "17:59" },
        "HED": { start: "18:00", end: "20:59" },
        "HEN": { start: "21:00", end: "05:59" }
      }
    };
  },
  methods: {
    // Método para manejar el cambio de ID y actualizar automáticamente el nombre
    onConceptIdChange(index) {
      const concept = this.concepts[index];
      const selectedId = concept.id;
      
      // Si hay un ID seleccionado, rellenar el nombre automáticamente
      if (selectedId && this.conceptNamesMap[selectedId]) {
        concept.name = this.conceptNamesMap[selectedId];
        
        // Opcionalmente, también podemos establecer los horarios predeterminados
        if (this.conceptDefaultTimes[selectedId]) {
          concept.start = this.conceptDefaultTimes[selectedId].start;
          concept.end = this.conceptDefaultTimes[selectedId].end;
        }
      }
      
      // Validar después del cambio
      this.validateInputs();
    },
    
    // Métodos para conceptos
    addConcept() {
      this.concepts.push({
        id: "",
        name: "",
        start: "00:00",
        end: "23:59"
      });
      
      this.saveData();
      
      // Re-iniciar WOW para animar el nuevo elemento
      setTimeout(() => {
        new WOW().init();
      }, 100);
    },
    
    removeConcept(index) {
      if (this.concepts.length > 1) {
        this.concepts.splice(index, 1);
        this.saveData();
        this.validateInputs();
      }
    },
    
    // Validación
    isDuplicateId(id, currentIndex) {
      if (!id) return false;
      
      return this.concepts.some((concept, index) => 
        concept.id === id && index !== currentIndex && concept.id !== ""
      );
    },
    
    hasValidationError(concept) {
      if (!concept.id || !concept.name) return true;
      
      const index = this.concepts.findIndex(c => c === concept);
      return this.isDuplicateId(concept.id, index);
    },
    
    validateInputs() {
      // Comprobar si hay errores
      const hasEmptyFields = this.concepts.some(c => !c.id || !c.name || !c.start || !c.end);
      
      // Comprobar IDs duplicados
      const ids = this.concepts.map(c => c.id).filter(id => id !== "");
      const hasDuplicateIds = new Set(ids).size !== ids.length;
      
      this.hasErrors = hasEmptyFields || hasDuplicateIds;
      
      return !this.hasErrors;
    },
    
    validInputs() {
      if (!this.validateInputs()) {
        alert(this.hasErrors ? 'Hay campos vacíos o IDs duplicados. Por favor, revise el formulario.' : 'Todos los campos son obligatorios.');
        return false;
      }

      return true;
    },
    
    // Comunicación con el componente padre
    saveData() {
      this.$emit('update:data', {
        attendanceIn: this.attendanceIn,
        attendanceOut: this.attendanceOut,
        concepts: this.concepts
      });
    },
    
    // Cálculo de horas
    async calculateHours() {
      if (this.hasErrors) {
        alert('Por favor, corrija los errores en el formulario antes de continuar.');
        return;
      }

      this.loading = true;

      try {
        // Validar formato de datos
        if (!this.validInputs()) {
          this.loading = false;
          return;
        }

        // Datos para la API
        const payload = {
          attendanceIn: this.attendanceIn,
          attendanceOut: this.attendanceOut,
          concepts: this.concepts.map(concept => ({
            id: concept.id,
            name: concept.id, // Usar ID como nombre para la API
            start: concept.start,
            end: concept.end
          }))
        };

        console.log('Enviando datos a la API:', payload);

        // Llamar a la API a través del servicio
        const results = await apiService.calculateHours(payload);
        console.log('Resultados recibidos:', results);

        // Emitir directamente al componente padre sin mostrar SweetAlert
        this.$emit('calculate', {
          results,
          attendanceIn: this.attendanceIn,
          attendanceOut: this.attendanceOut,
          concepts: [...this.concepts] // Clonar para evitar problemas de referencia
        });

      } catch (error) {
        console.error('Error al calcular horas:', error);
        alert('Ocurrió un problema al procesar su solicitud. Por favor, intente nuevamente.');
      } finally {
        this.loading = false;
      }
    },
    
    // Resetear formulario
    resetForm() {
      if (!confirm('¿Está seguro de que desea resetear el formulario? Se borrarán todos los datos ingresados.')) {
        return;
      }
      
      // Restablecer valores por defecto
      this.attendanceIn = '08:00';
      this.attendanceOut = '21:30';
      this.concepts = [
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
      
      // Guardar datos
      this.saveData();
      
      // Validar formulario
      this.validateInputs();
      
      // Notificar éxito
      alert('Formulario reseteado correctamente.');
    }
  },
  mounted() {
    // Asegurarse de que los valores iniciales se apliquen correctamente
    this.attendanceIn = this.initialData.attendanceIn;
    this.attendanceOut = this.initialData.attendanceOut;
    this.concepts = [...this.initialData.concepts];
    
    // Validar formulario al inicio
    this.validateInputs();
    
    // Inicializar animaciones WOW
    if (typeof WOW !== 'undefined') {
      new WOW().init();
    }
  },
  watch: {
    // Observar cambios en las props para actualizar el estado local
    initialData: {
      handler(newData) {
        this.attendanceIn = newData.attendanceIn;
        this.attendanceOut = newData.attendanceOut;
        this.concepts = [...newData.concepts];
        this.validateInputs();
      },
      deep: true
    }
  }
};
</script>

<style scoped>
/* Estilos específicos del componente */
.concept-card {
  transition: all 0.3s ease;
  border-left: 3px solid #0d6efd;
}

.concept-card:hover {
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.15);
}

.dark-mode .concept-card {
  border-left-color: #f8f9fa;
}

/* Animaciones para listas */
.list-enter-active, .list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* Mejorar visualización de campos de tiempo */
.time-input {
  min-width: 100px;
  padding-right: 5px;
  font-family: monospace;
  text-align: center;
}

/* Estilo para el select de conceptos */
.form-select-sm {
  font-weight: 500;
}

/* Estilos para opciones del select en modo oscuro */
:deep(.dark-mode) .form-select {
  background-color: #495057;
  color: #f8f9fa;
  border-color: #6c757d;
}

:deep(.dark-mode) .form-select option {
  background-color: #343a40;
  color: #f8f9fa;
}

/* En dispositivos móviles, hacer los campos de tiempo más grandes */
@media (max-width: 768px) {
  .time-input {
    min-width: 120px;
    height: 38px;
    font-size: 16px; /* Evitar zoom automático en iOS */
  }
  
  /* Ajustar el tamaño de los elementos en pantallas pequeñas */
  .concept-card .row .col-md-2,
  .concept-card .row .col-md-3,
  .concept-card .row .col-md-4 {
    margin-bottom: 10px;
  }
  
  .concept-card .card-body {
    padding: 10px;
  }
}

/* Asegurar que los iconos del selector de tiempo sean visibles */
input[type="time"]::-webkit-calendar-picker-indicator {
  opacity: 1;
  display: block;
  background-color: transparent;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

/* Mejorar visualización en modo oscuro */
:deep(.dark-mode) .time-input::-webkit-calendar-picker-indicator {
  filter: invert(1);
}
</style>