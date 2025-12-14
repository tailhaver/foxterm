import os

version = "0.5.2"

if os.path.exists(".git/HEAD"):
    with open(".git/HEAD") as fp:
        is_dev = "dev" in fp.readline()
else:
    is_dev = False