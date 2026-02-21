from PIL import Image

img = Image.open("mask.png").convert("L")  # 转灰度
img = img.point(lambda x: 255 if x <=128 else 0)  # 阈值分割
img.save("mask_alpha.png")