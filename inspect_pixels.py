from PIL import Image

img = Image.open("/home/dev_ntd/Know_Block/Know_Ledge_Block/FE/public/images/dealer.png")
print("Top-left color:", img.getpixel((0, 0)))
print("Top-right color:", img.getpixel((img.width - 1, 0)))
print("Bottom-left color:", img.getpixel((0, img.height - 1)))
print("Bottom-right color:", img.getpixel((img.width - 1, img.height - 1)))
