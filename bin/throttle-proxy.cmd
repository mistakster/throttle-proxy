@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\throttle-proxy" %*
) ELSE (
  node  "%~dp0\throttle-proxy" %*
)