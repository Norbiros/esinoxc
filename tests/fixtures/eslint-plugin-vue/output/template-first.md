# Exit code
1

# stdout
```

  ! vue-eslint(html-self-closing): Require self-closing on HTML elements (<span>).
   ,-[input/template-first.vue:2:14]
 1 | <template>
 2 |   <div><span></span>{{ total }}</div>
   :              ^^^^^^^
 3 | </template>
   `----

  x vue-eslint(prefer-import-from-vue): Import from 'vue' instead of '@vue/runtime-core'.
   ,-[input/template-first.vue:6:21]
 5 | <script setup>
 6 | import { ref } from '@vue/runtime-core'
   :                     ^^^^^^^^^^^^^^^^^^^
 7 | 
   `----

Found 1 warning and 1 error.
```

# stderr
```
```
