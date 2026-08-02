export interface SampleScenario {
  id: string
  title: string
  subtitle: string
  badgeText: string
  badgeVariant: 'destructive' | 'warning' | 'default' | 'secondary' | 'outline'
  description: string
  expectedFindings: {
    glosasCount: number
    advertenciasCount: number
    summary: string
  }
  clinicalFileName: string
  invoiceFileName: string
  clinicalRecord: string
  preinvoice: string
  clinicalView: {
    idAtencion: string
    idPaciente: string
    nombrePaciente: string
    documentoPaciente: string
    sexoPaciente: string
    fechaAtencion: string
    tipoAtencion: string
    diagnosticoPrincipalCie10: string
    descripcionDiagnostico: string
    medicoTratante: string
    sede: string
    epsAtencion: string
    tipoDocumento: string
    tipoAfiliacion: string
    ciudad: string
    codigoCups: string
    tipoItem: string
    descripcion: string
    cantidadRealizada: string
    fechaRegistro: string
    soporteClinico: string
    profesionalResponsable: string
    evolucion: string
    observaciones: string
    procedimientos: Array<{
      id: string
      tipo: string
      cups: string
      descripcion: string
      cantidad: string
      soporte: string
    }>
    camposObligatoriosFaltantes: string[]
    requiereRevisionHumana: string
    sections: Array<{
      title: string
      fields: Array<{ label: string; value: string }>
    }>
  }
  invoiceView: {
    idPrefactura: string
    idAtencion: string
    idPaciente: string
    nombrePaciente: string
    documentoPaciente: string
    tipoDocumento: string
    eps: string
    regimen: string
    fechaFacturacion: string
    periodoServicio: string
    prestador: string
    nitPrestador: string
    sede: string
    ciudad: string
    contrato: string
    plan: string
    autorizacion: string
    items: Array<{
      id: string
      codigo: string
      descripcion: string
      cantidad: string
      valorUnitario: string
      valorTotal: string
    }>
    subtotal: string
    copago: string
    descuento: string
    impuestos: string
    total: string
    camposObligatoriosFaltantes: string[]
    requiereRevisionHumana: string
    sections: Array<{
      title: string
      fields: Array<{ label: string; value: string }>
    }>
  }
}

export const sampleScenarios: SampleScenario[] = [
  {
    id: 'neumonia-uci-pembrolizumab',
    title: 'Neumonía con Cobro UCI & Alto Costo',
    subtitle: 'Pertinencia médica y trazabilidad de medicamentos',
    badgeText: 'Inconsistencia Severa',
    badgeVariant: 'destructive',
    description:
      'Paciente hospitalizado en piso por neumonía comunitaria. La prefactura incluye cobro por estancia en UCI y Pembrolizumab 200mg no documentados en la historia clínica.',
    expectedFindings: {
      glosasCount: 2,
      advertenciasCount: 1,
      summary: 'Glosas esperadas: UCI sin soporte + Pembrolizumab no trazable',
    },
    clinicalFileName: 'historia-clinica-neumonia-uci.pdf',
    invoiceFileName: 'prefactura-neumonia-uci.pdf',
    clinicalRecord: `Paciente femenino de 62 años.
Ingreso: 10/07/2026. Egreso: 12/07/2026.
Diagnostico: neumonia adquirida en comunidad.
Evolucion: manejo en hospitalizacion general, oxigeno por canula nasal, ceftriaxona 1 g cada 24 horas y terapia respiratoria.
Soportes: hemograma, radiografia de torax y valoracion por medicina interna.
No se documentan servicios de alta complejidad, estudios avanzados, intervenciones quirurgicas ni terapias especiales.`,
    preinvoice: `Prefactura ALT-F4-SIC.
Estancia hospitalaria general x 2 dias.
Unidad de cuidados intensivos UCI x 1 dia.
Ceftriaxona 1 g x 3 dosis.
Terapia respiratoria x 2 sesiones.
Resonancia magnetica de torax.
Medicamento alto costo: pembrolizumab 200 mg.
Honorarios cirugia menor.
Interconsulta cardiologia.`,
    clinicalView: {
      idAtencion: 'ATN-000101',
      idPaciente: 'PAC-00295',
      nombrePaciente: 'María Elena Rodríguez',
      documentoPaciente: 'CC 51.982.401',
      sexoPaciente: 'F',
      fechaAtencion: '2026-07-10',
      tipoAtencion: 'Hospitalización general',
      diagnosticoPrincipalCie10: 'J189',
      descripcionDiagnostico: 'Neumonía adquirida en comunidad',
      medicoTratante: 'Dr. Alejandro Silva (MED-037)',
      sede: 'Sede Principal Urgencias',
      epsAtencion: 'Nueva EPS',
      tipoDocumento: 'CC',
      tipoAfiliacion: 'Subsidiado',
      ciudad: 'Bogotá',
      codigoCups: '890201',
      tipoItem: 'consulta',
      descripcion: 'Consulta de primera vez medicina general',
      cantidadRealizada: '1',
      fechaRegistro: '2026-07-10 06:00',
      soporteClinico: 'SI',
      profesionalResponsable: 'MED-037',
      evolucion:
        'Manejo en hospitalización general, oxígeno por cánula nasal, ceftriaxona 1g cada 24h y terapia respiratoria.',
      observaciones:
        'Soportes: hemograma, radiografía de tórax y valoración por medicina interna. Sin registro de UCI ni alto costo.',
      procedimientos: [
        {
          id: 'DET-1',
          tipo: 'consulta',
          cups: '890201',
          descripcion: 'Consulta de primera vez medicina general',
          cantidad: '1',
          soporte: 'SI',
        },
        {
          id: 'DET-2',
          tipo: 'terapia',
          cups: '939401',
          descripcion: 'Terapia respiratoria integral',
          cantidad: '2',
          soporte: 'SI',
        },
      ],
      camposObligatoriosFaltantes: [],
      requiereRevisionHumana: 'No',
      sections: [
        {
          title: 'Paciente',
          fields: [
            { label: 'Nombre', value: 'María Elena Rodríguez' },
            { label: 'Documento', value: 'CC 51.982.401' },
            { label: 'EPS', value: 'Nueva EPS' },
            { label: 'Régimen', value: 'Subsidiado' },
          ],
        },
        {
          title: 'Historia Clínica',
          fields: [
            { label: 'Ingreso', value: '2026-07-10' },
            { label: 'Egreso', value: '2026-07-12' },
            {
              label: 'Diagnóstico',
              value: 'J189 - Neumonía adquirida en comunidad',
            },
          ],
        },
      ],
    },
    invoiceView: {
      idPrefactura: 'PF-2026-001',
      idAtencion: 'ATN-000101',
      idPaciente: 'PAC-00295',
      nombrePaciente: 'María Elena Rodríguez',
      documentoPaciente: 'CC 51.982.401',
      tipoDocumento: 'CC',
      eps: 'Nueva EPS',
      regimen: 'Subsidiado',
      fechaFacturacion: '2026-07-12',
      periodoServicio: '2026-07-10 a 2026-07-12',
      prestador: 'Hospital Universitario San Juan',
      nitPrestador: '890.102.405-1',
      sede: 'Sede Principal Urgencias',
      ciudad: 'Bogotá',
      contrato: 'CNT-2026-NEPS',
      plan: 'POS Subsidiado',
      autorizacion: 'AUT-994821',
      items: [
        {
          id: 'DET-1',
          codigo: '890201',
          descripcion: 'Consulta de primera vez medicina general',
          cantidad: '1',
          valorUnitario: '$45,000',
          valorTotal: '$45,000',
        },
        {
          id: 'DET-2',
          codigo: 'UCI-001',
          descripcion: 'Unidad de cuidados intensivos UCI x 1 día',
          cantidad: '1',
          valorUnitario: '$1,200,000',
          valorTotal: '$1,200,000',
        },
        {
          id: 'DET-3',
          codigo: 'MED-PEM200',
          descripcion: 'Pembrolizumab 200 mg (Alto costo)',
          cantidad: '1',
          valorUnitario: '$8,500,000',
          valorTotal: '$8,500,000',
        },
      ],
      subtotal: '$9,745,000',
      copago: '$0',
      descuento: '$0',
      impuestos: '$0',
      total: '$9,745,000',
      camposObligatoriosFaltantes: [],
      requiereRevisionHumana: 'Si',
      sections: [
        {
          title: 'Resumen Prefactura',
          fields: [
            { label: 'Prefactura', value: 'PF-2026-001' },
            { label: 'Total Facturado', value: '$9,745,000' },
            { label: 'Items Facturados', value: '3 ítems' },
          ],
        },
      ],
    },
  },

  {
    id: 'colecistectomia-no-soportada',
    title: 'Colecistectomía Laparoscópica sin Soporte',
    subtitle: 'Cruces procedimentales y notas de quirófano',
    badgeText: 'Procedimiento Ausente',
    badgeVariant: 'warning',
    description:
      'Prefactura cobra honorarios quirúrgicos y sala de cirugía por Colecistectomía laparoscópica. En la historia clínica solo figura ecografía y valoración por cólico biliar sin nota quirúrgica.',
    expectedFindings: {
      glosasCount: 1,
      advertenciasCount: 1,
      summary: 'Glosa esperada: Procedimiento quirúrgico no encontrado en historia',
    },
    clinicalFileName: 'historia-clinica-colecistitis.pdf',
    invoiceFileName: 'prefactura-colecistectomia.pdf',
    clinicalRecord: `Paciente masculino de 45 años.
Ingreso: 15/07/2026. Egreso: 16/07/2026.
Diagnostico: colico biliar agudo / colelitiasis.
Evolucion: paciente ingresa por dolor abdominal en hipocondrio derecho. Se realiza ecografia hepatobiliar confirmando colelitiasis sin colecistitis complicada. Manejo dolor con hioscina y diclofenaco.
Soportes: ecografia abdominal, hemograma y amilasa. Se da alta por mejoria del dolor para manejo ambulatorio por cirugia general.
No se realizo intervencion quirurgica en este ingreso.`,
    preinvoice: `Prefactura ALT-F4-SIC.
Consulta urgencias medicina general.
Ecografia hepatobiliar.
Derechos de sala de cirugia mayor.
Procedimiento: colecistectomia laparoscopica.
Honorarios cirujano principal y anestesiologo.
Insumos quirurgicos suturas y trocares laparoscopia.`,
    clinicalView: {
      idAtencion: 'ATN-000204',
      idPaciente: 'PAC-00412',
      nombrePaciente: 'Carlos Alberto Restrepo',
      documentoPaciente: 'CC 79.432.109',
      sexoPaciente: 'M',
      fechaAtencion: '2026-07-15',
      tipoAtencion: 'Urgencias',
      diagnosticoPrincipalCie10: 'K802',
      descripcionDiagnostico: 'Calculo de la vesicula biliar sin colecistitis',
      medicoTratante: 'Dr. Fernando Gómez (MED-102)',
      sede: 'Sede Clínica Norte',
      epsAtencion: 'Sura EPS',
      tipoDocumento: 'CC',
      tipoAfiliacion: 'Contributivo',
      ciudad: 'Medellín',
      codigoCups: '890701',
      tipoItem: 'consulta',
      descripcion: 'Consulta de urgencias por medicina general',
      cantidadRealizada: '1',
      fechaRegistro: '2026-07-15 14:30',
      soporteClinico: 'SI',
      profesionalResponsable: 'MED-102',
      evolucion:
        'Ingreso por cólico biliar. Ecografía hepatobiliar confirma colelitiasis. Control de dolor y alta ambulatoria.',
      observaciones:
        'No se realizó intervención quirúrgica durante este ingreso de urgencias.',
      procedimientos: [
        {
          id: 'DET-1',
          tipo: 'procedimiento',
          cups: '881201',
          descripcion: 'Ecografía hepatobiliar',
          cantidad: '1',
          soporte: 'SI',
        },
      ],
      camposObligatoriosFaltantes: [],
      requiereRevisionHumana: 'No',
      sections: [
        {
          title: 'Paciente',
          fields: [
            { label: 'Nombre', value: 'Carlos Alberto Restrepo' },
            { label: 'Documento', value: 'CC 79.432.109' },
            { label: 'EPS', value: 'Sura EPS' },
          ],
        },
      ],
    },
    invoiceView: {
      idPrefactura: 'PF-2026-042',
      idAtencion: 'ATN-000204',
      idPaciente: 'PAC-00412',
      nombrePaciente: 'Carlos Alberto Restrepo',
      documentoPaciente: 'CC 79.432.109',
      tipoDocumento: 'CC',
      eps: 'Sura EPS',
      regimen: 'Contributivo',
      fechaFacturacion: '2026-07-16',
      periodoServicio: '2026-07-15 a 2026-07-16',
      prestador: 'Clínica Norte S.A.',
      nitPrestador: '900.234.567-8',
      sede: 'Sede Clínica Norte',
      ciudad: 'Medellín',
      contrato: 'CNT-2026-SURA',
      plan: 'POS Contributivo',
      autorizacion: 'AUT-773129',
      items: [
        {
          id: 'DET-1',
          codigo: '890701',
          descripcion: 'Consulta urgencias medicina general',
          cantidad: '1',
          valorUnitario: '$62,000',
          valorTotal: '$62,000',
        },
        {
          id: 'DET-2',
          codigo: 'CIR-5123',
          descripcion: 'Procedimiento: colecistectomia laparoscopica',
          cantidad: '1',
          valorUnitario: '$2,800,000',
          valorTotal: '$2,800,000',
        },
        {
          id: 'DET-3',
          codigo: 'SALA-04',
          descripcion: 'Derechos de sala de cirugia mayor',
          cantidad: '1',
          valorUnitario: '$950,000',
          valorTotal: '$950,000',
        },
      ],
      subtotal: '$3,812,000',
      copago: '$120,000',
      descuento: '$0',
      impuestos: '$0',
      total: '$3,692,000',
      camposObligatoriosFaltantes: [],
      requiereRevisionHumana: 'Si',
      sections: [
        {
          title: 'Resumen Prefactura',
          fields: [
            { label: 'Prefactura', value: 'PF-2026-042' },
            { label: 'Total Facturado', value: '$3,692,000' },
          ],
        },
      ],
    },
  },

  {
    id: 'terapias-sobrefrecuencia',
    title: 'Exceso de Terapias Respiratorias',
    subtitle: 'Frecuencia de servicios y soportes de ejecución',
    badgeText: 'Sobrefrecuencia',
    badgeVariant: 'warning',
    description:
      'Prefactura reporta 10 sesiones de terapia respiratoria en estancia corta (2 días). La historia clínica únicamente documenta 2 sesiones indicadas por el médico tratante.',
    expectedFindings: {
      glosasCount: 1,
      advertenciasCount: 0,
      summary: 'Glosa esperada: Cantidad de terapias superior a la evidencia clínica',
    },
    clinicalFileName: 'historia-clinica-asma-terapias.pdf',
    invoiceFileName: 'prefactura-terapias-respiratorias.pdf',
    clinicalRecord: `Paciente masculino de 28 años.
Ingreso: 20/07/2026. Egreso: 21/07/2026.
Diagnostico: crisis astmatica moderada.
Evolucion: manejo con micronebulizaciones e inhaladores de dosis medida. Se ordenan y ejecutan 2 sesiones de terapia respiratoria durante su estadia en hospitalizacion.
Soportes: notas de enfermeria confirmando la realizacion de 2 terapias respiratorias.
Evolucion satisfactoria con resolucion del broncoespasmo.`,
    preinvoice: `Prefactura ALT-F4-SIC.
Estancia hospitalizacion 1 dia.
Consulta medicina general urgencias.
Terapia respiratoria x 10 sesiones.
Salbutamol inalador x 1 frasco.
Hidrocortisona 100 mg x 2 ampollas.`,
    clinicalView: {
      idAtencion: 'ATN-000389',
      idPaciente: 'PAC-00781',
      nombrePaciente: 'David Eduardo Morales',
      documentoPaciente: 'CC 1.018.943.210',
      sexoPaciente: 'M',
      fechaAtencion: '2026-07-20',
      tipoAtencion: 'Hospitalización corta',
      diagnosticoPrincipalCie10: 'J459',
      descripcionDiagnostico: 'Asma no especificada con broncoespasmo',
      medicoTratante: 'Dra. Claudia Ortiz (MED-088)',
      sede: 'Sede Sur San José',
      epsAtencion: 'Sanitas EPS',
      tipoDocumento: 'CC',
      tipoAfiliacion: 'Contributivo',
      ciudad: 'Cali',
      codigoCups: '939401',
      tipoItem: 'terapia',
      descripcion: 'Terapia respiratoria',
      cantidadRealizada: '2',
      fechaRegistro: '2026-07-20 18:00',
      soporteClinico: 'SI',
      profesionalResponsable: 'MED-088',
      evolucion:
        'Crisis asmática moderada. Manejo con micronebulización y 2 terapias respiratorias documentadas.',
      observaciones: 'Ejecutadas 2 terapias respiratorias por terapeuta de turno.',
      procedimientos: [
        {
          id: 'DET-1',
          tipo: 'terapia',
          cups: '939401',
          descripcion: 'Terapia respiratoria',
          cantidad: '2',
          soporte: 'SI',
        },
      ],
      camposObligatoriosFaltantes: [],
      requiereRevisionHumana: 'No',
      sections: [],
    },
    invoiceView: {
      idPrefactura: 'PF-2026-118',
      idAtencion: 'ATN-000389',
      idPaciente: 'PAC-00781',
      nombrePaciente: 'David Eduardo Morales',
      documentoPaciente: 'CC 1.018.943.210',
      tipoDocumento: 'CC',
      eps: 'Sanitas EPS',
      regimen: 'Contributivo',
      fechaFacturacion: '2026-07-21',
      periodoServicio: '2026-07-20 a 2026-07-21',
      prestador: 'Centro Médico San José',
      nitPrestador: '860.512.981-3',
      sede: 'Sede Sur San José',
      ciudad: 'Cali',
      contrato: 'CNT-2026-SAN',
      plan: 'POS Contributivo',
      autorizacion: 'AUT-441092',
      items: [
        {
          id: 'DET-1',
          codigo: '890701',
          descripcion: 'Consulta medicina general urgencias',
          cantidad: '1',
          valorUnitario: '$55,000',
          valorTotal: '$55,000',
        },
        {
          id: 'DET-2',
          codigo: '939401',
          descripcion: 'Terapia respiratoria x 10 sesiones',
          cantidad: '10',
          valorUnitario: '$35,000',
          valorTotal: '$350,000',
        },
      ],
      subtotal: '$405,000',
      copago: '$45,000',
      descuento: '$0',
      impuestos: '$0',
      total: '$360,000',
      camposObligatoriosFaltantes: [],
      requiereRevisionHumana: 'Si',
      sections: [],
    },
  },

  {
    id: 'caso-conforme-limpio',
    title: 'Hospitalización Conforme (Sin Glosas)',
    subtitle: 'Caso de control con trazabilidad 100% consistente',
    badgeText: 'Sin Glosa',
    badgeVariant: 'secondary',
    description:
      'Historia clínica y prefactura concuerdan de forma exacta en días de estancia general, medicamentos suministrados y exámenes paraclínicos solicitados.',
    expectedFindings: {
      glosasCount: 0,
      advertenciasCount: 0,
      summary: 'Auditoría limpia: No se encontraron inconsistencias o glosas',
    },
    clinicalFileName: 'historia-clinica-gastroenteritis.pdf',
    invoiceFileName: 'prefactura-gastroenteritis.pdf',
    clinicalRecord: `Paciente femenino de 34 años.
Ingreso: 05/07/2026. Egreso: 06/07/2026.
Diagnostico: gastroenteritis aguda deshidratacion moderada.
Evolucion: manejo con suero oral, solucion salina 0.9% 1000 cc y hioscina ampolla. Evolucion favorable con tolerancia oral restablecida.
Soportes: coprologico, hemograma y nota de ingreso/egreso.`,
    preinvoice: `Prefactura ALT-F4-SIC.
Estancia hospitalaria general x 1 dia.
Consulta urgencias medicina general.
Solucion salina 0.9% 1000 cc x 2 bolsas.
Hioscina ampolla x 2 dosis.
Coprologico y hemograma completo.`,
    clinicalView: {
      idAtencion: 'ATN-000055',
      idPaciente: 'PAC-00109',
      nombrePaciente: 'Ana Lucía Gómez',
      documentoPaciente: 'CC 1.020.345.678',
      sexoPaciente: 'F',
      fechaAtencion: '2026-07-05',
      tipoAtencion: 'Hospitalización corta',
      diagnosticoPrincipalCie10: 'A09X',
      descripcionDiagnostico: 'Gastroenteritis y colitis de origen infeccioso',
      medicoTratante: 'Dr. Roberto Mendoza (MED-012)',
      sede: 'Sede Centro Hospitalario',
      epsAtencion: 'Compensar EPS',
      tipoDocumento: 'CC',
      tipoAfiliacion: 'Contributivo',
      ciudad: 'Bogotá',
      codigoCups: '890701',
      tipoItem: 'consulta',
      descripcion: 'Consulta urgencias medicina general',
      cantidadRealizada: '1',
      fechaRegistro: '2026-07-05 10:00',
      soporteClinico: 'SI',
      profesionalResponsable: 'MED-012',
      evolucion:
        'Gastroenteritis aguda. Rehidratación parenteral con solución salina y control de dolor con hioscina.',
      observaciones: 'Tolerancia oral adecuada. Alta con recomendaciones.',
      procedimientos: [
        {
          id: 'DET-1',
          tipo: 'laboratorio',
          cups: '902210',
          descripcion: 'Hemograma completo',
          cantidad: '1',
          soporte: 'SI',
        },
      ],
      camposObligatoriosFaltantes: [],
      requiereRevisionHumana: 'No',
      sections: [],
    },
    invoiceView: {
      idPrefactura: 'PF-2026-019',
      idAtencion: 'ATN-000055',
      idPaciente: 'PAC-00109',
      nombrePaciente: 'Ana Lucía Gómez',
      documentoPaciente: 'CC 1.020.345.678',
      tipoDocumento: 'CC',
      eps: 'Compensar EPS',
      regimen: 'Contributivo',
      fechaFacturacion: '2026-07-06',
      periodoServicio: '2026-07-05 a 2026-07-06',
      prestador: 'Centro Hospitalario San Lucas',
      nitPrestador: '890.900.123-4',
      sede: 'Sede Centro Hospitalario',
      ciudad: 'Bogotá',
      contrato: 'CNT-2026-COMP',
      plan: 'POS Contributivo',
      autorizacion: 'AUT-129048',
      items: [
        {
          id: 'DET-1',
          codigo: '890701',
          descripcion: 'Consulta urgencias medicina general',
          cantidad: '1',
          valorUnitario: '$50,000',
          valorTotal: '$50,000',
        },
        {
          id: 'DET-2',
          codigo: 'EST-001',
          descripcion: 'Estancia hospitalaria general x 1 dia',
          cantidad: '1',
          valorUnitario: '$250,000',
          valorTotal: '$250,000',
        },
      ],
      subtotal: '$300,000',
      copago: '$35,000',
      descuento: '$0',
      impuestos: '$0',
      total: '$265,000',
      camposObligatoriosFaltantes: [],
      requiereRevisionHumana: 'No',
      sections: [],
    },
  },
]
