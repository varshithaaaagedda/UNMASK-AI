from PIL import Image, ImageDraw, ImageFont

# Create a clean white image with black text for crisp Tesseract OCR
img = Image.new('RGB', (800, 400), color=(255, 255, 255))
draw = ImageDraw.Draw(img)

text = (
    "URGENT: Your Northstar Financial account requires immediate verification.\n\n"
    "Call +91 1800 123 4567 now.\n\n"
    "Visit:\n"
    "https://northstar-security.example"
)

# Use default font or draw text cleanly
draw.text((40, 40), text, fill=(0, 0, 0))

img_path = "c:/UNMASK-AI/backend/scratch/test_sample.png"
img.save(img_path)
print(f"Saved test image to {img_path}")
