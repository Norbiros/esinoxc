<script>
import { defineComponent } from 'vue'

export default defineComponent({ inheritAttrs: false })
</script>

<script setup>
// eslint-disable-next-line vue-eslint/prefer-import-from-vue
import { ref } from '@vue/runtime-core'

const html = ref('<b>Hello</b>')
</script>

<template>
  <div v-html="html" />
</template>
