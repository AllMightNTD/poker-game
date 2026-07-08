from PIL import Image

img = Image.open("/home/dev_ntd/Know_Block/Know_Ledge_Block/FE/public/images/dealer.png")
for y in range(0, 100, 5):
    print(f"y={y}:", img.getpixel((10, y)))
