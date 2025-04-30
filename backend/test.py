import torch

print("CUDA available:", torch.cuda.is_available())
print("cuDNN version:", torch.backends.cudnn.version())
print("GPU device:", torch.cuda.get_device_name(0))
print(torch.cuda.memory_summary(device=None, abbreviated=False))