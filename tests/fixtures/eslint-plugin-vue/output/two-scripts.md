# Exit code
1

# stdout
```

  ! vue-eslint(html-self-closing): Require self-closing on HTML elements (<div>).
    ,-[input/two-scripts.vue:14:22]
 13 | <template>
 14 |   <div v-html="html"></div>
    :                      ^^^^^^
 15 | </template>
    `----

  ! vue-eslint(no-v-html): 'v-html' directive can lead to XSS attack.
    ,-[input/two-scripts.vue:14:8]
 13 | <template>
 14 |   <div v-html="html"></div>
    :        ^^^^^^^^^^^^^
 15 | </template>
    `----

  x vue-eslint(prefer-import-from-vue): Import from 'vue' instead of '@vue/runtime-core'.
   ,-[input/two-scripts.vue:2:33]
 1 | <script>
 2 | import { defineComponent } from '@vue/runtime-core'
   :                                 ^^^^^^^^^^^^^^^^^^^
 3 | 
   `----

  x vue-eslint(prefer-import-from-vue): Import from 'vue' instead of '@vue/runtime-core'.
   ,-[input/two-scripts.vue:8:21]
 7 | <script setup>
 8 | import { ref } from '@vue/runtime-core'
   :                     ^^^^^^^^^^^^^^^^^^^
 9 | 
   `----

Found 2 warnings and 2 errors.
```

# stderr
```
```
