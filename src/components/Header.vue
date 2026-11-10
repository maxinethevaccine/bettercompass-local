<template>
  <div id="header">
    <v-app-bar app v-if="$store.state.user.bcUser" color="dark">
      <v-app-bar-nav-icon
        @click.stop="drawer = !drawer"
        v-if="$vuetify.breakpoint.mobile"
      ></v-app-bar-nav-icon>
      <v-toolbar-title
        v-if="!$vuetify.breakpoint.mobile"
        :style="
          'color: ' +
          $vuetify.theme.themes[$vuetify.theme.dark ? 'dark' : 'light'].primary
        "
        :class="{ 'troplo-title': !$store.state.user.bcUser.accentColor }"
        @click="$router.push('/')"
        style="cursor: pointer"
        >BetterCompass</v-toolbar-title
      ><v-app-bar-nav-icon
        v-if="
          !$vuetify.breakpoint.mobile && $store.state.site.release !== 'stable'
        "
        style="z-index: 1000"
        disabled
        >{{ $store.state.site.release }}</v-app-bar-nav-icon
      >
      <button
        class="search-button"
        @click="$store.commit('setSearch', true)"
        text
      >
        <v-text-field
          ref="searchInput"
          autocomplete="off"
          class="mx-2 mx-md-4"
          dense
          hide-details
          disabled
          outlined
          placeholder="English"
          :label="
            $vuetify.breakpoint.mobile
              ? 'Search BetterCompass...'
              : 'Search BetterCompass... (CTRL + K)'
          "
          @click="$store.commit('setSearch', true)"
          style="opacity: 1; max-width: 450px"
        >
        </v-text-field>
      </button>
      <button
        style="display: none"
        v-shortkey="['ctrl', 'k']"
        @shortkey="$store.commit('setSearch', true)"
      >
        Debug
      </button>
      <button
        style="display: none"
        v-shortkey="['meta', 'k']"
        @shortkey="$store.commit('setSearch', true)"
      >
        Debug
      </button>
      <button
        style="display: none"
        v-shortkey="['ctrl', 'alt', 's']"
        @shortkey="enableCompassScore"
      >
        Enable CompassScore
      </button>
      <v-spacer></v-spacer>
      <div class="text-end" v-if="$route.name === 'Dashboard'">
        <v-btn
          text
          class="text-end mb-1"
          @click="$store.commit('setEditMode', 'editing')"
          v-if="
            $store.state.editMode !== 'editing' && !$vuetify.breakpoint.mobile
          "
        >
          <v-icon>mdi-pencil</v-icon>&nbsp;Edit
        </v-btn>
        <v-btn
          text
          class="text-end mb-1"
          @click="$store.commit('setEditMode', 'save')"
          v-if="$store.state.editMode === 'editing'"
        >
          <v-icon>mdi-check</v-icon>&nbsp;Save
        </v-btn>
        <v-btn
          text
          class="text-end mb-1"
          @click="$store.commit('setEditMode', 'discard')"
          v-if="$store.state.editMode === 'editing'"
        >
          <v-icon> mdi-close </v-icon>&nbsp;Discard
        </v-btn>
      </div>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            v-bind="attrs"
            v-on="on"
            :href="updateInfo.releaseUrl"
            target="_blank"
          >
            <v-badge
              :value="updateInfo.updateAvailable"
              color="success"
              dot
              overlap
              offset-x="10"
              offset-y="10"
            >
              <v-icon>mdi-github</v-icon>
            </v-badge>
          </v-btn>
        </template>
        <span v-if="updateInfo.updateAvailable">
          v{{ updateInfo.latestVersion }} has been downloaded (you're on v{{
            updateInfo.currentVersion
          }}) - reload the page to use it
        </span>
        <span v-else>Source on GitHub</span>
      </v-tooltip>
      <v-menu
        v-if="$store.state.user.username"
        offset-y
        rounded
        class="rounded-xxl"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn class="rounded-xl" icon v-bind="attrs" v-on="on">
            <v-avatar
              v-if="!$store.state.user.avatar"
              align="center"
              class="text-center"
              size="38"
            >
              <img
                :src="
                  $store.state.user.bcUser.discussionsImage ||
                  $store.state.school.fqdn +
                    '/download/cdn/square/' +
                    $store.state.user.idPhotoGuidVersioned
                "
              />
            </v-avatar>
          </v-btn>
        </template>

        <v-list>
          <v-list-item
            v-for="(item, index) in menus.dropdownAuthenticated"
            :key="item.id"
            :disabled="item.disabled"
            :to="item.path"
            :style="'color:' + item.color"
            @click="handleClickDropdown(index)"
          >
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </v-list-item>
          <template v-if="$store.state.user.admin">
            <v-list-item
              v-for="(item, index) in menus.admin"
              :key="item.id"
              :disabled="item.disabled"
              :to="item.path"
              @click="handleClickDropdown(index)"
            >
              <v-list-item-title>{{ item.name }}</v-list-item-title>
            </v-list-item>
          </template>
          <template
            v-if="$store.state.user.moderator || $store.state.user.admin"
          >
            <v-list-item
              v-for="(item, index) in menus.moderator"
              :key="item.id"
              :disabled="item.disabled"
              :to="item.path"
              @click="handleClickDropdown(index)"
            >
              <v-list-item-title>{{ item.name }}</v-list-item-title>
            </v-list-item>
          </template>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-navigation-drawer
      v-model="drawer"
      v-if="$store.state.user.bcUser"
      app
      color="dark"
      floating
    >
      <v-list-item v-if="$vuetify.breakpoint.mobile">
        <v-list-item-content>
          <v-list-item-title class="text-h6">
            <v-toolbar-title
              v-if="$vuetify.breakpoint.mobile"
              class="text-center justify-center"
              :style="
                'color: ' +
                $vuetify.theme.themes[$vuetify.theme.dark ? 'dark' : 'light']
                  .primary
              "
              :class="{ 'troplo-title': !$store.state.user.bcUser.accentColor }"
              @click="$router.push('/')"
              style="cursor: pointer"
              >BetterCompass</v-toolbar-title
            >
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>
      <v-list dense nav>
        <v-list v-if="$store.state.user.bcUser">
          <v-list>
            <template>
              <v-list-item to="/" :color="active('')">
                <v-list-item-icon>
                  <v-icon>mdi-home</v-icon>
                </v-list-item-icon>

                <v-list-item-title>Home</v-list-item-title>
              </v-list-item>
              <template
                v-if="
                  $store.state.user.baseRole !== 'STUDENT' &&
                  $store.state.online
                "
              >
                <v-list-item
                  :color="active('/user/' + user.userId)"
                  v-for="user in $store.state.user.children"
                  :key="user.userId"
                  :to="'/user/' + user.userId"
                >
                  <v-list-item-icon>
                    <v-icon>mdi-account-child</v-icon>
                  </v-list-item-icon>

                  <v-list-item-title
                    >{{ user.firstName }}'s Profile</v-list-item-title
                  >
                </v-list-item>
              </template>

              <v-list-item
                :to="'/user'"
                v-if="$store.state.online"
                :color="active('/user')"
              >
                <v-list-item-icon>
                  <v-icon>mdi-account</v-icon>
                </v-list-item-icon>

                <v-list-item-title>My Profile</v-list-item-title>
              </v-list-item>

              <v-list-group
                prepend-icon="mdi-pen"
                v-if="$store.state.online"
                :value="true"
              >
                <template v-slot:activator>
                  <v-list-item-title>Curriculum</v-list-item-title>
                </template>

                <v-list-group no-action sub-group>
                  <template v-slot:activator>
                    <v-list-item-content>
                      <v-list-item-title>Pages</v-list-item-title>
                    </v-list-item-content>
                  </template>
                  <v-list-item
                    link
                    :to="'/user/' + $store.state.user.userId + '/tasks'"
                  >
                    <v-list-item-title>Learning Tasks</v-list-item-title>
                  </v-list-item>
                  <v-list-item link to="/school/resources">
                    <v-list-item-title>School Resources</v-list-item-title>
                  </v-list-item>
                  <v-list-item link to="/school/staff">
                    <v-list-item-title>School Staff</v-list-item-title>
                  </v-list-item>
                </v-list-group>

                <v-list-group no-action sub-group :value="true">
                  <template v-slot:activator>
                    <v-list-item-content>
                      <v-list-item-title>Subjects & Classes</v-list-item-title>
                    </v-list-item-content>
                  </template>
                  <v-list-item
                    v-for="subject in $store.state.subjects"
                    :key="subject.id"
                    :to="'/activity/activity/' + subject.id"
                    link
                  >
                    <v-list-item-title>{{
                      subject.subjectLongName
                    }}</v-list-item-title>
                  </v-list-item>
                </v-list-group>
              </v-list-group>
              <v-list-item
                to="/communications"
                v-if="$store.state.site.release === 'dev'"
                :color="active('/communications')"
              >
                <v-list-item-icon>
                  <v-icon>mdi-android-messages</v-icon>
                </v-list-item-icon>

                <v-list-item-title>Communications</v-list-item-title>
              </v-list-item>
              <v-list-item
                :to="'/user/events'"
                v-if="$store.state.online"
                :color="active('/user/events')"
              >
                <v-list-item-icon>
                  <v-icon>mdi-swim</v-icon>
                </v-list-item-icon>

                <v-list-item-title>Events</v-list-item-title>
              </v-list-item>
              <v-list-item to="/changelog" :color="active('/changelog')">
                <v-list-item-icon>
                  <v-icon>mdi-git</v-icon>
                </v-list-item-icon>

                <v-list-item-title>Changelog</v-list-item-title>
              </v-list-item>
              <v-list-item
                to="/everything"
                v-if="debugModeEnabled"
                :color="active('/everything')"
              >
                <v-list-item-icon>
                  <v-icon>mdi-magnify</v-icon>
                </v-list-item-icon>

                <v-list-item-title>Everything</v-list-item-title>
              </v-list-item>
              <v-list-item to="/admin" v-if="$store.state.user.bcUser.admin">
                <v-list-item-icon>
                  <v-icon>mdi-gavel</v-icon>
                </v-list-item-icon>

                <v-list-item-title>Admin</v-list-item-title>
              </v-list-item>
              <v-list-item to="/about" :color="active('/about')">
                <v-list-item-icon>
                  <v-icon>mdi-information</v-icon>
                </v-list-item-icon>

                <v-list-item-title>About BetterCompass</v-list-item-title>
              </v-list-item>
            </template>
          </v-list>
        </v-list>
        <v-list v-else>
          <v-list-item two-line>
            <v-list-item-avatar>
              <v-icon x-large>mdi-account-circle</v-icon>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title>Please login</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list>
            <v-list-item
              v-for="(item, index) in menus.default"
              :key="index"
              :to="item.path"
              link
              @click="handleClick(index)"
            >
              <v-list-item-icon>
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>{{ item.name }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-list>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
import {
  UPDATE_REPO_URL,
  runningVersion,
  updateReadyVersion,
  onUpdateReady
} from "@/lib/updateCheck"

export default {
  name: "Header",
  data() {
    return {
      report: false,
      drawer: true,
      updateInfo: {
        updateAvailable: false,
        latestVersion: null,
        releaseUrl: UPDATE_REPO_URL + "/releases",
        currentVersion: null
      },
      menus: {
        dropdownAuthenticated: [
          {
            id: 7,
            name: "My Account",
            click() {},
            path: "/user",
            icon: "mdi-settings"
          },
          {
            id: 6,
            name: "BetterCompass Settings",
            path: "/user/settings",
            icon: "mdi-settings"
          },
          {
            id: 8,
            name: "Logout",
            click() {
              this.$store.dispatch("logout")
              this.$router.push("/login")
            },
            color: "#c53030",
            icon: "mdi-settings"
          }
        ],
        debug: [],
        default: [
          {
            id: 1,
            name: "Login",
            path: "/login",
            icon: "mdi-login",
            click() {}
          }
        ],
        authenticated: [
          {
            id: 3,
            name: "Dashboard",
            path: "/",
            icon: "mdi-view-dashboard",
            click() {}
          },
          {
            id: 4,
            name: "Profile",
            path: "/profile",
            icon: "mdi-account",
            click() {}
          },
          {
            id: 5,
            name: "Settings",
            path: "/settings",
            icon: "mdi-settings",
            click() {}
          }
        ]
      }
    }
  },
  computed: {
    debugModeEnabled() {
      if (localStorage.getItem("debugModeEnabled")) {
        return JSON.parse(localStorage.getItem("debugModeEnabled"))
      } else {
        return false
      }
    },
    navColor() {
      if (this.$vuetify.theme.dark) {
        return "#181818"
      } else {
        return "#FFFFFF"
      }
    }
  },
  methods: {
    saveGrid() {
      this.$store.dispatch("saveOnlineSettings", {
        homeGrids: this.$store.state.user.bcUser.homeGrids
      })
      this.$store.dispatch("getUserInfo")
    },
    enableCompassScore() {
      this.$toast.success("Enabled CompassScore")
      localStorage.setItem("compassScoreEnabled", true)
    },
    handleClickDropdown(index) {
      this.menus.selected = index
      this.menus.dropdownAuthenticated[index].click.call(this)
    },
    active(path) {
      if (
        path === this.$route?.matched[0]?.path ||
        path === this.$route?.path
      ) {
        return this.$vuetify.theme.themes[
          this.$vuetify.theme.dark ? "dark" : "light"
        ].primary
      } else {
        return null
      }
    },
    handleClick(index) {
      this.menus.selected = this.$route.name
      this.menus.authenticated[index].click.call(this)
    }
  },
  mounted() {
    if (this.$vuetify.breakpoint.mobile) {
      this.drawer = false
    }
    const showUpdate = (version) => {
      if (!version) return
      this.updateInfo = {
        updateAvailable: true,
        latestVersion: version,
        releaseUrl: UPDATE_REPO_URL + "/releases",
        currentVersion: runningVersion()
      }
    }
    showUpdate(updateReadyVersion())
    this.stopUpdateListener = onUpdateReady(showUpdate)
  },
  beforeDestroy() {
    if (this.stopUpdateListener) this.stopUpdateListener()
  },
  watch: {
    "$store.state.user.bcUser"() {
      this.menus.dropdownAuthenticated = [
        {
          id: 7,
          name: "My Account",
          click() {},
          path: "/user/" + this.$store.state.user?.userId,
          icon: "mdi-settings"
        },
        {
          id: 6,
          name: "BetterCompass Settings",
          path: "/user/" + this.$store.state.user?.userId + "/settings",
          icon: "mdi-settings"
        },
        {
          id: 8,
          name: "Logout",
          click() {
            this.$store.dispatch("logout")
            this.$router.push("/login")
          },
          color: "#c53030",
          icon: "mdi-settings"
        }
      ]
    }
  }
}
</script>

<style scoped></style>
