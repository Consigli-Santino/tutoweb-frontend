import emailjs from '@emailjs/browser';

class EmailService {
    constructor() {
        this.serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        this.publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        // Solo 2 templates
        this.templates = {
            reservaNotifications: import.meta.env.VITE_EMAILJS_TEMPLATE_RESERVA,
            pagoNotifications: import.meta.env.VITE_EMAILJS_TEMPLATE_PAGO
        };

        if (this.publicKey) {
            emailjs.init(this.publicKey);
        }
    }

    /**
     * Envía email de nueva reserva (para tutor)
     */
    async enviarEmailNuevaReserva(reserva) {
        const templateParams = {
            to_email: reserva.tutor.email,
            to_name: `${reserva.tutor.nombre} ${reserva.tutor.apellido}`,
            subject_line: `🔔 Nueva Reserva - ${reserva.materia.nombre}`,
            // Variables requeridas por el template de EmailJS
            title: `Nueva Reserva - ${reserva.materia.nombre}`,
            email: reserva.tutor.email,
            name: 'TutoWeb',
            // Variables del contenido
            email_icon: '🔔',
            header_message: 'Un estudiante quiere tomar tutoría contigo',
            action_message: `¡Tienes una nueva solicitud de tutoría de ${reserva.estudiante.nombre} ${reserva.estudiante.apellido}!`,
            box_class: 'info',
            materia: reserva.materia.nombre,
            estudiante_name: `${reserva.estudiante.nombre} ${reserva.estudiante.apellido}`,
            fecha: new Date(reserva.fecha).toLocaleDateString('es-AR'),
            hora_inicio: reserva.hora_inicio,
            hora_fin: reserva.hora_fin,
            modalidad: reserva.servicio?.modalidad || 'virtual',
            precio: reserva.servicio?.precio || 0,
            additional_info: 'Puedes confirmar o rechazar esta reserva desde tu panel de tutorías.',
            closing_message: '¡Gracias por ser parte de nuestra comunidad de tutores! 🎓',
            reserva_id: reserva.id,
            footer_note: 'Accede a tu panel para gestionar esta reserva.'
        };

        return this.enviarEmail(this.templates.reservaNotifications, templateParams, 'nueva reserva');
    }

    /**
     * Envía email cuando se confirma una reserva (para estudiante)
     */
    async enviarEmailReservaConfirmada(reserva) {
        console.log(reserva);
        const templateParams = {
            to_email: reserva.estudiante.email,
            to_name: `${reserva.estudiante.nombre} ${reserva.estudiante.apellido}`,
            subject_line: `✅ Reserva Confirmada - ${reserva.materia.nombre}`,
            // Variables requeridas por el template de EmailJS
            title: `Reserva Confirmada - ${reserva.materia.nombre}`,
            email: reserva.estudiante.email,
            name: 'TutoWeb',
            // Variables del contenido
            email_icon: '✅',
            header_message: 'Tu tutoría ha sido confirmada por el tutor',
            action_message: `¡Excelente noticia! Tu reserva para la tutoría de ${reserva.materia.nombre} ha sido confirmada por ${reserva.tutor.nombre} ${reserva.tutor.apellido}.`,
            box_class: 'success',
            materia: reserva.materia.nombre,
            tutor_name: `${reserva.tutor.nombre} ${reserva.tutor.apellido}`,
            fecha: new Date(reserva.fecha).toLocaleDateString('es-AR'),
            hora_inicio: reserva.hora_inicio,
            hora_fin: reserva.hora_fin,
            modalidad: reserva.servicio?.modalidad || 'virtual',
            precio: reserva.servicio?.precio || 0,
            sala_virtual: reserva.sala_virtual || 'Se enviará próximamente',
            additional_info: 'Para tutorías virtuales, podrás acceder a la videollamada 15 minutos antes del inicio. Puedes cancelar hasta 2 horas antes del horario programado.',
            closing_message: '¡Te deseamos una excelente sesión de aprendizaje! 📚✨',
            reserva_id: reserva.id,
            footer_note: 'Este es un email automático, por favor no respondas a este mensaje.'
        };

        return this.enviarEmail(this.templates.reservaNotifications, templateParams, 'reserva confirmada');
    }

    /**
     * Envía email cuando se completa una reserva
     */
    async enviarEmailReservaCompletada(reserva, paraEstudiante = true) {
        const destinatario = paraEstudiante ? reserva.estudiante : reserva.tutor;
        const otroParticipante = paraEstudiante ? reserva.tutor : reserva.estudiante;

        const templateParams = {
            to_email: destinatario.email,
            to_name: `${destinatario.nombre} ${destinatario.apellido}`,
            subject_line: `✅ Tutoría Completada - ${reserva.materia.nombre}`,
            title: `Tutoría Completada - ${reserva.materia.nombre}`,
            email: destinatario.email,
            name: 'TutoWeb',
            email_icon: '🎉',
            header_message: 'La sesión ha finalizado exitosamente',
            action_message: `La tutoría de ${reserva.materia.nombre} con ${otroParticipante.nombre} ${otroParticipante.apellido} ha sido marcada como completada.`,
            box_class: 'success',
            materia: reserva.materia.nombre,
            tutor_name: paraEstudiante ? `${reserva.tutor.nombre} ${reserva.tutor.apellido}` : undefined,
            estudiante_name: !paraEstudiante ? `${reserva.estudiante.nombre} ${reserva.estudiante.apellido}` : undefined,
            fecha: new Date(reserva.fecha).toLocaleDateString('es-AR'),
            hora_inicio: reserva.hora_inicio,
            hora_fin: reserva.hora_fin,
            additional_info: paraEstudiante ? 'Ahora puedes calificar la tutoría desde tu panel de reservas.' : 'El estudiante podrá calificarte próximamente.',
            closing_message: '¡Esperamos que haya sido una experiencia de aprendizaje enriquecedora! 📚✨',
            reserva_id: reserva.id,
            footer_note: '¡Gracias por ser parte de nuestra comunidad educativa!'
        };

        return this.enviarEmail(this.templates.reservaNotifications, templateParams, 'reserva completada');
    }

    /**
     * Envía email cuando se cancela una reserva - CORREGIDO
     */
    async enviarEmailReservaCancelada(reserva, canceladoPor = 'estudiante') {
        const emails = [];

        // Email al estudiante si no fue quien canceló
        if (canceladoPor !== 'estudiante') {
            const templateParams = {
                to_email: reserva.estudiante.email,
                to_name: `${reserva.estudiante.nombre} ${reserva.estudiante.apellido}`,
                subject_line: `❌ Reserva Cancelada - ${reserva.materia.nombre}`,
                // Variables requeridas por el template de EmailJS
                title: `Reserva Cancelada - ${reserva.materia.nombre}`,
                email: reserva.estudiante.email,
                name: 'TutoWeb',
                // Variables del contenido
                email_icon: '❌',
                header_message: 'Tu reserva ha sido cancelada',
                action_message: `Te informamos que la reserva para la tutoría de ${reserva.materia.nombre} ha sido cancelada por ${canceladoPor}.`,
                box_class: 'danger',
                materia: reserva.materia.nombre,
                tutor_name: `${reserva.tutor.nombre} ${reserva.tutor.apellido}`,
                estudiante_name: '', // Vacío para el estudiante
                fecha: new Date(reserva.fecha).toLocaleDateString('es-AR'),
                hora_inicio: reserva.hora_inicio,
                hora_fin: reserva.hora_fin,
                modalidad: reserva.servicio?.modalidad || 'Virtual',
                precio: reserva.servicio?.precio || 'A consultar',
                sala_virtual: reserva.sala_virtual || 'N/A',
                additional_info: `La reserva fue cancelada por ${canceladoPor}. Si necesitas reagendar, puedes realizar una nueva reserva desde tu panel.`,
                closing_message: '¡Esperamos poder ayudarte en el futuro! 📚',
                reserva_id: reserva.id,
                footer_note: 'Puedes realizar una nueva reserva cuando gustes.'
            };
            emails.push(this.enviarEmail(this.templates.reservaNotifications, templateParams, 'cancelación estudiante'));
        }

        // Email al tutor si no fue quien canceló
        if (canceladoPor !== 'tutor') {
            const templateParams = {
                to_email: reserva.tutor.email,
                to_name: `${reserva.tutor.nombre} ${reserva.tutor.apellido}`,
                subject_line: `❌ Reserva Cancelada - ${reserva.materia.nombre}`,
                title: `Reserva Cancelada - ${reserva.materia.nombre}`,
                email: reserva.tutor.email,
                name: 'TutoWeb',
                email_icon: '❌',
                header_message: 'Una reserva ha sido cancelada',
                action_message: `Te informamos que la reserva para la tutoría de ${reserva.materia.nombre} con ${reserva.estudiante.nombre} ${reserva.estudiante.apellido} ha sido cancelada por ${canceladoPor}.`,
                box_class: 'danger',
                materia: reserva.materia.nombre,
                tutor_name: '', // Vacío para el tutor
                estudiante_name: `${reserva.estudiante.nombre} ${reserva.estudiante.apellido}`,
                fecha: new Date(reserva.fecha).toLocaleDateString('es-AR'),
                hora_inicio: reserva.hora_inicio,
                hora_fin: reserva.hora_fin,
                modalidad: reserva.servicio?.modalidad || 'Virtual',
                precio: reserva.servicio?.precio || 'A consultar',
                sala_virtual: reserva.sala_virtual || 'N/A',
                additional_info: `La reserva fue cancelada por ${canceladoPor}. Tu horario queda nuevamente disponible para otras reservas.`,
                closing_message: '¡Gracias por tu comprensión! 📚',
                reserva_id: reserva.id,
                footer_note: 'Tu tiempo sigue disponible para nuevas reservas.'
            };
            emails.push(this.enviarEmail(this.templates.reservaNotifications, templateParams, 'cancelación tutor'));
        }

        try {
            const results = await Promise.all(emails);
            return { success: true, results };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Envía email cuando se confirma un pago - ADAPTADO AL TEMPLATE DE PAGOS
     */
    async enviarEmailPagoConfirmado(reserva, pago) {
        const templateParams = {
            to_email: reserva.estudiante.email,
            to_name: `${reserva.estudiante.nombre} ${reserva.estudiante.apellido}`,
            subject_line: `💳 Pago Confirmado - ${reserva.materia.nombre}`,
            header_message: 'Tu pago ha sido procesado exitosamente',
            payment_message: `Confirmamos que hemos recibido tu pago por la tutoría de ${reserva.materia.nombre} con ${reserva.tutor.nombre} ${reserva.tutor.apellido}.`,
            receipt_title: 'Comprobante de Pago',
            materia: reserva.materia.nombre,
            tutor_name: `${reserva.tutor.nombre} ${reserva.tutor.apellido}`,
            fecha: new Date(reserva.fecha).toLocaleDateString('es-AR'),
            hora_inicio: reserva.hora_inicio,
            hora_fin: reserva.hora_fin,
            monto: pago.monto,
            metodo_pago: pago.metodo_pago === 'mercado_pago' ? 'Mercado Pago' : 'Efectivo',
            fecha_pago: new Date(pago.fecha_pago).toLocaleDateString('es-AR'),
            pago_id: pago.id,
            closing_message: '¡Gracias por tu pago! Ahora puedes calificar la tutoría desde tu panel de reservas una vez completada la sesión. Tu feedback es muy importante para nosotros.',
            reserva_id: reserva.id,
            footer_note: 'Guarda este comprobante para tus registros.'
        };

        return this.enviarEmail(this.templates.pagoNotifications, templateParams, 'pago confirmado');
    }

    /**
     * Método genérico para enviar emails
     */
    async enviarEmail(templateId, templateParams, emailType) {
        try {
            // ✅ Logging para debug
            console.log(`Enviando email de ${emailType}:`, {
                templateId,
                to_email: templateParams.to_email,
                subject_line: templateParams.subject_line
            });

            const result = await emailjs.send(this.serviceId, templateId, templateParams);
            console.log(`Email de ${emailType} enviado exitosamente:`, result);
            return { success: true, result };
        } catch (error) {
            console.error(`Error enviando email de ${emailType}:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Verifica si el servicio está configurado correctamente
     */
    isConfigured() {
        const hasBasicConfig = !!(this.serviceId && this.publicKey);
        const hasTemplates = !!(this.templates.reservaNotifications && this.templates.pagoNotifications);

        console.log('EmailService Config Check:', {
            serviceId: !!this.serviceId,
            publicKey: !!this.publicKey,
            reservaTemplate: !!this.templates.reservaNotifications,
            pagoTemplate: !!this.templates.pagoNotifications,
            isConfigured: hasBasicConfig && hasTemplates
        });

        return hasBasicConfig && hasTemplates;
    }

    /**
     * Obtiene el estado de la configuración
     */
    getConfigStatus() {
        return {
            serviceId: !!this.serviceId,
            publicKey: !!this.publicKey,
            templates: {
                reservaNotifications: !!this.templates.reservaNotifications,
                pagoNotifications: !!this.templates.pagoNotifications
            }
        };
    }
}

export default EmailService;