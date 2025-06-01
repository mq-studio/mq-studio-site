#!/usr/bin/env python3

import os
import sys

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    print(f"File written: {path}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 file_writer.py <path> <content>")
        sys.exit(1)
    write_file(sys.argv[1], sys.argv[2])
