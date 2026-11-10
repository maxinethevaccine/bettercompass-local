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
            This is a local fork: no proxy, no telemetry to Troplo's servers,
            runs entirely inside your own Compass session.
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
          <small
            >Fixed by maxinethevaccine, version {{ extensionVersion }} ({{
              sourceLabel
            }})</small
          ><br />
          <v-btn
            small
            class="rounded-xl mt-3 bcx-update-btn"
            @click="checkForUpdates"
          >
            <v-icon left small>mdi-update</v-icon>
            {{ checkLabel }}
          </v-btn>
          <div v-if="checkMessage" class="mt-2">
            <small>{{ checkMessage }}</small>
          </div>
        </v-container>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import {
  UPDATE_REPO_URL,
  runningVersion,
  runningSource,
  updateReadyVersion,
  onUpdateReady,
  onCheckResult,
  checkNow
} from "@/lib/updateCheck"

export default {
  name: "About",
  computed: {
    updateRepoUrl() {
      return UPDATE_REPO_URL
    },
    extensionVersion() {
      return runningVersion() || "unknown"
    },
    sourceLabel() {
      return runningSource() === "github"
        ? "auto-updated from GitHub"
        : "the copy that came with the extension"
    },
    checkLabel() {
      if (this.ready) return "v" + this.ready + " downloaded - reload to use it"
      if (this.checking) return "Checking GitHub..."
      return "Check for updates now"
    },
    checkMessage() {
      if (this.ready) return null
      switch (this.state) {
        case "current":
          return "You are on the latest version."
        case "unreachable":
          return "GitHub could not be reached, so there is no way to tell whether a newer version exists. This also happens when the repository is private."
        case "incomplete":
          return (
            "v" +
            (this.stateVersion || "?") +
            " has been published, but its files could not be downloaded. The release needs BetterCompass-extension.zip attached to it."
          )
        default:
          return null
      }
    }
  },
  data() {
    return {
      checking: false,
      state: null,
      stateVersion: null,
      ready: updateReadyVersion()
    }
  },
  mounted() {
    this.stopUpdateListener = onUpdateReady((version) => {
      this.ready = version
      this.checking = false
    })
    this.stopCheckListener = onCheckResult((state, version) => {
      this.state = state
      this.stateVersion = version
      this.checking = false
    })
  },
  beforeDestroy() {
    if (this.stopUpdateListener) this.stopUpdateListener()
    if (this.stopCheckListener) this.stopCheckListener()
  },
  methods: {
    checkForUpdates() {
      if (this.ready) return window.location.reload()
      this.checking = true
      checkNow()
      setTimeout(() => {
        this.checking = false
      }, 15000)
    }
  }
}
</script>

<style scoped>
/* Vuetify shouts button labels in spaced-out capitals, which looked wrong on
   a sentence this long. Plain sentence case instead. */
.bcx-update-btn >>> .v-btn__content {
  text-transform: none;
  letter-spacing: normal;
  font-weight: 400;
}
</style>
