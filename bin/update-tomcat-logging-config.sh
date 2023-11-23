#!/usr/bin/env bash
#
# Updates Tomcat config to log HTTP requests to standard output, per: 
# - https://stackoverflow.com/a/62598943
#
# Takes the path to the Tomcat config as an argument, which it updates in place.
#
# See also:
# - https://tomcat.apache.org/tomcat-10.1-doc/config/valve.html#Access_Logging

ORIG_PAT=(
  '<Valve className="org.apache.catalina.valves.AccessLogValve"'
  'directory="logs"\n.*\n.* \/>'
)
NEW_VAL="<Valve className=\"org.apache.catalina.valves.AccessLogValve\"
               directory=\"\/dev\" prefix=\"stdout\"
               suffix=\"\" rotatable=\"false\" buffered=\"false\"
               pattern=\"%h %l %u %t &quot;%r&quot; %s %b\" \/>"

# - https://unix.stackexchange.com/a/26289
# - https://unix.stackexchange.com/a/181215
exec perl -p0e "s/${ORIG_PAT[*]}/${NEW_VAL}/g" -i "$1"
