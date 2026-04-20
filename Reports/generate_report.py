from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.graphics.shapes import Drawing, Rect, Line, String, Polygon
from reportlab.graphics.charts.barcharts import VerticalBarChart, HorizontalBarChart
from reportlab.graphics.charts.lineplots import LinePlot
from reportlab.graphics.widgets.markers import makeMarker
from reportlab.graphics import renderPDF
from reportlab.platypus import Flowable

BLUE = colors.HexColor('#2563eb')
LIGHT_BLUE = colors.HexColor('#93c5fd')
ORANGE = colors.HexColor('#f97316')
GREEN = colors.HexColor('#22c55e')
LIGHT_GRAY = colors.HexColor('#f5f5f5')
MID_GRAY = colors.HexColor('#888888')
DARK = colors.HexColor('#1a1a1a')

W, H = A4

def make_stat_table():
    stats = [
        ("24%", "Smartphone access\nKwaZulu-Natal rural (current)", "Case data baseline"),
        ("72%", "Mobile ownership\nSA youth 15–24", "UNICEF, 2022"),
        ("87%", "Projected smartphone adoption\nSub-Saharan Africa by 2030", "GSMA Intelligence"),
    ]
    cell_data = []
    cell_data.append([
        Paragraph(f'<font size="28" color="#2563eb"><b>{s[0]}</b></font><br/><font size="9" color="#333">{s[1]}</font><br/><font size="8" color="#aaa">{s[2]}</font>', getSampleStyleSheet()['Normal'])
        for s in stats
    ])
    t = Table(cell_data, colWidths=[5.5*cm, 5.5*cm, 5.5*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.white),
        ('BOX', (0,0), (0,0), 0.5, colors.HexColor('#e5e7eb')),
        ('BOX', (1,0), (1,0), 0.5, colors.HexColor('#e5e7eb')),
        ('BOX', (2,0), (2,0), 0.5, colors.HexColor('#e5e7eb')),
        ('TOPPADDING', (0,0), (-1,-1), 14),
        ('BOTTOMPADDING', (0,0), (-1,-1), 14),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('ROUNDEDCORNERS', [6]),
    ]))
    return t

def make_line_chart():
    d = Drawing(480, 200)
    lp = LinePlot()
    lp.x = 40
    lp.y = 20
    lp.width = 420
    lp.height = 160
    lp.data = [[(0, 32), (1, 44), (2, 51), (3, 52), (4, 87)]]
    lp.lines[0].strokeColor = BLUE
    lp.lines[0].strokeWidth = 2.5
    lp.lines[0].symbol = makeMarker('Circle')
    lp.lines[0].symbol.fillColor = BLUE
    lp.lines[0].symbol.size = 5
    lp.xValueAxis.valueMin = 0
    lp.xValueAxis.valueMax = 4
    lp.xValueAxis.valueSteps = [0, 1, 2, 3, 4]
    lp.xValueAxis.labelTextFormat = lambda v: ['2012','2017','2022','2024','2030\n(proj.)'][int(v)]
    lp.yValueAxis.valueMin = 0
    lp.yValueAxis.valueMax = 100
    lp.yValueAxis.labelTextFormat = '%d%%'
    d.add(lp)
    return d

def make_bar_chart_country():
    d = Drawing(480, 220)
    bc = HorizontalBarChart()
    bc.x = 80
    bc.y = 10
    bc.width = 370
    bc.height = 200
    data = [[84, 83, 76, 72, 61, 47, 46, 32]]
    bc.data = data
    bc.valueAxis.valueMin = 0
    bc.valueAxis.valueMax = 100
    bc.valueAxis.labelTextFormat = '%d%%'
    bc.categoryAxis.categoryNames = ['Eswatini','Botswana','Lesotho','South Africa','Zimbabwe','Mozambique','Zambia','Malawi']
    bc.categoryAxis.labels.fontSize = 8
    bc.bars[0].fillColor = LIGHT_BLUE
    bc.bars[(0,3)].fillColor = BLUE
    bc.barSpacing = 2
    d.add(bc)
    return d

def make_gap_chart():
    d = Drawing(480, 180)
    bc = VerticalBarChart()
    bc.x = 100
    bc.y = 20
    bc.width = 280
    bc.height = 140
    bc.data = [[91, 36]]
    bc.valueAxis.valueMin = 0
    bc.valueAxis.valueMax = 100
    bc.valueAxis.labelTextFormat = '%d%%'
    bc.categoryAxis.categoryNames = ['Covered by network', 'Actually using\nmobile internet']
    bc.categoryAxis.labels.fontSize = 9
    bc.bars[(0,0)].fillColor = GREEN
    bc.bars[(0,1)].fillColor = ORANGE
    bc.barWidth = 60
    d.add(bc)
    return d

def build():
    doc = SimpleDocTemplate(
        "mobile_statistics_report.pdf",
        pagesize=A4,
        rightMargin=1.8*cm,
        leftMargin=1.8*cm,
        topMargin=1.8*cm,
        bottomMargin=1.8*cm,
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('title', fontSize=20, textColor=DARK, spaceAfter=4, fontName='Helvetica-Bold')
    subtitle_style = ParagraphStyle('subtitle', fontSize=10, textColor=MID_GRAY, spaceAfter=24)
    section_style = ParagraphStyle('section', fontSize=8, textColor=MID_GRAY, spaceBefore=20, spaceAfter=10,
                                   fontName='Helvetica', textTransform='uppercase', letterSpacing=1)
    source_style = ParagraphStyle('source', fontSize=7.5, textColor=colors.HexColor('#aaaaaa'), spaceBefore=20, leading=13)

    story = []

    story.append(Paragraph("Mobile Adoption in Rural South Africa", title_style))
    story.append(Paragraph("Statistics relevant to KwaZulu-Natal digital literacy context — April 2026", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#e5e7eb'), spaceAfter=20))

    story.append(make_stat_table())
    story.append(Spacer(1, 24))

    story.append(Paragraph("MOBILE ADOPTION GROWTH — SUB-SAHARAN AFRICA", section_style))
    story.append(make_line_chart())
    story.append(Spacer(1, 20))

    story.append(Paragraph("YOUTH MOBILE OWNERSHIP BY COUNTRY (15–24)", section_style))
    story.append(make_bar_chart_country())
    story.append(Spacer(1, 20))

    story.append(Paragraph("COVERAGE VS. ACTUAL USAGE GAP — SUB-SAHARAN AFRICA 2024", section_style))
    story.append(make_gap_chart())

    story.append(Paragraph(
        "<b>Sources:</b> GSMA Mobile Economy Sub-Saharan Africa 2024 · UNICEF Southern Africa Youth Mobile Study 2022 · "
        "Statista South Africa Smartphone Penetration 2025 · World Bank Mobile Subscriptions Data · "
        "Journal of Global Health — Mobile ownership among young adults in Southern Africa (2025)",
        source_style
    ))

    doc.build(story)
    print("PDF generated: mobile_statistics_report.pdf")

build()
