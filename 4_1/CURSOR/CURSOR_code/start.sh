#!/bin/bash

echo "CleanBoost 앱을 시작합니다..."
echo

# Python이 설치되어 있는지 확인
if ! command -v python3 &> /dev/null; then
    echo "Python3이 설치되어 있지 않습니다."
    echo "https://python.org에서 Python을 설치해주세요."
    exit 1
fi

# Node.js가 설치되어 있는지 확인
if ! command -v node &> /dev/null; then
    echo "Node.js가 설치되어 있지 않습니다."
    echo "https://nodejs.org에서 Node.js를 설치해주세요."
    exit 1
fi

echo "Python과 Node.js가 설치되어 있습니다."
echo

# 앱 시작
python3 start_app.py


