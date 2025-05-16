import React from 'react';
import JitsiMeetRoom from '../../JitsiMeetRom/JitsiMeetRoom.jsx';

const VideoCallModal = ({ showModal, roomUrl, reserva, user, onClose }) => {
    if (!showModal || !roomUrl || !reserva) return null;

    return (
        <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050 }}
        >
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {reserva.materia?.nombre ?
                                `Tutoría: ${reserva.materia.nombre}` :
                                `Sala Virtual #${reserva.id}`}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>
                    <div className="modal-body p-0" style={{ height: '500px', overflow: 'hidden' }}>
                        <JitsiMeetRoom
                            roomUrl={roomUrl}
                            displayName={`${user.nombre} ${user.apellido}`}
                            onClose={onClose}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCallModal;