// src/services/apiService.js

/**
 * Servicio para manejar todas las comunicaciones con el API de cálculo de horas.
 * Encapsula la lógica de comunicación HTTP y manejo de errores.
 */
export const apiService = {
  /**
   * URL base de la API
   */
  baseUrl: 'https://falconcloud.co/site_srv10_ph/site/api/qserv.php/13465-770721',
  
  /**
   * Calcula las horas según los conceptos y horarios proporcionados
   * 
   * @param {Object} payload - Datos para el cálculo
   * @param {string} payload.attendanceIn - Hora de entrada en formato "HH:MM"
   * @param {string} payload.attendanceOut - Hora de salida en formato "HH:MM"
   * @param {Array} payload.concepts - Lista de conceptos con sus horarios
   * @returns {Promise<Object>} - Objeto con los resultados del cálculo (horas por concepto)
   * @throws {Error} - Error si la solicitud falla
   */
  async calculateHours(payload) {
    try {
      // Validar datos de entrada
      this.validatePayload(payload);
      
      // Configurar opciones de la solicitud
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      };
      
      // Realizar la solicitud
      const response = await fetch(this.baseUrl, options);
      
      // Manejar respuesta no exitosa
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Error desconocido');
        throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}. ${errorText}`);
      }
      
      // Procesar y retornar la respuesta
      return await response.json();
    } catch (error) {
      console.error('Error en el servicio API:', error);
      
      // Re-lanzar el error con mensaje más descriptivo
      if (error.message.includes('Failed to fetch')) {
        throw new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.');
      }
      
      throw error;
    }
  },
  
  /**
   * Valida los datos de entrada antes de enviarlos a la API
   * 
   * @param {Object} payload - Datos a validar
   * @throws {Error} - Error si los datos no son válidos
   */
  validatePayload(payload) {
    // Verificar que existan los campos requeridos
    if (!payload) {
      throw new Error('Los datos de cálculo son requeridos');
    }
    
    if (!payload.attendanceIn || !payload.attendanceOut) {
      throw new Error('Las horas de entrada y salida son requeridas');
    }
    
    if (!payload.concepts || !Array.isArray(payload.concepts) || payload.concepts.length === 0) {
      throw new Error('Se requiere al menos un concepto de horas');
    }
    
    // Validar formato de horas
    const timeRegex = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;
    
    if (!timeRegex.test(payload.attendanceIn)) {
      throw new Error('Formato de hora de entrada inválido. Debe ser HH:MM');
    }
    
    if (!timeRegex.test(payload.attendanceOut)) {
      throw new Error('Formato de hora de salida inválido. Debe ser HH:MM');
    }
    
    // Validar conceptos
    payload.concepts.forEach((concept, index) => {
      if (!concept.id || !concept.name || !concept.start || !concept.end) {
        throw new Error(`El concepto en la posición ${index + 1} tiene campos faltantes`);
      }
      
      if (!timeRegex.test(concept.start)) {
        throw new Error(`El concepto "${concept.name}" tiene un formato de hora de inicio inválido`);
      }
      
      if (!timeRegex.test(concept.end)) {
        throw new Error(`El concepto "${concept.name}" tiene un formato de hora de fin inválido`);
      }
    });
  },
  
  /**
   * Simula el cálculo de horas para pruebas sin conexión
   * Útil para desarrollo y pruebas cuando la API no está disponible
   * 
   * @param {Object} payload - Datos para el cálculo
   * @returns {Promise<Object>} - Objeto simulado con resultados
   */
  async mockCalculateHours(payload) {
    return new Promise((resolve) => {
      // Simular retraso de red
      setTimeout(() => {
        // Crear un resultado simulado basado en los conceptos proporcionados
        const results = {};
        let totalHours = 0;
        
        // Convertir horas a minutos para facilitar cálculos
        const startMinutes = this.timeToMinutes(payload.attendanceIn);
        const endMinutes = this.timeToMinutes(payload.attendanceOut);
        
        // Ajustar si cruza la medianoche
        const totalMinutes = endMinutes < startMinutes 
          ? (endMinutes + 24 * 60) - startMinutes 
          : endMinutes - startMinutes;
        
        // Distribuir minutos entre conceptos (simulación simple)
        payload.concepts.forEach(concept => {
          // Asignar horas al azar para cada concepto
          const conceptHours = Math.round((Math.random() * totalMinutes / 60) * 10) / 10;
          
          if (conceptHours > 0) {
            results[concept.id] = conceptHours;
            totalHours += conceptHours;
          }
        });
        
        // Ajustar para que el total sea correcto
        if (totalHours > 0) {
          const adjustment = (totalMinutes / 60) / totalHours;
          
          Object.keys(results).forEach(key => {
            results[key] = Math.round(results[key] * adjustment * 10) / 10;
          });
        } else if (payload.concepts.length > 0) {
          // Si no hay horas asignadas, asignar todas al primer concepto
          results[payload.concepts[0].id] = Math.round(totalMinutes / 60 * 10) / 10;
        }
        
        resolve(results);
      }, 500); // Simular 500ms de latencia
    });
  },
  
  /**
   * Convierte una hora en formato HH:MM a minutos desde la medianoche
   * 
   * @param {string} time - Hora en formato HH:MM
   * @returns {number} - Minutos desde la medianoche
   */
  timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
};

export default apiService;