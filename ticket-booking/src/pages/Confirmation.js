import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './Confirmation.css';

function Confirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const ticketRef = useRef();

  if (!state) return <div className="loading"><div className="spinner"></div></div>;

  const { booking, event, form, total } = state;

  const downloadPDF = async () => {
    const canvas = await html2canvas(ticketRef.current, { scale: 2, backgroundColor: '#1a1a2e' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`ticket-${booking.booking_id}.pdf`);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="confirmation-page">
      <div className="confirmation-wrapper">
        <div className="success-banner">
          <div className="success-icon">🎉</div>
          <h1>Booking Confirmed!</h1>
          <p>Your ticket has been booked successfully</p>
        </div>

        <div className="ticket-wrapper" ref={ticketRef}>
          <div className="ticket">
            <div className="ticket-left">
              <div className="ticket-event-name">{event.name}</div>
              <div className="ticket-details-grid">
                <div className="ticket-detail">
                  <span className="detail-label">Booking ID</span>
                  <span className="detail-value">#{booking.booking_id}</span>
                </div>
                <div className="ticket-detail">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">{form.name}</span>
                </div>
                <div className="ticket-detail">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{form.email}</span>
                </div>
                <div className="ticket-detail">
                  <span className="detail-label">Roll Number</span>
                  <span className="detail-value">{form.roll_number}</span>
                </div>
                <div className="ticket-detail">
                  <span className="detail-label">Department</span>
                  <span className="detail-value">{form.department}</span>
                </div>
                <div className="ticket-detail">
                  <span className="detail-label">Ticket Type</span>
                  <span className="detail-value">{form.ticket_type}</span>
                </div>
                <div className="ticket-detail">
                  <span className="detail-label">Quantity</span>
                  <span className="detail-value">{form.quantity}</span>
                </div>
                <div className="ticket-detail">
                  <span className="detail-label">Amount Paid</span>
                  <span className="detail-value amount">₹{total}</span>
                </div>
                <div className="ticket-detail">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{formatDate(event.date)}</span>
                </div>
                <div className="ticket-detail">
                  <span className="detail-label">Venue</span>
                  <span className="detail-value">{event.venue}</span>
                </div>
              </div>
              <div className="verification-code">
                🔐 Verification Code: <strong>{booking.verification_code}</strong>
              </div>
            </div>
            <div className="ticket-divider">
              <div className="circle top"></div>
              <div className="dashes"></div>
              <div className="circle bottom"></div>
            </div>
            <div className="ticket-right">
              <div className="ticket-qr">
                <QRCodeSVG
                  value={`BOOKING:${booking.booking_id}|CODE:${booking.verification_code}|EVENT:${event.name}|NAME:${form.name}`}
                  size={150}
                  bgColor="#ffffff"
                  fgColor="#1a1a2e"
                  level="H"
                />
                <p>Scan to verify</p>
              </div>
            </div>
          </div>
        </div>

        <div className="confirmation-actions">
          <button className="btn-download" onClick={downloadPDF}>⬇️ Download Ticket PDF</button>
          <button className="btn-home" onClick={() => navigate('/')}>← Back to Events</button>
        </div>
      </div>
    </div>
  );
}

export default Confirmation;