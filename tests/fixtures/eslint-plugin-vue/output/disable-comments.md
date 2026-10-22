# Exit code
0

# stdout
```

  ! vue-eslint(html-self-closing): Require self-closing on HTML elements (<span>).
    ,-[input/disable-comments.vue:14:9]
 13 |   <!-- eslint-enable vue-eslint/html-self-closing -->
 14 |   <span></span>
    :         ^^^^^^^
 15 | </template>
    `----

  ! Unused eslint-disable directive (no problems were reported).
   ,-[input/disable-comments.vue:4:1]
 3 | import { ref } from '@vue/runtime-core'
 4 | // eslint-disable-next-line vue-eslint/prefer-import-from-vue
   : ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 5 | import { computed } from 'vue'
   `----

Found 2 warnings and 0 errors.
```

# stderr
```
```
