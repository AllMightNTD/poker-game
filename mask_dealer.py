import os
from PIL import Image, ImageDraw

img = Image.open("/home/dev_ntd/Know_Block/Know_Ledge_Block/FE/public/images/dealer.png").convert("RGBA")
width, height = img.size

# Define polygon vertices for the dealer's body
# We scale coordinates to fit the 216x204 crop
vertices = [
    (108, 12),
    (122, 18),
    (125, 28),
    (124, 44),
    (129, 52),
    (126, 72),
    (121, 82),
    (134, 94),
    (164, 108),
    (188, 132),
    (198, 160),
    (204, 204),
    (12, 204),
    (18, 160),
    (28, 132),
    (52, 108),
    (82, 94),
    (95, 82),
    (90, 72),
    (87, 52),
    (92, 44),
    (91, 28),
    (94, 18)
]

# Create a mask image
mask = Image.new("L", (width, height), 0)
draw = ImageDraw.Draw(mask)
draw.polygon(vertices, fill=255)

# Optional: blur the mask slightly to soften edges
from PIL import ImageFilter
mask = mask.filter(ImageFilter.GaussianBlur(1.0))

# Apply mask
result = Image.new("RGBA", (width, height), (0, 0, 0, 0))
result.paste(img, (0, 0), mask=mask)

# Save the masked dealer image
result.save("/home/dev_ntd/Know_Block/Know_Ledge_Block/FE/public/images/dealer_transparent.png")
print("Mask applied and saved to dealer_transparent.png")
