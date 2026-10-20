# Exit code
1

# stdout
```

  x svelte-eslint(no-at-html-tags): `{@html}` can lead to XSS attack.
    ,-[src/lib/UserList.svelte:16:12]
 15 |       {#if showBio}
 16 |         <p>{@html user.bio}</p>
    :            ^^^^^^^^^^^^^^^^
 17 |       {/if}
    `----

  x svelte-eslint(require-each-key): Each block should have a key
    ,-[src/lib/UserList.svelte:12:3]
 11 | <ul>
 12 |   {#each users as user}
    :   ^^^^^^^^^^^^^^^^^^^^^
 13 |     <li>
    `----

Found 0 warnings and 2 errors.
```

# stderr
```
```
