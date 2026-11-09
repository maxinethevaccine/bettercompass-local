<template>
  <div class="about">
    <v-container>
      <v-card color="card" class="rounded-xl" elevation="7">
        <v-container class="text-center justify-center">
          <h1
            v-if="$vuetify.breakpoint.mdAndUp"
            class="troplo-title"
            style="font-size: 100px"
          >
            BetterCompass
          </h1>
          <h1
            v-if="$vuetify.breakpoint.smAndDown"
            class="troplo-title"
            style="font-size: 40px"
          >
            BetterCompass
          </h1>
          <p class="subheading">
            BetterCompass is a free, and open source frontend client for JDLF's
            Compass School Manager used by many schools in Australia.
          </p>
          <p class="subheading">
            Originally created by Troplo -
            <a href="https://github.com/Troplo/BetterCompass" target="_blank"
              >upstream project on GitHub</a
            >.
          </p>
          <p class="subheading">
            This is Max's local fork: no proxy, no telemetry to Troplo's
            servers, runs entirely inside your own Compass session.
          </p>
          <v-btn
            text
            type="info"
            fab
            :href="updateRepoUrl"
            target="_blank"
          >
            <v-icon> mdi-github </v-icon> </v-btn
          ><br />
          <small>Local fork source &amp; updates on GitHub</small><br />
          <small
            >BetterCompass version: {{ $store.state.versioning.version }}, built
            on: {{ $store.state.versioning.date }}</small
          ><br />
          <small>Fixed by Max, version {{ extensionVersion }}</small>
        </v-container>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import { UPDATE_REPO_URL, runningVersion } from "@/lib/updateCheck"

export default {
  name: "About",
  computed: {
    updateRepoUrl() {
      return UPDATE_REPO_URL
    },
    extensionVersion() {
      // The version actually running (which may be newer than the
      // installed extension's own manifest version, if bootstrap.js
      // fetched a newer build from GitHub this load).
      return runningVersion() || "unknown"
    }
  }
}
</script>
