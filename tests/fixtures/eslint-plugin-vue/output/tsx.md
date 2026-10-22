# Exit code
1

# stdout
```

  ! vue-eslint(html-self-closing): Require self-closing on Vue.js custom components (<Greeting>).
   ,-[input/tsx.vue:6:13]
 5 | <template>
 6 |   <Greeting></Greeting>
   :             ^^^^^^^^^^^
 7 | </template>
   `----

  x vue-eslint(multi-word-component-names): Component name "tsx" should always be multi-word.
   ,-[input/tsx.vue:1:1]
 1 | <script setup lang="tsx">
   : ^
 2 | const Greeting = () => <b>Hello</b>
   `----

Found 1 warning and 1 error.
```

# stderr
```
```
