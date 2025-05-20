<!-- src/views/HomePage.vue (Simplificado) -->
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
              <h3 class="text-center font-weight-bold my-2 wow fadeIn text-white" data-wow-delay="0.2s">
                <i class="bi bi-clock me-2"></i>Calculadora de Horas Laborales
              </h3>
            </div>
            
            <!-- Componente de formulario -->
            <DataEntryForm 
              :darkMode="darkMode"
              :initialData="formData"
              @calculate="handleCalculate"
              @update:data="updateFormData"
            />
            
            <div class="card-footer text-center" :class="darkMode ? 'text-light bg-dark' : 'text-muted'">
              Calculadora de Horas Laborales | {{ new Date().getFullYear() }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Componente modal de resultados -->
    <ResultsModal
      :darkMode="darkMode"
      :results="results" 
      :totalHours="totalHours"
      :calculationData="formData"
      ref="resultsModalRef"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import DataEntryForm from '../components/DataEntryForm.vue';
import ResultsModal from '../components/ResultsModal.vue';

export default {
  name: 'HomePage',
  components: {
    DataEntryForm,
    ResultsModal
  },
  data() {
    return {
      darkMode: false,
      results: {},
      formData: {
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
      }
    };
  },
  computed: {
    totalHours() {
      if (!this.results || Object.keys(this.results).length === 0) return 0;
      return Object.values(this.results).reduce((sum, hours) => sum + hours, 0);
    }
  },
  methods: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      this.saveToLocalStorage();
    },
    
    updateFormData(data) {
      this.formData = { ...this.formData, ...data };
      this.saveToLocalStorage();
    },
    
    handleCalculate(data) {
      console.log('Resultados recibidos:', data);
      
      // Actualizar el estado con los datos del formulario
      this.results = data.results;
      this.formData = {
        attendanceIn: data.attendanceIn,
        attendanceOut: data.attendanceOut,
        concepts: [...data.concepts]
      };
      
      // Guardar datos en localStorage
      this.saveToLocalStorage();
      
      // Mostrar el modal directamente después de calcular
      this.$nextTick(() => {
        if (this.$refs.resultsModalRef) {
          this.$refs.resultsModalRef.showModal();
        } else {
          console.error('Referencia al modal no disponible');
        }
      });
    },
    
    // LocalStorage
    saveToLocalStorage() {
      try {
        localStorage.setItem('attendanceIn', this.formData.attendanceIn);
        localStorage.setItem('attendanceOut', this.formData.attendanceOut);
        localStorage.setItem('concepts', JSON.stringify(this.formData.concepts));
        localStorage.setItem('darkMode', this.darkMode.toString());
      } catch (error) {
        console.error('Error al guardar en localStorage:', error);
      }
    },

    loadFromLocalStorage() {
      try {
        const storedAttendanceIn = localStorage.getItem('attendanceIn');
        const storedAttendanceOut = localStorage.getItem('attendanceOut');
        const storedConcepts = localStorage.getItem('concepts');
        const storedDarkMode = localStorage.getItem('darkMode');
        
        if (storedAttendanceIn) this.formData.attendanceIn = storedAttendanceIn;
        if (storedAttendanceOut) this.formData.attendanceOut = storedAttendanceOut;
        if (storedConcepts) this.formData.concepts = JSON.parse(storedConcepts);
        if (storedDarkMode !== null) this.darkMode = storedDarkMode === 'true';
      } catch (error) {
        console.error('Error al cargar desde localStorage:', error);
      }
    }
  },
  mounted() {
    // Cargar datos de localStorage
    this.loadFromLocalStorage();
    
    // Inicializar animaciones si WOW está disponible
    if (typeof WOW !== 'undefined') {
      new WOW().init();
    }
  }
};
</script>

<style>
/* Estilos base */
.home-page {
  transition: background-color 0.3s ease, color 0.3s ease;
  min-height: 100vh;
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
</style>