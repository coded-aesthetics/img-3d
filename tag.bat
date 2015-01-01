if %1!==! goto ende   --- falls kein Parameter 1 angegeben wurde, wird abgebrochen
if %2!==! goto ende
set branch=%3
if %3!==! set branch=master
git add .
git add -u
git commit -m %2
git tag %1
git push origin %branch%:%branch%
git push origin %1
:ende