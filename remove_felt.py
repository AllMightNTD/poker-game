import os
import numpy as np
from PIL import Image

def remove_felt_bg(image_path, output_path):
    img = Image.open(image_path).convert("RGBA")
    data = np.array(img)
    
    # We want to key out the teal-green felt background.
    # Let's inspect the RGB channels. The felt has a high green/blue component and low red.
    # Typical felt RGB: R < 40, G between 70 and 130, B between 80 and 140.
    # Let's define a mask for the felt color:
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    # Felt color criteria:
    # 1. R is low (R < 50)
    # 2. G is medium-high (40 < G < 140)
    # 3. B is medium-high (50 < B < 150)
    # 4. G/R ratio is high (G > R * 1.5)
    # Let's combine these criteria:
    felt_mask = (r < 55) & (g > 35) & (b > 45) & (g > r * 1.3)
    
    # Make felt pixels transparent
    data[felt_mask, 3] = 0
    
    # Save the resulting image
    result = Image.fromarray(data)
    result.save(output_path)
    print(f"Processed {os.path.basename(image_path)} -> {os.path.basename(output_path)}")

output_dir = "/home/dev_ntd/Know_Block/Know_Ledge_Block/FE/public/images"
remove_felt_bg(os.path.join(output_dir, "chips_tray.png"), os.path.join(output_dir, "chips_tray_transparent.png"))
remove_felt_bg(os.path.join(output_dir, "deck_shooter.png"), os.path.join(output_dir, "deck_shooter_transparent.png"))
remove_felt_bg(os.path.join(output_dir, "discard_shoe.png"), os.path.join(output_dir, "discard_shoe_transparent.png"))
