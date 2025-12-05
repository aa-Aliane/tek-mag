#!/bin/sh
# wait-for-it.sh

set -e

HOST="$1"
PORT="$2"
shift 2
CMD="$@"

until nc -z "$HOST" "$PORT"; do
  >&2 echo "$HOST:$PORT is unavailable - sleeping"
  sleep 1
done

>&2 echo "$HOST:$PORT is up - executing command"
exec $CMD