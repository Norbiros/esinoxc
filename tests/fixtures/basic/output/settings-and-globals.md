# Exit code
1

# stdout
```

  x basic(report-setting): Setting: hello.
   ,-[input/settings-and-globals.js:1:1]
 1 | ,-> const count = useState(0)
 2 | `-> const total = useTotal(count)
   `----

  x basic(no-undef): 'useTotal' is not defined.
   ,-[input/settings-and-globals.js:2:15]
 1 | const count = useState(0)
 2 | const total = useTotal(count)
   :               ^^^^^^^^
   `----

Found 0 warnings and 2 errors.
```

# stderr
```
```
