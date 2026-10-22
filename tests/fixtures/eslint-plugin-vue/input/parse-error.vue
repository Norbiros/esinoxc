<script setup lang="ts">
const raw: unknown = 'Hello'
const greeting = <string>raw
</script>

<template>
  <b>{{ greeting }}</b>
</template>
