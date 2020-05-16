#!/bin/bash

if [[ $# -ne 2 ]]; then
  echo "Need to specify 2 arguments #1-locale  & #2-num of requests to send";
  exit 1;
fi

locale=$1
num_reqs=$2

echo "Executing for Locale:${locale} # of requests:${num_reqs}"

for i in $(seq "${num_reqs}")
do
  content=$(curl -s --header "Connection: keep-alive" "http://localhost:8088?locale=${locale}")

  if [[ "$content" == *"<html lang=${locale}>"* ]]; then
    # locale code found

    case "$locale" in
      en_US)
        expectedMessage='This is first post'
        ;;
      fr_FR)
        expectedMessage='Ceci est le premier message'
        ;;
      ja_JP)
        expectedMessage='これは最初の投稿です'
        ;;
      *)
        echo "Locale=$locale not supported"
        exit 1
        ;;
    esac

    # echo expectedMessage=$expectedMessage
    if [[ "$content" != *"${expectedMessage}"* ]]; then
      echo "[$locale][$i] Message not found!"
    fi
  fi
done
