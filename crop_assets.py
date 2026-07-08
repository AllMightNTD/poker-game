import os
from PIL import Image

# Open the original image
img_path = "/home/dev_ntd/Know_Block/Know_Ledge_Block/FE/poker_room.png"
img = Image.open(img_path)
width, height = img.size

# Target folder for cropped assets
output_dir = "/home/dev_ntd/Know_Block/Know_Ledge_Block/FE/public/images"
os.makedirs(output_dir, exist_ok=True)

# 1. Crop Dealer
# Horizontal: centered around width/2 (728)
# Vertical: below header (approx Y=46) to table inner rim (approx Y=250)
dealer_box = (620, 46, 836, 250)
dealer_img = img.crop(dealer_box)
dealer_img.save(os.path.join(output_dir, "dealer.png"))

# 2. Crop Chips Tray (in front of dealer)
# Horizontal: centered around 728
# Vertical: approx Y=228 to Y=268
chips_box = (644, 226, 818, 270)
chips_img = img.crop(chips_box)
chips_img.save(os.path.join(output_dir, "chips_tray.png"))

# 3. Crop Deck Shooter (acrylic box left of chips tray)
# Vertical: Y=190 to Y=255
deck_box = (510, 190, 564, 255)
deck_img = img.crop(deck_box)
deck_img.save(os.path.join(output_dir, "deck_shooter.png"))

# 4. Crop Discard Shoe (acrylic box right of chips tray)
# Vertical: Y=180 to Y=265
discard_box = (870, 180, 982, 265)
discard_img = img.crop(discard_box)
discard_img.save(os.path.join(output_dir, "discard_shoe.png"))

print("Cropped assets generated successfully!")
