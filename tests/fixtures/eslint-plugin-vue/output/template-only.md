# Exit code
0

# stdout
```

  ! vue-eslint(html-self-closing): Require self-closing on HTML elements (<div>).
   ,-[input/template-only.vue:2:32]
 1 | <template>
 2 |   <div v-html="'<b>Hello</b>'"></div>
   :                                ^^^^^^
 3 | </template>
   `----

  ! vue-eslint(no-v-html): 'v-html' directive can lead to XSS attack.
   ,-[input/template-only.vue:2:8]
 1 | <template>
 2 |   <div v-html="'<b>Hello</b>'"></div>
   :        ^^^^^^^^^^^^^^^^^^^^^^^
 3 | </template>
   `----

Found 2 warnings and 0 errors.
```

# stderr
```
```
