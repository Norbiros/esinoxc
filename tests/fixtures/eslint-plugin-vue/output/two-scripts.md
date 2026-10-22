# Exit code
1

# stdout
```

  ! vue-eslint(html-self-closing): Require self-closing on HTML elements (<div>).
    ,-[input/two-scripts.vue:15:22]
 14 | <template>
 15 |   <div v-html="html"></div>
    :                      ^^^^^^
 16 | </template>
    `----

  ! vue-eslint(no-v-html): 'v-html' directive can lead to XSS attack.
    ,-[input/two-scripts.vue:15:8]
 14 | <template>
 15 |   <div v-html="html"></div>
    :        ^^^^^^^^^^^^^
 16 | </template>
    `----

  x vue-eslint(prefer-import-from-vue): Import from 'vue' instead of '@vue/runtime-core'.
   ,-[input/two-scripts.vue:2:33]
 1 | <script>
 2 | import { defineComponent } from '@vue/runtime-core'
   :                                 ^^^^^^^^^^^^^^^^^^^
 3 | 
   `----

Found 2 warnings and 1 error.
```

# stderr
```
```
