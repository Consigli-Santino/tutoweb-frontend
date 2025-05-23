import * as XLSX from 'xlsx';

class ExcelExportService {

    /**
     * Exporta las reservas a un archivo Excel
     * @param {Array} reservas - Array de reservas a exportar
     * @param {string} userRole - Rol del usuario (opcional, para el nombre del archivo)
     */
    exportReservasToExcel(reservas, userRole = null) {
        try {
            // Procesar los datos para el Excel
            const excelData = this.processReservasData(reservas);

            // Crear el workbook
            const workbook = XLSX.utils.book_new();

            // Crear la hoja de trabajo
            const worksheet = XLSX.utils.json_to_sheet(excelData);

            // Configurar el ancho de las columnas
            this.setColumnWidths(worksheet);

            // Agregar la hoja al workbook
            const sheetName = 'Reservas';
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

            // Generar el nombre del archivo
            const fileName = this.generateFileName(userRole, reservas.length);

            // Descargar el archivo
            XLSX.writeFile(workbook, fileName);

            console.log(`Archivo Excel exportado: ${fileName}`);
            return true;

        } catch (error) {
            console.error('Error al exportar a Excel:', error);
            throw new Error('Error al generar el archivo Excel');
        }
    }

    /**
     * Procesa los datos de reservas para el formato Excel
     * @param {Array} reservas
     * @returns {Array} Datos procesados para Excel
     */
    processReservasData(reservas) {
        return reservas.map(reserva => ({
            'ID Reserva': reserva.id,
            'Fecha': this.formatDate(reserva.fecha),
            'Hora Inicio': this.formatTime(reserva.hora_inicio),
            'Hora Fin': this.formatTime(reserva.hora_fin),
            'Estado': this.formatEstado(reserva.estado),
            'Modalidad': this.formatModalidad(reserva.servicio?.modalidad),
            'Estudiante': `${reserva.estudiante?.nombre || ''} ${reserva.estudiante?.apellido || ''}`.trim(),
            'Email Estudiante': reserva.estudiante?.email || '',
            'Tutor': `${reserva.tutor?.nombre || ''} ${reserva.tutor?.apellido || ''}`.trim(),
            'Email Tutor': reserva.tutor?.email || '',
            'Puntuación Tutor': reserva.tutor?.puntuacion_promedio || 0,
            'Materia': reserva.materia?.nombre || '',
            'Carrera': reserva.tutor?.carreras?.[0]?.nombre || '',
            'Precio': this.formatPrice(reserva.servicio?.precio),
            'Estado Pago': reserva.pago?.estado || 'Sin pago',
            'Método Pago': this.formatMetodoPago(reserva.pago?.metodo_pago),
            'Fecha Pago': this.formatDateTime(reserva.pago?.fecha_pago),
            'Calificación': reserva.calificacion?.puntuacion || '',
            'Comentario': reserva.calificacion?.comentario || '',
            'Sala Virtual': reserva.sala_virtual || '',
            'Notas': reserva.notas || '',
            'Fecha Creación': this.formatDateTime(reserva.fecha_creacion)
        }));
    }

    /**
     * Configura el ancho de las columnas
     * @param {Object} worksheet
     */
    setColumnWidths(worksheet) {
        const columnWidths = [
            { wch: 10 }, // ID Reserva
            { wch: 12 }, // Fecha
            { wch: 12 }, // Hora Inicio
            { wch: 12 }, // Hora Fin
            { wch: 12 }, // Estado
            { wch: 12 }, // Modalidad
            { wch: 20 }, // Estudiante
            { wch: 25 }, // Email Estudiante
            { wch: 20 }, // Tutor
            { wch: 25 }, // Email Tutor
            { wch: 15 }, // Puntuación Tutor
            { wch: 25 }, // Materia
            { wch: 25 }, // Carrera
            { wch: 12 }, // Precio
            { wch: 15 }, // Estado Pago
            { wch: 15 }, // Método Pago
            { wch: 18 }, // Fecha Pago
            { wch: 12 }, // Calificación
            { wch: 30 }, // Comentario
            { wch: 30 }, // Sala Virtual
            { wch: 30 }, // Notas
            { wch: 18 }  // Fecha Creación
        ];

        worksheet['!cols'] = columnWidths;
    }

    /**
     * Formatea una fecha
     * @param {string} dateString
     * @returns {string}
     */
    formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    }

    /**
     * Formatea una hora
     * @param {string} timeString
     * @returns {string}
     */
    formatTime(timeString) {
        if (!timeString) return '';
        try {
            const [hours, minutes] = timeString.split(':');
            return `${hours}:${minutes}`;
        } catch {
            return timeString;
        }
    }

    /**
     * Formatea fecha y hora
     * @param {string} dateTimeString
     * @returns {string}
     */
    formatDateTime(dateTimeString) {
        if (!dateTimeString) return '';
        try {
            const date = new Date(dateTimeString);
            return date.toLocaleString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateTimeString;
        }
    }

    /**
     * Formatea el estado de la reserva
     * @param {string} estado
     * @returns {string}
     */
    formatEstado(estado) {
        const estados = {
            'completada': 'Completada',
            'cancelada': 'Cancelada',
            'pendiente': 'Pendiente',
            'confirmada': 'Confirmada'
        };
        return estados[estado] || estado;
    }

    /**
     * Formatea la modalidad
     * @param {string} modalidad
     * @returns {string}
     */
    formatModalidad(modalidad) {
        const modalidades = {
            'virtual': 'Virtual',
            'presencial': 'Presencial'
        };
        return modalidades[modalidad] || modalidad;
    }

    /**
     * Formatea el precio
     * @param {number} precio
     * @returns {string}
     */
    formatPrice(precio) {
        if (!precio) return '';
        return `$${precio.toLocaleString('es-AR')}`;
    }

    /**
     * Formatea el método de pago
     * @param {string} metodoPago
     * @returns {string}
     */
    formatMetodoPago(metodoPago) {
        const metodos = {
            'mercado_pago': 'Mercado Pago',
            'efectivo': 'Efectivo',
            'transferencia': 'Transferencia'
        };
        return metodos[metodoPago] || metodoPago;
    }

    /**
     * Genera el nombre del archivo
     * @param {string} userRole - Rol del usuario
     * @param {number} totalRecords - Total de registros
     * @returns {string}
     */
    generateFileName(userRole, totalRecords) {
        const fecha = new Date().toISOString().split('T')[0];
        const hora = new Date().toTimeString().slice(0, 5).replace(':', '');

        let prefijo = 'reservas';
        if (userRole) {
            const roles = {
                'estudiante': 'estudiante',
                'tutor': 'tutor',
                'admin': 'admin'
            };
            prefijo = `reservas_${roles[userRole] || userRole}`;
        }

        return `${prefijo}_${fecha}_${hora}_${totalRecords}reg.xlsx`;
    }

    /**
     * Exporta las materias a un archivo Excel
     * @param {Array} materias - Array de materias a exportar
     */
    exportMateriasToExcel(materias) {
        try {
            // Verificar que hay datos para exportar
            if (!materias || materias.length === 0) {
                throw new Error('No hay materias para exportar');
            }

            // Procesar los datos para el Excel
            const excelData = this.processMateriasData(materias);

            // Crear el workbook
            const workbook = XLSX.utils.book_new();

            // Crear la hoja de trabajo
            const worksheet = XLSX.utils.json_to_sheet(excelData);

            // Configurar el ancho de las columnas para materias
            this.setMateriasColumnWidths(worksheet);

            // Agregar la hoja al workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Materias');

            // Generar el nombre del archivo
            const fileName = this.generateMateriasFileName(materias.length);

            // Descargar el archivo
            XLSX.writeFile(workbook, fileName);

            console.log(`Archivo Excel de materias exportado: ${fileName}`);
            return true;

        } catch (error) {
            console.error('Error al exportar materias a Excel:', error);
            throw new Error('Error al generar el archivo Excel de materias');
        }
    }

    /**
     * Procesa los datos de materias para el formato Excel
     * @param {Array} materias
     * @returns {Array} Datos procesados para Excel
     */
    processMateriasData(materias) {
        return materias.map((materia, index) => ({
            'N°': index + 1,
            'ID': materia.id,
            'Nombre': materia.nombre || '',
            'Descripción': materia.descripcion || '',
            'Año Plan': materia.año_plan || '',
            'ID Carrera': materia.carrera_id || '',
            'Carrera': materia.carrera?.nombre || '', // Por si viene el objeto carrera poblado
            'Estado': materia.activo !== undefined ? (materia.activo ? 'Activa' : 'Inactiva') : 'N/A'
        }));
    }

    /**
     * Configura el ancho de las columnas para materias
     * @param {Object} worksheet
     */
    setMateriasColumnWidths(worksheet) {
        const columnWidths = [
            { wch: 5 },  // N°
            { wch: 8 },  // ID
            { wch: 30 }, // Nombre
            { wch: 50 }, // Descripción
            { wch: 12 }, // Año Plan
            { wch: 12 }, // ID Carrera
            { wch: 25 }, // Carrera
            { wch: 10 }  // Estado
        ];

        worksheet['!cols'] = columnWidths;
    }

    /**
     * Genera el nombre del archivo para materias
     * @param {number} totalRecords - Total de registros
     * @returns {string}
     */
    generateMateriasFileName(totalRecords) {
        const fecha = new Date().toISOString().split('T')[0];
        const hora = new Date().toTimeString().slice(0, 5).replace(':', '');

        return `materias_${fecha}_${hora}_${totalRecords}reg.xlsx`;
    }
    /**
     * Exporta las carreras a un archivo Excel
     * @param {Array} carreras - Array de carreras a exportar
     */
    exportCarrerasToExcel(carreras) {
        try {
            // Verificar que hay datos para exportar
            if (!carreras || carreras.length === 0) {
                throw new Error('No hay carreras para exportar');
            }

            // Procesar los datos para el Excel
            const excelData = this.processCarrerasData(carreras);

            // Crear el workbook
            const workbook = XLSX.utils.book_new();

            // Crear la hoja de trabajo
            const worksheet = XLSX.utils.json_to_sheet(excelData);

            // Configurar el ancho de las columnas para carreras
            this.setCarrerasColumnWidths(worksheet);

            // Agregar la hoja al workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Carreras');

            // Generar el nombre del archivo
            const fileName = this.generateCarrerasFileName(carreras.length);

            // Descargar el archivo
            XLSX.writeFile(workbook, fileName);

            console.log(`Archivo Excel de carreras exportado: ${fileName}`);
            return true;

        } catch (error) {
            console.error('Error al exportar carreras a Excel:', error);
            throw new Error('Error al generar el archivo Excel de carreras');
        }
    }

    /**
     * Procesa los datos de carreras para el formato Excel
     * @param {Array} carreras
     * @returns {Array} Datos procesados para Excel
     */
    processCarrerasData(carreras) {
        return carreras.map((carrera, index) => ({
            'N°': index + 1,
            'ID': carrera.id,
            'Nombre': carrera.nombre || '',
            'Descripción': carrera.descripcion || '',
            'Facultad': carrera.facultad || '',
            'Estado': carrera.activo !== undefined ? (carrera.activo ? 'Activa' : 'Inactiva') : 'N/A',
            'Fecha Creación': carrera.fecha_creacion ? this.formatDateTime(carrera.fecha_creacion) : '',
            'Duración': carrera.duracion ? `${carrera.duracion} años` : '',
            'Modalidad': carrera.modalidad ? this.formatModalidad(carrera.modalidad) : ''
        }));
    }

    /**
     * Configura el ancho de las columnas para carreras
     * @param {Object} worksheet
     */
    setCarrerasColumnWidths(worksheet) {
        const columnWidths = [
            { wch: 5 },  // N°
            { wch: 8 },  // ID
            { wch: 35 }, // Nombre
            { wch: 50 }, // Descripción
            { wch: 30 }, // Facultad
            { wch: 10 }, // Estado
            { wch: 18 }, // Fecha Creación
            { wch: 12 }, // Duración
            { wch: 12 }  // Modalidad
        ];

        worksheet['!cols'] = columnWidths;
    }

    /**
     * Genera el nombre del archivo para carreras
     * @param {number} totalRecords - Total de registros
     * @returns {string}
     */
    generateCarrerasFileName(totalRecords) {
        const fecha = new Date().toISOString().split('T')[0];
        const hora = new Date().toTimeString().slice(0, 5).replace(':', '');

        return `carreras_${fecha}_${hora}_${totalRecords}reg.xlsx`;
    }
    /**
     * Exporta los usuarios a un archivo Excel
     * @param {Array} usuarios - Array de usuarios a exportar
     */
    exportUsersToExcel(usuarios) {
        try {
            // Verificar que hay datos para exportar
            if (!usuarios || usuarios.length === 0) {
                throw new Error('No hay usuarios para exportar');
            }

            // Procesar los datos para el Excel
            const excelData = this.processUsuariosData(usuarios);

            // Crear el workbook
            const workbook = XLSX.utils.book_new();

            // Crear la hoja de trabajo
            const worksheet = XLSX.utils.json_to_sheet(excelData);

            // Configurar el ancho de las columnas para usuarios
            this.setUsuariosColumnWidths(worksheet);

            // Agregar la hoja al workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');

            // Generar el nombre del archivo
            const fileName = this.generateUsuariosFileName(usuarios.length);

            // Descargar el archivo
            XLSX.writeFile(workbook, fileName);

            console.log(`Archivo Excel de usuarios exportado: ${fileName}`);
            return true;

        } catch (error) {
            console.error('Error al exportar usuarios a Excel:', error);
            throw new Error('Error al generar el archivo Excel de usuarios');
        }
    }

    /**
     * Procesa los datos de usuarios para el formato Excel
     * @param {Array} usuarios
     * @returns {Array} Datos procesados para Excel
     */
    processUsuariosData(usuarios) {
        return usuarios.map((usuario, index) => ({
            'N°': index + 1,
            'ID': usuario.id,
            'Nombre Completo': `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim(),
            'Nombre': usuario.nombre || '',
            'Apellido': usuario.apellido || '',
            'Email': usuario.email || '',
            'Rol': this.formatRolUsuario(usuario.rol?.nombre),
            'Carreras': this.formatCarrerasUsuario(usuario.carreras),
            'Puntuación': usuario.puntuacion_promedio || 0,
            'Cant. Reseñas': usuario.cantidad_reseñas || 0,
            'Fecha Registro': this.formatDateTime(usuario.fecha_registro),
            'Tiene Foto': usuario.foto_perfil ? 'Sí' : 'No',
            'Estado': usuario.activo !== undefined ? (usuario.activo ? 'Activo' : 'Inactivo') : 'Activo'
        }));
    }

    /**
     * Formatea el rol del usuario
     * @param {string} rol
     * @returns {string}
     */
    formatRolUsuario(rol) {
        if (!rol) return '';

        const roles = {
            'superAdmin': 'Super Administrador',
            'admin': 'Administrador',
            'alumno&tutor': 'Alumno y Tutor',
            'tutor': 'Tutor',
            'alumno': 'Alumno'
        };

        return roles[rol] || rol;
    }

    /**
     * Formatea las carreras del usuario
     * @param {Array} carreras
     * @returns {string}
     */
    formatCarrerasUsuario(carreras) {
        if (!carreras || carreras.length === 0) return '';

        return carreras.map(carrera => carrera.nombre).join(', ');
    }

    /**
     * Configura el ancho de las columnas para usuarios
     * @param {Object} worksheet
     */
    setUsuariosColumnWidths(worksheet) {
        const columnWidths = [
            { wch: 5 },  // N°
            { wch: 8 },  // ID
            { wch: 25 }, // Nombre Completo
            { wch: 15 }, // Nombre
            { wch: 15 }, // Apellido
            { wch: 30 }, // Email
            { wch: 20 }, // Rol
            { wch: 35 }, // Carreras
            { wch: 12 }, // Puntuación
            { wch: 12 }, // Cant. Reseñas
            { wch: 18 }, // Fecha Registro
            { wch: 12 }, // Tiene Foto
            { wch: 10 }  // Estado
        ];

        worksheet['!cols'] = columnWidths;
    }

    /**
     * Genera el nombre del archivo para usuarios
     * @param {number} totalRecords - Total de registros
     * @returns {string}
     */
    generateUsuariosFileName(totalRecords) {
        const fecha = new Date().toISOString().split('T')[0];
        const hora = new Date().toTimeString().slice(0, 5).replace(':', '');

        return `usuarios_${fecha}_${hora}_${totalRecords}reg.xlsx`;
    }
}

export default new ExcelExportService();