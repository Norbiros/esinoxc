<script lang="ts">
  interface User {
    id: number
    name: string
    bio: string
  }

  let { users, showBio = false }: { users: User[]; showBio?: boolean } = $props()
</script>

<ul>
  {#each users as user}
    <li>
      <strong>{user.name}</strong>
      {#if showBio}
        <p>{@html user.bio}</p>
      {/if}
    </li>
  {/each}
</ul>
