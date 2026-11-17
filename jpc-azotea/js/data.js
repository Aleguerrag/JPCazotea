/* Única fuente de cifras del reportaje. El HTML las lee con data-dato="clave". */
window.DATOS = {
  fuentes: {
    icesi: { nombre: 'Universidad Icesi con datos del MEN · cobertura neta en media 2023', estado: 'verificado' },
    sineb: { nombre: 'SINEB, Ministerio de Educación Nacional · Buenaventura 2023', estado: 'verificado' },
    jpc:   { nombre: 'Documento integrado JPC 2027 (noviembre de 2026)', estado: 'proyección' },
    diag:  { nombre: 'Diagnósticos territoriales JPC: Buenaventura, Cauca, Nariño y Chocó', estado: 'respaldado con límites' }
  },
  cobertura_media: { // %, 2023
    nacional: 50.9, buenaventura: 33.7, cauca: 37.2, narino: 37.3, choco: 25.1, fuente: 'icesi'
  },
  buenaventura_2023: { aprobacion: 85.6, repitencia: 13.0, desercion: 3.53, fuente: 'sineb' },
  metas_2030: {
    nodos: 6, personas: 2800, inscripciones: 3600, aprobacion: 92, certificados: 1050,
    empleo: 525, sembradores: 36, efecto_pp: 5.6, fuente: 'jpc'
  },
  cupos: { t1: 90, t2: 60, t3: 90 }, // por nodo al año
  inversion: { // millones de pesos
    completo: { total: 16762.0, anio1: 1806.9, nodo: 920.4 },
    basico:   { total: 14577.1, anio1: 1666.4, nodo: 788.0 },
    fuente: 'jpc'
  }
};
