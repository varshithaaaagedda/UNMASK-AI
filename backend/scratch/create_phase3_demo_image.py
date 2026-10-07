from PIL import Image, ImageDraw

img = Image.new('RGB', (900, 450), color=(255, 255, 255))
draw = ImageDraw.Draw(img)

text = (
    "From: Northstar Financial\n\n"
    "URGENT: Your account will be suspended today.\n"
    "Verify immediately by calling the number below or scanning the QR code.\n\n"
    "Call +91 1800 123 4567 now.\n\n"
    "Visit: https://northstar-security.example/verify"
)

draw.text((40, 40), text, fill=(0, 0, 0))

img_path = "c:/UNMASK-AI/backend/scratch/phase3_demo_notice.png"
img.save(img_path)
print(f"Saved Phase 3 demo image to {img_path}")
