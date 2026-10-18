# Exit code
1

# stdout
```

  ! vue-eslint(html-self-closing): Require self-closing on HTML elements (<div>).
   ,-[input/template.vue:8:22]
 7 | <template>
 8 |   <div v-html="html"></div>
   :                      ^^^^^^
 9 | </template>
   `----

  ! vue-eslint(no-v-html): 'v-html' directive can lead to XSS attack.
   ,-[input/template.vue:8:8]
 7 | <template>
 8 |   <div v-html="html"></div>
   :        ^^^^^^^^^^^^^
 9 | </template>
   `----

  x vue-eslint(prefer-import-from-vue): Import from 'vue' instead of '@vue/runtime-core'.
   ,-[input/template.vue:2:21]
 1 | <script setup>
 2 | import { ref } from '@vue/runtime-core'
   :                     ^^^^^^^^^^^^^^^^^^^
 3 | 
   `----

Found 2 warnings and 1 error.
```

# stderr
```
```
