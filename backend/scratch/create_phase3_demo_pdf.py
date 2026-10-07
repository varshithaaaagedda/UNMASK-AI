import fitz

doc = fitz.open()
page = doc.new_page()

text = (
    "From: Northstar Financial\n\n"
    "URGENT: Your account will be suspended today.\n"
    "Verify immediately by calling the number below or scanning the QR code.\n\n"
    "Call +91 1800 123 4567 now.\n\n"
    "Visit: https://northstar-security.example/verify"
)

page.insert_text((40, 50), text, fontsize=12)
pdf_path = "c:/UNMASK-AI/backend/scratch/phase3_demo_notice.pdf"
doc.save(pdf_path)
doc.close()
print(f"Saved Phase 3 demo PDF to {pdf_path}")
