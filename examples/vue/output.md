# Exit code
1

# stdout
```

  ! vue-eslint(attribute-hyphenation): Attribute 'showBio' must be hyphenated.
    ,-[src/App.vue:15:30]
 14 |     <h1>Team</h1>
 15 |     <UserList :users="users" showBio />
    :                              ^^^^^^^
 16 |     <AppFooter />
    `----

  ! vue-eslint(max-attributes-per-line): 'showBio' should be on a new line.
    ,-[src/App.vue:15:30]
 14 |     <h1>Team</h1>
 15 |     <UserList :users="users" showBio />
    :                              ^^^^^^^
 16 |     <AppFooter />
    `----

  ! vue-eslint(max-attributes-per-line): 'target' should be on a new line.
   ,-[src/components/AppFooter.vue:3:51]
 2 |   <footer>
 3 |     <a href="https://github.com/Norbiros/esinoxc" target="_blank">esinoxc</a>
   :                                                   ^^^^^^^^^^^^^^^
 4 |   </footer>
   `----

  ! vue-eslint(max-attributes-per-line): 'v-html' should be on a new line.
    ,-[src/components/UserList.vue:19:25]
 18 |       <strong>{{ user.name }}</strong>
 19 |       <p v-if="showBio" v-html="user.bio" />
    :                         ^^^^^^^^^^^^^^^^^
 20 |     </li>
    `----

  x vue-eslint(no-unused-vars): 'index' is defined but never used.
    ,-[src/components/UserList.vue:17:23]
 16 |   <ul>
 17 |     <li v-for="(user, index) in users">
    :                       ^^^^^
 18 |       <strong>{{ user.name }}</strong>
    `----

  ! vue-eslint(no-v-html): 'v-html' directive can lead to XSS attack.
    ,-[src/components/UserList.vue:19:25]
 18 |       <strong>{{ user.name }}</strong>
 19 |       <p v-if="showBio" v-html="user.bio" />
    :                         ^^^^^^^^^^^^^^^^^
 20 |     </li>
    `----

  x vue-eslint(require-v-for-key): Elements in iteration expect to have 'v-bind:key' directives.
    ,-[src/components/UserList.vue:17:5]
 16 |   <ul>
 17 |     <li v-for="(user, index) in users">
    :     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 18 |       <strong>{{ user.name }}</strong>
    `----

Found 5 warnings and 2 errors.
```

# stderr
```
```
