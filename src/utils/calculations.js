// src/utils/calculations.js

/**
 * Cálculos y validaciones para la lógica de negocio
 */

// Calcular total de horas
export const calculateTotalHours = (results) => {
  if (!results || Object.keys(results).length === 0) return 0;
  return Object.values(results).reduce((sum, hours) => sum + hours, 0);
};

// Calcular porcentaje de horas
export const calculatePercentage = (hours, totalHours) => {
  if (totalHours === 0) return 0;
  return Math.round((hours / totalHours) * 100);
};

// Obtener clase de badge para cada concepto
export const getBadgeClass = (concept, isDarkMode) => {
  const baseClass = isDarkMode ? 'text-dark ' : '';
  
  switch (concept) {
    case 'HO': return baseClass + 'bg-primary';
    case 'HED': return baseClass + 'bg-success';
    case 'HEN': return baseClass + 'bg-danger';
    default: return baseClass + 'bg-secondary';
  }
};

// Verificar si un ID está duplicado
export const isDuplicateId = (id, currentIndex, concepts) => {
  if (!id) return false;
  
  return concepts.some((concept, index) => 
    concept.id === id && index !== currentIndex && concept.id !== ""
  );
};

// Verificar si un concepto tiene error de validación
export const hasValidationError = (concept, index, concepts) => {
  if (!concept.id || !concept.name) return true;
  return isDuplicateId(concept.id, index, concepts);
};

// Colores para el gráfico según conceptos
export const getChartColors = (conceptIds) => {
  return conceptIds.map(key => {
    switch (key) {
      case 'HO': return '#0d6efd';  // Azul para horas ordinarias
      case 'HED': return '#198754'; // Verde para horas extras diurnas
      case 'HEN': return '#dc3545'; // Rojo para horas extras nocturnas
      default: return '#6c757d';    // Gris para otros
    }
  });
};