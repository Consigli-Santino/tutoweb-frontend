import React, { useState } from 'react';

const CalificacionModal = ({ showModal, reserva, onClose, onSubmitRating }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!showModal || !reserva) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await onSubmitRating(rating, comment);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Calificar tutoría</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            disabled={isSubmitting}
                        ></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <p className="fw-bold">Tutoría: {reserva.materia?.nombre || `#${reserva.id}`}</p>
                            <p>Tutor: {reserva.tutor?.nombre} {reserva.tutor?.apellido}</p>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Tu calificación:</label>
                                <div className="star-rating">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className={`btn btn-link p-0 me-1 fs-3 ${star <= rating ? 'text-warning' : 'text-muted'}`}
                                            onClick={() => setRating(star)}
                                        >
                                            <i className="bi bi-star-fill"></i>
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-2 small text-muted">
                                    {rating === 1 && 'Muy malo'}
                                    {rating === 2 && 'Malo'}
                                    {rating === 3 && 'Regular'}
                                    {rating === 4 && 'Bueno'}
                                    {rating === 5 && 'Excelente'}
                                </div>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="comment" className="form-label fw-bold">Comentarios (opcional):</label>
                                <textarea
                                    id="comment"
                                    className="form-control"
                                    rows="3"
                                    placeholder="Comparte tu experiencia con este tutor..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="alert alert-info" role="alert">
                                <i className="bi bi-info-circle-fill me-2"></i>
                                Tu calificación ayudará a otros estudiantes a elegir tutores. Una vez enviada, no podrá ser modificada.
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-star-fill me-2"></i>
                                        Enviar calificación
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CalificacionModal;