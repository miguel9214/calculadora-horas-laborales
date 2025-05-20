<!-- src/components/ResultsModal.vue (Completamente corregido) -->
<template>
  <!-- Modal de Resultados -->
  <div 
    class="modal fade" 
    id="resultsModal" 
    tabindex="-1" 
    aria-labelledby="resultsModalLabel" 
    aria-hidden="true"
    :class="{'dark-theme': darkMode}"
    ref="modalRef"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content" :class="{'bg-dark text-white': darkMode}">
        <div class="modal-header" :class="darkMode ? 'bg-dark text-white border-secondary' : ''">
          <h5 class="modal-title" id="resultsModalLabel">
            <i class="bi bi-bar-chart me-2"></i>Resultados
          </h5>
          <button 
            type="button" 
            class="btn-close" 
            :class="{'btn-close-white': darkMode}"
            data-bs-dismiss="modal" 
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body" id="printableResults">
          <div v-if="hasResults" class="wow fadeIn">
            <div class="row">
              <!-- Gráfico de pastel -->
              <div class="col-md-6 mb-4 d-flex align-items-center justify-content-center">
                <div class="chart-container">
                  <canvas ref="pieChartRef"></canvas>
                </div>
              </div>
              
              <!-- Tabla de resultados -->
              <div class="col-md-6 table-responsive wow fadeInUp" data-wow-delay="0.2s">
                <table class="table table-bordered table-hover" :class="{'table-dark': darkMode}">
                  <thead :class="darkMode ? 'table-secondary' : 'table-light'">
                    <tr>
                      <th>Concepto</th>
                      <th>Horas</th>
                      <th>Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(hours, concept) in results" :key="concept" class="results-row">
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
            
            <!-- Detalles adicionales para imprimir -->
            <div class="mt-4 d-none d-print-block">
              <h5>Detalles de cálculo:</h5>
              <p>Fecha: {{ new Date().toLocaleDateString() }}</p>
              <p>Hora de entrada: {{ calculationData.attendanceIn }}</p>
              <p>Hora de salida: {{ calculationData.attendanceOut }}</p>
              <div>
                <h6>Configuración de conceptos:</h6>
                <ul>
                  <li v-for="(concept, index) in calculationData.concepts" :key="index">
                    {{ concept.name }}: {{ concept.start }} - {{ concept.end }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center p-5">
            <img src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png" alt="Esperando datos" 
                 class="img-fluid mb-3 wow bounceIn" style="width: 120px;">
            <h5 :class="darkMode ? 'text-light' : 'text-muted'" class="wow fadeIn" data-wow-delay="0.5s">
              No hay resultados para mostrar
            </h5>
          </div>
        </div>
        <div class="modal-footer" :class="darkMode ? 'bg-dark border-secondary' : ''">
          <button 
            type="button" 
            class="btn" 
            :class="darkMode ? 'btn-outline-light' : 'btn-outline-secondary'"
            @click="copyResults" 
          >
            <i class="bi bi-clipboard me-1"></i>Copiar
          </button>
          <button 
            type="button" 
            class="btn" 
            :class="darkMode ? 'btn-outline-light' : 'btn-outline-secondary'"
            @click="printResults" 
          >
            <i class="bi bi-printer me-1"></i>Imprimir
          </button>
          <button 
            type="button" 
            class="btn" 
            :class="darkMode ? 'btn-light' : 'btn-primary'"
            data-bs-dismiss="modal"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// IMPORTANTE: Importar Chart.js explícitamente
import Chart from 'chart.js/auto';
// Importar WOW.js si lo necesitas para animaciones
import WOW from 'wow.js';

export default {
  name: 'ResultsModal',
  props: {
    darkMode: {
      type: Boolean,
      default: false
    },
    results: {
      type: Object,
      default: () => ({})
    },
    totalHours: {
      type: Number,
      default: 0
    },
    calculationData: {
      type: Object,
      default: () => ({
        attendanceIn: '',
        attendanceOut: '',
        concepts: []
      })
    }
  },
  data() {
    return {
      pieChart: null,
      chartInitialized: false,
      modalInstance: null,
      chartColors: {
        HO: '#0d6efd',  // Azul para horas ordinarias
        HED: '#198754', // Verde para horas extras diurnas
        HEN: '#dc3545', // Rojo para horas extras nocturnas
        default: '#6c757d' // Gris para otros
      }
    };
  },
  computed: {
    hasResults() {
      return this.results && Object.keys(this.results).length > 0;
    }
  },
  methods: {
    showModal() {
      console.log('Intentando mostrar modal');
      
      // Verificar que bootstrap está disponible
      if (typeof bootstrap === 'undefined') {
        console.error('Bootstrap no está disponible');
        alert('Error: Bootstrap no está disponible. Asegúrate de que bootstrap.bundle.min.js esté incluido en tu proyecto.');
        return;
      }
      
      this.$nextTick(() => {
        try {
          // Obtener el elemento del modal
          const modalElement = this.$refs.modalRef;
          if (!modalElement) {
            console.error('Elemento del modal no encontrado');
            return;
          }
          
          // Inicializar el modal si es necesario
          if (!this.modalInstance) {
            this.modalInstance = new bootstrap.Modal(modalElement);
          }
          
          // Mostrar el modal
          this.modalInstance.show();
          
          // Forzar inicialización del gráfico después de que el modal sea visible
          modalElement.addEventListener('shown.bs.modal', () => {
            console.log('Modal mostrado - inicializando gráfico');
            setTimeout(() => {
              this.updateChart();
            }, 100);
          }, { once: true });
        } catch (error) {
          console.error('Error al mostrar el modal:', error);
          alert('Error al mostrar el modal. Consulta la consola para más detalles.');
        }
      });
    },
    
    updateChart() {
      console.log('Actualizando gráfico', this.hasResults);
      if (!this.hasResults) {
        console.log('No hay resultados para mostrar en el gráfico');
        return;
      }
      
      // Verificar que Chart.js está disponible
      if (typeof Chart === 'undefined') {
        console.error('Chart.js no está disponible. Asegúrate de que esté importado correctamente.');
        return;
      }
      
      this.$nextTick(() => {
        // Obtener el elemento canvas
        const canvas = this.$refs.pieChartRef;
        if (!canvas) {
          console.warn('Elemento canvas no disponible');
          return;
        }
        
        try {
          // Obtener el contexto 2D
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            console.warn('Contexto 2D no disponible');
            return;
          }
          
          // Destruir gráfico existente si ya existe
          if (this.pieChart) {
            this.pieChart.destroy();
            this.pieChart = null;
          }
          
          // Preparar datos para el gráfico
          const labels = Object.keys(this.results).map(key => {
            const concept = this.calculationData.concepts.find(c => c.id === key);
            return concept ? concept.name : key;
          });
          
          const data = Object.values(this.results);
          
          // Colores para cada tipo de hora
          const backgroundColors = Object.keys(this.results).map(key => {
            return this.chartColors[key] || this.chartColors.default;
          });
          
          console.log('Creando gráfico con datos:', { labels, data, backgroundColors });
          
          // Crear el gráfico
          this.pieChart = new Chart(ctx, {
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
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    color: this.darkMode ? '#fff' : '#666'
                  }
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const label = context.label || '';
                      const value = context.raw || 0;
                      const percentage = this.calculatePercentage(value);
                      return `${label}: ${value} horas (${percentage}%)`;
                    }
                  }
                }
              }
            }
          });
          
          this.chartInitialized = true;
          console.log('Gráfico inicializado correctamente');
          
          // Forzar un redibujado después de crear el gráfico
          window.dispatchEvent(new Event('resize'));
        } catch (error) {
          console.error('Error al crear el gráfico:', error);
        }
      });
    },
    
    calculatePercentage(hours) {
      if (this.totalHours === 0) return 0;
      return Math.round((hours / this.totalHours) * 100);
    },
    
    getBadgeClass(concept) {
      const baseClass = this.darkMode ? 'text-dark ' : '';
      
      switch (concept) {
        case 'HO': return baseClass + 'bg-primary';
        case 'HED': return baseClass + 'bg-success';
        case 'HEN': return baseClass + 'bg-danger';
        default: return baseClass + 'bg-secondary';
      }
    },
    
    getConceptName(conceptId) {
      const concept = this.calculationData.concepts.find(c => c.id === conceptId);
      return concept ? concept.name : conceptId;
    },
    
    printResults() {
      // Guardar el contenido actual de la página
      const originalContent = document.body.innerHTML;
      const printContent = document.getElementById('printableResults').innerHTML;
      
      // Crear un estilo específico para impresión
      const printStyles = `
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          .badge {
            color: #000 !important;
            background-color: #f8f9fa !important;
            border: 1px solid #ddd;
            padding: 5px 10px;
          }
          .chart-container {
            width: 100%;
            max-width: 400px;
            margin: 0 auto 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          h5 {
            margin-top: 20px;
            margin-bottom: 10px;
          }
          .d-none {
            display: block !important;
          }
          .d-print-block {
            display: block !important;
          }
          @media print {
            .modal-footer, .btn-close {
              display: none !important;
            }
          }
        </style>
      `;
      
      // Crear título para la impresión
      const printTitle = `
        <div style="text-align: center; margin-bottom: 20px;">
          <h3>Calculadora de Horas Laborales - Reporte</h3>
          <p>${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
        </div>
      `;
      
      // Preparar página para impresión
      document.body.innerHTML = printStyles + printTitle + printContent;
      
      // Imprimir
      window.print();
      
      // Restaurar el contenido original
      document.body.innerHTML = originalContent;
      
      // Reinicializar componentes después de restaurar
      if (typeof bootstrap !== 'undefined') {
        this.$nextTick(() => {
          try {
            this.modalInstance = new bootstrap.Modal(this.$refs.modalRef);
            this.modalInstance.show();
            
            // Recrear el gráfico después de restaurar la página
            setTimeout(() => {
              this.updateChart();
            }, 500);
          } catch (error) {
            console.error('Error al reinstanciar el modal después de imprimir:', error);
          }
        });
      }
    },
    
    copyResults() {
      // Crear texto para copiar
      let clipboardText = '--- REPORTE DE HORAS LABORALES ---\n\n';
      
      clipboardText += `Fecha: ${new Date().toLocaleDateString()}\n`;
      clipboardText += `Hora de entrada: ${this.calculationData.attendanceIn}\n`;
      clipboardText += `Hora de salida: ${this.calculationData.attendanceOut}\n\n`;
      
      clipboardText += 'RESULTADOS:\n';
      for (const [concept, hours] of Object.entries(this.results)) {
        const conceptName = this.getConceptName(concept);
        const percentage = this.calculatePercentage(hours);
        clipboardText += `${conceptName}: ${hours} horas (${percentage}%)\n`;
      }
      clipboardText += `\nTOTAL: ${this.totalHours} horas\n\n`;
      
      clipboardText += 'CONFIGURACIÓN DE CONCEPTOS:\n';
      this.calculationData.concepts.forEach(concept => {
        clipboardText += `${concept.name}: ${concept.start} - ${concept.end}\n`;
      });
      
      // Copiar al portapapeles
      try {
        navigator.clipboard.writeText(clipboardText)
          .then(() => {
            alert('Los resultados se han copiado al portapapeles');
          })
          .catch(err => {
            console.error('Error al copiar: ', err);
            alert('No se pudo copiar al portapapeles');
          });
      } catch (error) {
        console.error('Error al acceder al portapapeles:', error);
        alert('No se pudo acceder al portapapeles. Esta función puede requerir permisos de navegador o HTTPS.');
      }
    },
    
    // Método para reiniciar el gráfico
    resetChart() {
      if (this.pieChart) {
        this.pieChart.destroy();
        this.pieChart = null;
        this.chartInitialized = false;
      }
    },
    
    // Método para inicializar la biblioteca WOW
    initAnimations() {
      if (typeof WOW !== 'undefined') {
        new WOW().init();
      }
    }
  },
  watch: {
    // Observar cambios en los resultados para actualizar el gráfico
    results: {
      handler(newResults, oldResults) {
        console.log('Resultados cambiaron');
        
        if (Object.keys(newResults).length > 0) {
          // Si hay resultados, verificar si el modal está visible
          if (this.$refs.modalRef && window.getComputedStyle(this.$refs.modalRef).display !== 'none') {
            console.log('Modal visible, actualizando gráfico');
            this.updateChart();
          }
        }
      },
      deep: true
    },
    
    // Observar cambios en el modo oscuro
    darkMode(newValue) {
      console.log('Modo oscuro cambió:', newValue);
      // Si hay un gráfico inicializado, actualizarlo con el nuevo tema
      if (this.chartInitialized) {
        this.resetChart();
        this.$nextTick(() => {
          this.updateChart();
        });
      }
    }
  },
  mounted() {
    console.log('ResultsModal montado');
    
    // Verificar que Chart.js está disponible
    if (typeof Chart === 'undefined') {
      console.error('Chart.js no está disponible después del montaje. Asegúrate de que esté importado correctamente.');
    } else {
      console.log('Chart.js disponible:', Chart.version);
    }
    
    // Inicializar animaciones
    this.initAnimations();
    
    // Si hay resultados al montar, preparar el modal
    if (this.hasResults && typeof bootstrap !== 'undefined') {
      this.$nextTick(() => {
        this.modalInstance = new bootstrap.Modal(this.$refs.modalRef);
      });
    }
    
    // Agregar listener para eventos de modal
    if (typeof document !== 'undefined') {
      // Cuando el modal se muestra completamente
      document.addEventListener('shown.bs.modal', (event) => {
        if (event.target.id === 'resultsModal') {
          console.log('Evento shown.bs.modal detectado');
          this.updateChart();
        }
      });
      
      // Cuando el modal se oculta
      document.addEventListener('hidden.bs.modal', (event) => {
        if (event.target.id === 'resultsModal') {
          console.log('Modal oculto');
        }
      });
    }
  },
  beforeUnmount() {
    // Limpiar recursos antes de desmontar
    if (this.pieChart) {
      this.pieChart.destroy();
      this.pieChart = null;
    }
    
    if (this.modalInstance) {
      this.modalInstance.dispose();
      this.modalInstance = null;
    }
    
    // Remover event listeners
    document.removeEventListener('shown.bs.modal', this.updateChart);
  }
};
</script>

<style scoped>
/* Estilos específicos del componente */
.results-row {
  transition: all 0.3s ease;
}

.results-row:hover {
  background-color: rgba(13, 110, 253, 0.05);
}

:deep(.dark-mode) .results-row:hover {
  background-color: rgba(248, 249, 250, 0.05);
}

/* Modal de resultados */
.modal-content {
  border-radius: 0.5rem;
}

.modal.dark-theme .modal-content {
  background-color: #343a40;
  color: #f8f9fa;
}

/* Contenedor para el gráfico */
.chart-container {
  width: 100%;
  max-width: 400px;
  height: 300px;
  margin: 0 auto;
  position: relative;
}

/* Estilos de impresión */
@media print {
  .d-none.d-print-block {
    display: block !important;
  }
  
  .modal-footer, 
  .btn-close,
  .theme-toggle-wrapper {
    display: none !important;
  }
  
  body {
    background-color: white !important;
    color: black !important;
  }
  
  .card {
    border: none !important;
    box-shadow: none !important;
  }
}
</style>