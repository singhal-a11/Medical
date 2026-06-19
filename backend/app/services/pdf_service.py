import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas as pdf_canvas


def generate_report(test_request) -> str:
    """
    Generate a PDF lab report for the given test_request.
    Returns the file path of the saved PDF.
    """
    os.makedirs("reports", exist_ok=True)
    file_path = f"reports/report_{test_request.id}.pdf"

    patient = test_request.patient
    test = test_request.test
    doctor = test_request.doctor

    c = pdf_canvas.Canvas(file_path, pagesize=A4)
    width, height = A4

    # ── Header background ──────────────────────────────────────────────
    c.setFillColor(colors.HexColor("#1e40af"))
    c.rect(0, height - 80, width, 80, fill=True, stroke=False)

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width / 2, height - 38, "MEDICAL LABORATORY REPORT")
    c.setFont("Helvetica", 11)
    c.drawCentredString(width / 2, height - 58, "City Lab Center  |  www.citylabcenter.com  |  +1-800-LAB-CARE")

    # ── Report meta ────────────────────────────────────────────────────
    c.setFillColor(colors.black)
    c.setFont("Helvetica", 10)
    c.drawString(30, height - 100, f"Report ID:   #{test_request.id}")
    c.drawString(30, height - 115, f"Generated:   {datetime.utcnow().strftime('%d %B %Y, %H:%M UTC')}")
    c.drawString(30, height - 130, f"Status:      {test_request.status.replace('_', ' ').title()}")

    # ── Divider ────────────────────────────────────────────────────────
    def draw_section_header(y_pos: float, title: str):
        c.setFillColor(colors.HexColor("#e0e7ff"))
        c.rect(25, y_pos - 5, width - 50, 20, fill=True, stroke=False)
        c.setFillColor(colors.HexColor("#1e40af"))
        c.setFont("Helvetica-Bold", 11)
        c.drawString(30, y_pos, title)
        c.setFillColor(colors.black)
        c.setFont("Helvetica", 10)

    def draw_field(label: str, value: str, x: float, y: float):
        c.setFont("Helvetica-Bold", 10)
        c.drawString(x, y, f"{label}:")
        c.setFont("Helvetica", 10)
        c.drawString(x + 90, y, str(value) if value else "—")

    # ── Patient details ────────────────────────────────────────────────
    draw_section_header(height - 160, "PATIENT DETAILS")
    draw_field("Full Name",    patient.full_name,                              30, height - 185)
    draw_field("Date of Birth", str(patient.date_of_birth) if patient.date_of_birth else "N/A", 30, height - 200)
    draw_field("Gender",       patient.gender or "N/A",                        30, height - 215)
    draw_field("Phone",        patient.phone or "N/A",                         30, height - 230)
    draw_field("Email",        patient.email or "N/A",                         30, height - 245)

    # ── Doctor details ─────────────────────────────────────────────────
    draw_section_header(height - 270, "REQUESTING DOCTOR")
    draw_field("Doctor Name",  f"Dr. {doctor.full_name}",                      30, height - 295)
    draw_field("Doctor Email", doctor.email,                                   30, height - 310)

    # ── Test result ────────────────────────────────────────────────────
    draw_section_header(height - 335, "TEST RESULT")
    draw_field("Test Name",    test.name,                                      30, height - 360)
    draw_field("Category",     test.category,                                  30, height - 375)
    draw_field("Result Value", f"{test_request.result_value or 'Pending'} {test.unit or ''}".strip(), 30, height - 390)
    draw_field("Normal Range", f"{test.normal_range or 'N/A'} {test.unit or ''}".strip(), 30, height - 405)

    # Out-of-range flag
    try:
        if test_request.result_value and test.normal_range and "-" in test.normal_range:
            low, high = [float(x.strip()) for x in test.normal_range.split("-")]
            result_val = float(test_request.result_value)
            if result_val < low or result_val > high:
                c.setFillColor(colors.red)
                c.setFont("Helvetica-Bold", 10)
                c.drawString(30, height - 425, "⚠  Result is OUTSIDE the normal range.")
                c.setFillColor(colors.black)
            else:
                c.setFillColor(colors.HexColor("#15803d"))
                c.setFont("Helvetica-Bold", 10)
                c.drawString(30, height - 425, "✓  Result is within the normal range.")
                c.setFillColor(colors.black)
    except (ValueError, TypeError):
        pass

    # ── Notes ──────────────────────────────────────────────────────────
    if test_request.notes:
        draw_section_header(height - 450, "TECHNICIAN NOTES")
        c.setFont("Helvetica", 10)
        c.drawString(30, height - 475, test_request.notes[:120])

    # ── Footer ─────────────────────────────────────────────────────────
    c.setFillColor(colors.HexColor("#6b7280"))
    c.setFont("Helvetica-Oblique", 8)
    c.drawCentredString(
        width / 2,
        25,
        "This report is computer-generated and is valid without a physical signature.",
    )
    c.line(25, 35, width - 25, 35)

    c.save()
    return file_path
