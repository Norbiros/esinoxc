<script lang="ts">
  import UserList from './lib/UserList.svelte'

  let users = $state([
    { id: 1, name: 'Ada', bio: '<b>Mathematician</b>' },
    { id: 2, name: 'Linus', bio: '<i>Kernel hacker</i>' },
  ])
</script>

<main>
  <h1>Team</h1>
  <UserList {users} showBio />
</main>
