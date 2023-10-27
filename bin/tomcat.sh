#!/usr/bin/env bash

# Hint from: https://www.baeldung.com/find-java-home#platform-independent
get_java_home() {
  java -XshowSettings:properties -version 2>&1 |
    grep 'java\.home' | awk '{print $3}'
}

CATALINA_HOME="${CATALINA_HOME:-/opt/tomcat/apache-tomcat-10.1.15}"
JAVA_HOME="${JAVA_HOME:-$(get_java_home)}"

for envvar in 'CATALINA_HOME' 'JAVA_HOME'; do
  if ! cd -P "${!envvar}"; then
    printf 'invalid directory for %s\n' "${envvar}" >&2
    exit 1
  fi

  printf -v "$envvar" "%s" "$PWD"
  cd - >/dev/null
done

exec "$CATALINA_HOME/bin/catalina.sh" "$@"
